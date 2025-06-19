import express from "express";
import session from "express-session";
import helmet from "helmet";
import { Pool } from "pg";
import { parse } from "pg-connection-string"; // Importar para parsear la URL de la DB
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fetch from "node-fetch";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";

const app = express();
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://s3.tradingview.com"],
      "connect-src": [
        "'self'",
        "wss://stream.binance.com",
        "wss://ws.twelvedata.com",
        "https://*.twelvedata.com",
        "https://*.binance.com",
        "https://bulltrodat-backend.onrender.com",
      ],
    },
  })
);
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// =================================================================
// CONFIGURACIÓN DESDE VARIABLES DE ENTORNO
// =================================================================
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
let REGISTRATION_CODE = process.env.REGISTRATION_CODE || "ADMIN2024";

if (!TWELVE_DATA_API_KEY || !ALPHA_VANTAGE_API_KEY) {
  console.error(
    "CRITICAL: API keys for Twelve Data or Alpha Vantage are not set in environment variables."
  );
}

const initialCrypto = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "BNBUSDT"];
const initialStocks = [
  "AAPL",
  "AMZN",
  "GOOGL",
  "META",
  "TSLA",
  "MSFT",
  "NVDA",
  "IBM",
];
const initialForex = [
  "EURUSD",
  "USDJPY",
  "GBPUSD",
  "AUDUSD",
  "EURJPY",
  "GBPJPY",
  "AUDJPY",
];
const initialCommodities = ["XAGUSD", "XAUUSD"];

// =================================================================
// ESTADO GLOBAL DE SUSCRIPCIONES (DINÁMICO)
// =================================================================
let binanceWs = null;
let twelveDataWs = null;
const activeBinanceSubscriptions = new Set(initialCrypto);
const activeTwelveDataSubscriptions = new Set([
  ...initialStocks,
  ...initialForex,
  ...initialCommodities,
]);
const usuariosSockets = {};

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

const knownCurrencies = new Set([
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "AUD",
  "CAD",
  "CHF",
  "NZD",
  "CNY",
  "HKD",
  "SGD",
  "MXN",
  "XAU",
  "XAG",
]);

const getSymbolType = (symbol) => {
  const s = symbol.toUpperCase();
  if (s.endsWith("USDT")) return "crypto";
  if (s.length === 6) {
    const base = s.substring(0, 3);
    const quote = s.substring(3, 6);
    if (knownCurrencies.has(base) && knownCurrencies.has(quote)) {
      return "forex/commodity";
    }
  }
  return "stock";
};

const getTwelveDataSymbolFormat = (symbol) => {
  const s = symbol.toUpperCase();
  if (getSymbolType(s) === "forex/commodity") {
    return `${s.slice(0, 3)}/${s.slice(3)}`;
  }
  return s;
};

// =================================================================
// WEBSOCKETS DINÁMICOS
// =================================================================
function subscribeToBinance(symbols) {
  if (binanceWs && binanceWs.readyState === WebSocket.OPEN) {
    console.log(
      `🔷 Subscribing to ${symbols.length} symbols on Binance: ${symbols.join(
        ", "
      )}`
    );
    binanceWs.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: symbols.map((s) => `${s.toLowerCase()}@trade`),
        id: Date.now(),
      })
    );
  }
}

function subscribeToTwelveData(symbols) {
  if (twelveDataWs && twelveDataWs.readyState === WebSocket.OPEN) {
    console.log(
      `🔷 Subscribing to ${
        symbols.length
      } symbols on Twelve Data: ${symbols.join(", ")}`
    );
    twelveDataWs.send(
      JSON.stringify({
        action: "subscribe",
        params: { symbols: symbols.map(getTwelveDataSymbolFormat).join(",") },
      })
    );
  }
}

function iniciarWebSocketBinance() {
  const url = `wss://stream.binance.com:9443/ws`;
  binanceWs = new WebSocket(url);

  binanceWs.on("open", () => {
    console.log("✅ WebSocket connected to Binance");
    if (activeBinanceSubscriptions.size > 0) {
      subscribeToBinance(Array.from(activeBinanceSubscriptions));
    }
  });

  binanceWs.on("message", (data) => {
    try {
      const mensaje = JSON.parse(data);
      if (mensaje.s && mensaje.p) {
        const upperSymbol = mensaje.s.toUpperCase();
        global.preciosEnTiempoReal[upperSymbol] = parseFloat(mensaje.p);
        broadcast({
          type: "price_update",
          prices: { [upperSymbol]: parseFloat(mensaje.p) },
        });
      }
    } catch (err) {
      console.error("❌ Error processing message from Binance:", err);
    }
  });

  binanceWs.on("close", () => {
    console.warn("🔁 Binance WebSocket closed, reconnecting...");
    setTimeout(iniciarWebSocketBinance, 3000);
  });
  binanceWs.on("error", (err) => {
    console.error("❌ Binance WebSocket error:", err.message);
    binanceWs.close();
  });
}

let twelveDataRetryTimeout = 5000;
const MAX_RETRY_TIMEOUT = 60000;

function iniciarWebSocketTwelveData() {
  if (!TWELVE_DATA_API_KEY) {
    console.error("🚫 Twelve Data WebSocket not started: API Key is missing.");
    return;
  }
  twelveDataWs = new WebSocket(
    `wss://ws.twelvedata.com/v1/quotes/price?apikey=${TWELVE_DATA_API_KEY}`
  );

  twelveDataWs.on("open", () => {
    console.log("✅ WebSocket connected to Twelve Data");
    twelveDataRetryTimeout = 5000;
    if (activeTwelveDataSubscriptions.size > 0) {
      subscribeToTwelveData(Array.from(activeTwelveDataSubscriptions));
    }
  });

  twelveDataWs.on("message", (data) => {
    try {
      const message = JSON.parse(data);
      if (message.event === "price") {
        const internalSymbol = message.symbol.replace("/", "").toUpperCase();
        const price = parseFloat(message.price);
        global.preciosEnTiempoReal[internalSymbol] = price;
        broadcast({
          type: "price_update",
          prices: { [internalSymbol]: price },
        });
      } else if (message.event === "subscribe-status") {
        console.log("📈 Twelve Data subscription status:", message);
      } else if (message.event === "error") {
        console.error("❌ Twelve Data API error:", message);
      }
    } catch (err) {
      console.error("❌ Error processing message from Twelve Data:", err);
    }
  });

  twelveDataWs.on("close", () => {
    console.warn(
      `🔁 Twelve Data WebSocket closed. Retrying in ${
        twelveDataRetryTimeout / 1000
      }s...`
    );
    setTimeout(iniciarWebSocketTwelveData, twelveDataRetryTimeout);
    twelveDataRetryTimeout = Math.min(
      twelveDataRetryTimeout * 2,
      MAX_RETRY_TIMEOUT
    );
  });

  twelveDataWs.on("error", (err) => {
    console.error("❌ Twelve Data WebSocket error:", err.message);
    twelveDataWs.close();
  });
}

// --- MANEJO DE MENSAJES DEL CLIENTE ---
wss.on("connection", (ws, req) => {
  const userId = req.session.userId;
  if (!userId) {
    ws.close(1008, "User not authenticated");
    return;
  }
  console.log(`✅ WebSocket client connected: ${userId}`);
  usuariosSockets[userId] = ws;

  ws.send(
    JSON.stringify({ type: "price_update", prices: global.preciosEnTiempoReal })
  );

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === "subscribe" && Array.isArray(data.symbols)) {
        const newBinanceSymbols = [];
        const newTwelveDataSymbols = [];

        data.symbols.forEach((symbol) => {
          const type = getSymbolType(symbol);
          if (type === "crypto") {
            if (!activeBinanceSubscriptions.has(symbol)) {
              activeBinanceSubscriptions.add(symbol);
              newBinanceSymbols.push(symbol);
            }
          } else {
            if (!activeTwelveDataSubscriptions.has(symbol)) {
              activeTwelveDataSubscriptions.add(symbol);
              newTwelveDataSymbols.push(symbol);
            }
          }
        });

        if (newBinanceSymbols.length > 0) subscribeToBinance(newBinanceSymbols);
        if (newTwelveDataSymbols.length > 0)
          subscribeToTwelveData(newTwelveDataSymbols);
      }
    } catch (error) {
      console.error("Error processing client message:", error);
    }
  });

  ws.on("close", () => {
    console.log(`🔌 WebSocket client disconnected: ${userId}`);
    delete usuariosSockets[userId];
  });
});

async function getLatestPrice(symbol) {
  return global.preciosEnTiempoReal[symbol.toUpperCase()] || null;
}

async function getFreshPriceFromApi(symbol) {
  const upperSymbol = symbol.toUpperCase();
  const type = getSymbolType(upperSymbol);

  try {
    if (type === "crypto") {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${upperSymbol}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return parseFloat(data.price);
    }

    if (type === "forex/commodity" || type === "stock") {
      const twelveDataSymbol = getTwelveDataSymbolFormat(upperSymbol);
      const tdResponse = await fetch(
        `https://api.twelvedata.com/price?symbol=${twelveDataSymbol}&apikey=${TWELVE_DATA_API_KEY}`
      );
      if (tdResponse.ok) {
        const tdData = await tdResponse.json();
        if (tdData.price) {
          return parseFloat(tdData.price);
        }
      }

      const from_currency = upperSymbol.substring(0, 3);
      const to_currency = upperSymbol.substring(3, 6);
      let avResponse;

      if (type === "forex/commodity") {
        avResponse = await fetch(
          `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from_currency}&to_currency=${to_currency}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
      } else {
        avResponse = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${upperSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
      }

      if (avResponse.ok) {
        const avData = await avResponse.json();
        if (avData["Global Quote"] && avData["Global Quote"]["05. price"]) {
          return parseFloat(avData["Global Quote"]["05. price"]);
        }
        if (
          avData["Realtime Currency Exchange Rate"] &&
          avData["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
        ) {
          return parseFloat(
            avData["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
          );
        }
      }
      return null;
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
  return null;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.preciosEnTiempoReal = {};

const port = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE BASE DE DATOS Y MIDDLEWARE ---
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}
const dbConfig = parse(connectionString);
const db = new Pool({
  ...dbConfig,
  ssl: {
    rejectUnauthorized: false, // Required for Render connections
  },
});

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is not set.");
}
const sessionParser = session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
});

const frontendUrl = process.env.FRONTEND_URL;
if (!frontendUrl) {
  console.warn(
    "WARNING: FRONTEND_URL is not set. CORS might block your frontend."
  );
}
const allowedOrigins = [frontendUrl];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin && process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(sessionParser);

// --- RUTAS DE AUTENTICACIÓN Y USUARIO ---
app.post("/register", async (req, res) => {
  const { nombre, email, password, codigo } = req.body;
  if (codigo !== REGISTRATION_CODE) {
    return res.status(403).json({ error: "Código de registro inválido." });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO usuarios (nombre, email, password, rol, balance, balance_real) VALUES ($1, $2, $3, 'usuario', 10000, 0)",
      [nombre, email, hash]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      // Unique constraint violation
      return res.status(409).json({ error: "El email ya está registrado." });
    }
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(
      "SELECT id, nombre, email, password, rol, identificacion, telefono FROM usuarios WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.userId = user.id;
      req.session.rol = user.rol;
      const { password: _, ...userToSend } = user;
      res.json({ success: true, user: userToSend });
    } else {
      res.status(401).json({ error: "Credenciales inválidas" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

app.get("/me", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const result = await db.query(
      "SELECT id, nombre, email, balance, rol, identificacion, telefono FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

app.put("/me/profile", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  const { identificacion, telefono } = req.body;
  try {
    const result = await db.query(
      "UPDATE usuarios SET identificacion = $1, telefono = $2 WHERE id = $3 RETURNING *",
      [identificacion, telefono, req.session.userId]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// --- RUTAS DE OPERACIONES ---
app.post("/operar", async (req, res) => {
  const {
    activo,
    tipo_operacion,
    volumen,
    precio_entrada,
    take_profit,
    stop_loss,
  } = req.body;
  const usuario_id = req.session.userId;
  if (!usuario_id) return res.status(401).json({ error: "No autenticado" });

  try {
    await db.query("BEGIN");
    const userRes = await db.query(
      "SELECT balance FROM usuarios WHERE id = $1 FOR UPDATE",
      [usuario_id]
    );
    const balanceActual = parseFloat(userRes.rows[0].balance);
    const costo = precio_entrada * volumen;

    if (balanceActual < costo) {
      await db.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, error: "Fondos insuficientes" });
    }

    await db.query(
      `INSERT INTO operaciones (usuario_id, activo, tipo_operacion, volumen, precio_entrada, capital_invertido, fecha, cerrada, take_profit, stop_loss) VALUES ($1, $2, $3, $4, $5, $6, NOW(), false, $7, $8)`,
      [
        usuario_id,
        activo,
        tipo_operacion,
        volumen,
        precio_entrada,
        costo,
        take_profit,
        stop_loss,
      ]
    );

    await db.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al operar" });
  }
});

app.get("/historial", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const filter = req.query.filter || "todas";
  const offset = (page - 1) * limit;
  let filterClause = "";
  const queryParams = [req.session.userId];
  if (filter === "abiertas") {
    filterClause = "AND cerrada = false";
  } else if (filter === "cerradas") {
    filterClause = "AND cerrada = true";
  }
  try {
    const totalResult = await db.query(
      `SELECT COUNT(*) FROM operaciones WHERE usuario_id = $1 ${filterClause}`,
      queryParams
    );
    const totalOperations = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalOperations / limit);
    queryParams.push(limit, offset);
    const result = await db.query(
      `SELECT * FROM operaciones WHERE usuario_id = $1 ${filterClause} ORDER BY fecha DESC LIMIT $2 OFFSET $3`,
      queryParams
    );
    res.json({
      operations: result.rows,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

app.post("/cerrar-operacion", async (req, res) => {
  const { operacion_id } = req.body;
  const usuario_id = req.session.userId;
  if (!usuario_id) return res.status(401).json({ error: "No autenticado" });

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT * FROM operaciones WHERE id = $1 AND usuario_id = $2 AND cerrada = false FOR UPDATE",
      [operacion_id, usuario_id]
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      client.release();
      return res
        .status(404)
        .json({ error: "Operación no encontrada o ya cerrada" });
    }

    const op = rows[0];
    const { activo, tipo_operacion, volumen, precio_entrada } = op;
    const precioActual = await getFreshPriceFromApi(activo);
    if (precioActual === null) {
      await client.query("ROLLBACK");
      client.release();
      return res
        .status(500)
        .json({ error: `Precio para ${activo} no disponible.` });
    }

    const tipo = tipo_operacion.toLowerCase();
    let gananciaFinal = 0;
    if (tipo === "compra" || tipo === "buy") {
      gananciaFinal = (precioActual - precio_entrada) * volumen;
    } else if (tipo === "venta" || tipo === "sell") {
      gananciaFinal = (precio_entrada - precioActual) * volumen;
    }

    if (isNaN(gananciaFinal)) {
      await client.query("ROLLBACK");
      client.release();
      return res.status(400).json({ error: "Cálculo de ganancia inválido" });
    }

    await client.query(
      "UPDATE operaciones SET cerrada = true, ganancia = $1, precio_cierre = $2 WHERE id = $3",
      [gananciaFinal, precioActual, operacion_id]
    );
    await client.query(
      "UPDATE usuarios SET balance = balance + $1 WHERE id = $2",
      [gananciaFinal, usuario_id]
    );

    await client.query("COMMIT");
    client.release();
    res.json({ success: true, gananciaFinal, precio_cierre: precioActual });
  } catch (err) {
    await client.query("ROLLBACK");
    client.release();
    console.error(err);
    res.status(500).json({ error: "Error interno al cerrar la operación." });
  }
});

app.get("/balance", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const result = await db.query(
      "SELECT balance FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener balance" });
  }
});

app.get("/estadisticas", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const { rows } = await db.query(
      `SELECT SUM(precio_entrada * volumen) AS total_invertido, SUM(CASE WHEN cerrada THEN ganancia ELSE 0 END) AS ganancia_total, COUNT(*) FILTER (WHERE cerrada) AS cerradas, COUNT(*) FILTER (WHERE NOT cerrada) AS abiertas FROM operaciones WHERE usuario_id = $1`,
      [req.session.userId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

app.get("/rendimiento", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const { rows } = await db.query(
      `SELECT DATE(fecha) as fecha, SUM(ganancia) as ganancia_dia FROM operaciones WHERE usuario_id = $1 AND cerrada = true GROUP BY DATE(fecha) ORDER BY fecha ASC`,
      [req.session.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener rendimiento" });
  }
});

// --- RUTAS DE ADMIN ---
app.get("/usuarios", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    const totalResult = await db.query("SELECT COUNT(*) FROM usuarios");
    const totalUsers = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);
    const usuariosResult = await db.query(
      "SELECT id, nombre, email, balance, rol, identificacion, telefono FROM usuarios ORDER BY id ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    res.json({ users: usuariosResult.rows, totalPages, currentPage: page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

app.post("/actualizar-usuario", async (req, res) => {
  const {
    id,
    nombre,
    email,
    balance,
    rol,
    identificacion,
    telefono,
    password,
  } = req.body;
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const result = await db.query("SELECT rol FROM usuarios WHERE id = $1", [
      req.session.userId,
    ]);
    if (result.rows[0].rol !== "admin")
      return res.status(403).json({ error: "No autorizado" });
    let updateQuery =
      "UPDATE usuarios SET nombre = $2, email = $3, balance = $4, rol = $5, identificacion = $6, telefono = $7";
    const queryParams = [
      id,
      nombre,
      email,
      balance,
      rol,
      identificacion,
      telefono,
    ];
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updateQuery += `, password = $${queryParams.length + 1}`;
      queryParams.push(hash);
    }
    updateQuery += ` WHERE id = $1`;
    await db.query(updateQuery, queryParams);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }
    const { id } = req.params;
    if (parseInt(id) === req.session.userId) {
      return res
        .status(400)
        .json({ error: "No puedes eliminarte a ti mismo." });
    }
    await db.query("BEGIN");
    await db.query("DELETE FROM operaciones WHERE usuario_id = $1", [id]);
    await db.query("DELETE FROM usuarios WHERE id = $1", [id]);
    await db.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

app.get("/admin-operaciones/:usuarioId", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    const { usuarioId } = req.params;
    const totalResult = await db.query(
      "SELECT COUNT(*) FROM operaciones WHERE usuario_id = $1",
      [usuarioId]
    );
    const totalOps = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalOps / limit);
    const [usuario, operaciones] = await Promise.all([
      db.query("SELECT nombre FROM usuarios WHERE id = $1", [usuarioId]),
      db.query(
        "SELECT * FROM operaciones WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT $2 OFFSET $3",
        [usuarioId, limit, offset]
      ),
    ]);
    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({
      nombre: usuario.rows[0].nombre,
      operaciones: operaciones.rows,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener operaciones" });
  }
});

app.post("/actualizar-precio", async (req, res) => {
  const { id, nuevoPrecio } = req.body;
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }
    await db.query("UPDATE operaciones SET precio_entrada = $1 WHERE id = $2", [
      nuevoPrecio,
      id,
    ]);
    await cerrarOperacionesAutomáticamente(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar precio" });
  }
});

app.get("/admin/registration-code", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }
    res.json({ code: REGISTRATION_CODE });
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

app.post("/admin/registration-code", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }
    const { newCode } = req.body;
    if (!newCode || typeof newCode !== "string") {
      return res.status(400).json({ error: "Código inválido" });
    }
    REGISTRATION_CODE = newCode;
    console.log(`✅ Código de registro cambiado a: ${REGISTRATION_CODE}`);
    res.json({ success: true, newCode: REGISTRATION_CODE });
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

async function cerrarOperacionesAutomáticamente(operationId = null) {
  try {
    let query = `
        SELECT o.id, o.usuario_id, o.activo, o.tipo_operacion, o.volumen, o.precio_entrada,
               o.take_profit, o.stop_loss, o.fecha, u.balance
        FROM operaciones o
        JOIN usuarios u ON o.usuario_id = u.id
        WHERE o.cerrada = false 
          AND (o.take_profit IS NOT NULL OR o.stop_loss IS NOT NULL)
      `;
    const queryParams = [];

    if (operationId) {
      query += ` AND o.id = $1`;
      queryParams.push(operationId);
    }

    const { rows: operaciones } = await db.query(query, queryParams);

    for (const op of operaciones) {
      const operationTime = new Date(op.fecha).getTime();
      const now = new Date().getTime();
      const gracePeriod = 15 * 1000;

      if (now - operationTime < gracePeriod && !operationId) {
        continue;
      }

      const precioActual = await getLatestPrice(op.activo);
      if (!precioActual) continue;

      let cerrar = false;
      let ganancia = 0;

      const volumen = parseFloat(op.volumen);
      const entrada = parseFloat(op.precio_entrada);
      const tp = op.take_profit ? parseFloat(op.take_profit) : null;
      const sl = op.stop_loss ? parseFloat(op.stop_loss) : null;
      const tipo = op.tipo_operacion.toLowerCase();

      if (tipo === "buy" || tipo === "compra") {
        if ((tp && precioActual >= tp) || (sl && precioActual <= sl)) {
          cerrar = true;
        }
      } else if (tipo === "sell" || tipo === "venta") {
        if ((tp && precioActual <= tp) || (sl && precioActual >= sl)) {
          cerrar = true;
        }
      }

      if (cerrar) {
        if (tipo === "buy" || tipo === "compra") {
          ganancia = (precioActual - entrada) * volumen;
        } else {
          ganancia = (entrada - precioActual) * volumen;
        }

        const tipoCierre = ganancia >= 0 ? "tp" : "sl";
        const socket = usuariosSockets[op.usuario_id];
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              tipo: "operacion_cerrada",
              operacion_id: op.id,
              tipoCierre,
              activo: op.activo,
              ganancia,
            })
          );
        }
        await db.query("BEGIN");
        await db.query(
          "UPDATE operaciones SET cerrada = true, ganancia = $1, precio_cierre = $2 WHERE id = $3",
          [ganancia, precioActual, op.id]
        );
        await db.query(
          "UPDATE usuarios SET balance = balance + $1 WHERE id = $2",
          [ganancia, op.usuario_id]
        );
        await db.query("COMMIT");
        console.log(
          `✔️ Operación #${op.id} cerrada automáticamente por ${tipoCierre}.`
        );
      }
    }
  } catch (err) {
    console.error("❌ Error al cerrar operaciones automáticamente:", err);
    await db.query("ROLLBACK");
  }
}

// --- INICIO DEL SERVIDOR ---
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);

  iniciarWebSocketBinance();
  iniciarWebSocketTwelveData();

  setInterval(() => cerrarOperacionesAutomáticamente(), 1500);
});

server.on("upgrade", (request, socket, head) => {
  sessionParser(request, {}, () => {
    if (!request.session.userId) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });
});
