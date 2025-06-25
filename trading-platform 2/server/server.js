import express from "express";
import session from "express-session";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";
import { parse } from "pg-connection-string";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fetch from "node-fetch";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import helmet from "helmet";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// --- Carga de Variables de Entorno ---
const {
  DATABASE_URL,
  SESSION_SECRET,
  TWELVE_DATA_API_KEY,
  ALPHA_VANTAGE_API_KEY,
  REGISTRATION_CODE = "ADMIN2024",
  FRONTEND_URLS, // CAMBIO: Ahora esperamos una lista de URLs separadas por comas
  NODE_ENV,
  PORT = 3000,
} = process.env;

// Validar que las variables críticas existan
if (!DATABASE_URL || !SESSION_SECRET || !FRONTEND_URLS) {
  console.error(
    "CRITICAL ERROR: DATABASE_URL, SESSION_SECRET, or FRONTEND_URLS is not set."
  );
  process.exit(1);
}

// --- Configuración de la Base de Datos ---
const { Pool } = pg;
const dbConfig = parse(DATABASE_URL);
const pool = new Pool({
  ...dbConfig,
  ssl: {
    rejectUnauthorized: false,
  },
});

// --- Configuración de Middlewares ---
if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// CAMBIO: Leer múltiples URLs para CORS
const allowedOrigins = FRONTEND_URLS.split(",").map((url) => url.trim());
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        (!origin && NODE_ENV !== "production")
      ) {
        callback(null, true);
      } else {
        console.error(`CORS Error: Origen no permitido: ${origin}`);
        callback(
          new Error("CORS policy does not allow access from this origin."),
          false
        );
      }
    },
    credentials: true,
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://s3.tradingview.com"],
      "connect-src": ["'self'", "wss:", "https:"],
    },
  })
);

app.use(express.json());

// --- Configuración de Sesiones Persistentes ---
const PgSession = connectPgSimple(session);
const sessionMiddleware = session({
  store: new PgSession({
    pool: pool,
    tableName: "user_sessions",
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: NODE_ENV === "production" ? "none" : "lax",
  },
});
app.use(sessionMiddleware);

// --- Lógica de WebSockets ---
global.preciosEnTiempoReal = {};
const usuariosSockets = {};

const initialCrypto = [
  "BTC-USDT",
  "ETH-USDT",
  "SOL-USDT",
  "XRP-USDT",
  "BNB-USDT",
  "DOGE-USDT",
  "ADA-USDT",
  "AVAX-USDT",
  "TRX-USDT",
  "DOT-USDT",
];
const initialStocks = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "ORCL",
  "ADBE",
  "CRM",
  "AVGO",
  "QCOM",
  "INTC",
  "AMD",
  "TXN",
  "MU",
  "JPM",
  "BAC",
  "WFC",
  "GS",
  "MS",
  "C",
  "V",
  "MA",
  "AXP",
  "PYPL",
  "UNH",
  "JNJ",
  "LLY",
  "PFE",
  "MRK",
  "ABBV",
  "TMO",
  "HD",
  "NKE",
  "MCD",
  "SBUX",
  "DIS",
  "F",
  "GM",
  "PG",
  "KO",
  "PEP",
  "WMT",
  "COST",
  "CAT",
  "BA",
  "GE",
  "HON",
  "UNP",
  "XOM",
  "CVX",
  "SLB",
  "SPY",
  "QQQ",
  "DIA",
];
const initialForex = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "USD/CAD",
  "AUD/USD",
  "NZD/USD",
  "EUR/GBP",
  "EUR/JPY",
  "EUR/CHF",
  "EUR/AUD",
  "EUR/CAD",
  "GBP/JPY",
  "GBP/CHF",
  "GBP/AUD",
  "AUD/JPY",
  "CAD/JPY",
  "CHF/JPY",
];
const initialCommodities = [
  "WTI/USD",
  "BRENT/USD",
  "XAU/USD",
  "XAG/USD",
  "XPT/USD",
  "XPD/USD",
  "XCU/USD",
];

let kuCoinWs = null;
let twelveDataWs = null;
const activeKuCoinSubscriptions = new Set(initialCrypto);
const activeTwelveDataSubscriptions = new Set([
  ...initialStocks,
  ...initialForex,
  ...initialCommodities,
]);
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
  "XPT",
  "XPD",
  "XCU",
]);

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
const getSymbolType = (symbol) => {
  const s = symbol.toUpperCase();
  if (s.includes("-USDT") || s.endsWith("USDT")) {
    return "crypto";
  }
  if (s.includes("/")) {
    return "forex/commodity";
  }
  if (s.length === 6) {
    const base = s.substring(0, 3);
    const quote = s.substring(3, 6);
    if (knownCurrencies.has(base) && knownCurrencies.has(quote)) {
      return "forex/commodity";
    }
  }
  return "stock";
};
const getKuCoinSymbolFormat = (symbol) => {
  const s = symbol.toUpperCase();
  if (s.endsWith("USDT") && !s.includes("-")) {
    return `${s.slice(0, -4)}-USDT`;
  }
  return s;
};
const getTwelveDataSymbolFormat = (symbol) => {
  const s = symbol.toUpperCase();
  if (getSymbolType(s) === "forex/commodity" && !s.includes("/")) {
    return `${s.slice(0, 3)}/${s.slice(3)}`;
  }
  return s;
};
function subscribeToKuCoin(symbols) {
  if (kuCoinWs && kuCoinWs.readyState === WebSocket.OPEN) {
    const topic = `/market/ticker:${symbols.join(",")}`;
    console.log(`🔷 Subscribing to KuCoin topic: ${topic}`);
    kuCoinWs.send(
      JSON.stringify({
        id: Date.now(),
        type: "subscribe",
        topic: topic,
        privateChannel: false,
        response: true,
      })
    );
  }
}
function subscribeToTwelveData(symbols) {
  if (twelveDataWs && twelveDataWs.readyState === WebSocket.OPEN) {
    const formattedSymbols = symbols.map(getTwelveDataSymbolFormat);
    console.log(
      `🔷 Subscribing to ${
        formattedSymbols.length
      } symbols on Twelve Data: ${formattedSymbols.join(", ")}`
    );
    twelveDataWs.send(
      JSON.stringify({
        action: "subscribe",
        params: { symbols: formattedSymbols.join(",") },
      })
    );
  }
}
async function iniciarWebSocketKuCoin() {
  try {
    console.log("Solicitando token para WebSocket de KuCoin...");
    const tokenResponse = await fetch(
      "https://api.kucoin.com/api/v1/bullet-public",
      { method: "POST" }
    );
    if (!tokenResponse.ok)
      throw new Error(
        `Failed to get KuCoin token: ${tokenResponse.statusText}`
      );
    const tokenData = await tokenResponse.json();
    const { token, instanceServers } = tokenData.data;
    if (!token || !instanceServers || instanceServers.length === 0)
      throw new Error("Invalid token or server data from KuCoin");

    const endpoint = instanceServers[0].endpoint;
    const wsUrl = `${endpoint}?token=${token}`;
    console.log("✅ Conectando al WebSocket de KuCoin...");
    kuCoinWs = new WebSocket(wsUrl);
    kuCoinWs.on("open", () => {
      console.log("✅ WebSocket conectado a KuCoin");
      if (activeKuCoinSubscriptions.size > 0)
        subscribeToKuCoin(Array.from(activeKuCoinSubscriptions));
      setInterval(() => {
        if (kuCoinWs.readyState === WebSocket.OPEN)
          kuCoinWs.send(JSON.stringify({ id: Date.now(), type: "ping" }));
      }, 15000);
    });
    kuCoinWs.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        if (message.type === "message" && message.subject === "trade.ticker") {
          const symbolWithDash = message.topic.split(":")[1];
          const symbol = symbolWithDash.replace("-", "");
          const price = parseFloat(message.data.price);
          global.preciosEnTiempoReal[symbol] = price;
          broadcast({ type: "price_update", prices: { [symbol]: price } });
        }
      } catch (err) {
        console.error("❌ Error procesando mensaje de KuCoin:", err);
      }
    });
    kuCoinWs.on("close", () => {
      console.warn("🔁 KuCoin WebSocket cerrado, reconectando...");
      setTimeout(iniciarWebSocketKuCoin, 5000);
    });
    kuCoinWs.on("error", (err) => {
      console.error("❌ Error WebSocket KuCoin:", err.message);
      kuCoinWs.close();
    });
  } catch (error) {
    console.error("❌ Fallo al iniciar la conexión con KuCoin:", error);
    setTimeout(iniciarWebSocketKuCoin, 10000);
  }
}
function iniciarWebSocketTwelveData() {
  if (!TWELVE_DATA_API_KEY) {
    console.error("🚫 Twelve Data WebSocket not started: API Key is missing.");
    return;
  }
  let twelveDataRetryTimeout = 5000;
  const MAX_RETRY_TIMEOUT = 60000;
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
async function getLatestPrice(symbol) {
  return (
    global.preciosEnTiempoReal[symbol.toUpperCase().replace(/[-/]/g, "")] ||
    null
  );
}
async function getFreshPriceFromApi(symbol) {
  const upperSymbol = symbol.toUpperCase();
  const type = getSymbolType(upperSymbol);
  try {
    if (type === "crypto") {
      const kucoinSymbol = getKuCoinSymbolFormat(upperSymbol);
      const response = await fetch(
        `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${kucoinSymbol}`
      );
      if (response.ok) {
        const { data } = await response.json();
        if (data && data.price) return parseFloat(data.price);
      }
    }
    if (type === "forex/commodity" || type === "stock") {
      const twelveDataSymbol = getTwelveDataSymbolFormat(upperSymbol);
      const tdResponse = await fetch(
        `https://api.twelvedata.com/price?symbol=${twelveDataSymbol}&apikey=${TWELVE_DATA_API_KEY}`
      );
      if (tdResponse.ok) {
        const tdData = await tdResponse.json();
        if (tdData.price) return parseFloat(tdData.price);
      }
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
  return null;
}
async function cerrarOperacionesAutomáticamente(operationId = null) {
  try {
    const result = await pool.query(
      "SELECT * FROM operaciones WHERE cerrada = false AND (take_profit IS NOT NULL OR stop_loss IS NOT NULL)"
    );
    const operaciones = result.rows;
    for (const op of operaciones) {
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
        if ((tp && precioActual >= tp) || (sl && precioActual <= sl))
          cerrar = true;
      } else if (tipo === "sell" || tipo === "venta") {
        if ((tp && precioActual <= tp) || (sl && precioActual >= sl))
          cerrar = true;
      }
      if (cerrar) {
        if (tipo === "buy" || tipo === "compra")
          ganancia = (precioActual - entrada) * volumen;
        else ganancia = (entrada - precioActual) * volumen;
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query(
            "UPDATE operaciones SET cerrada = true, ganancia = $1, precio_cierre = $2 WHERE id = $3",
            [ganancia, precioActual, op.id]
          );
          await client.query(
            "UPDATE usuarios SET balance = balance + $1 WHERE id = $2",
            [ganancia, op.usuario_id]
          );
          await client.query("COMMIT");
          console.log(`✔️ Operación #${op.id} cerrada automáticamente.`);
        } catch (e) {
          await client.query("ROLLBACK");
          throw e;
        } finally {
          client.release();
        }
      }
    }
  } catch (err) {
    console.error("❌ Error al cerrar operaciones automáticamente:", err);
  }
}

// --- RUTAS DE LA API ---
app.get("/", (req, res) => res.send("Backend de Bulltrodat está funcionando."));

app.post("/register", async (req, res) => {
  const { nombre, email, password, codigo, platform_id } = req.body;
  if (!platform_id)
    return res
      .status(400)
      .json({ error: "Falta el identificador de la plataforma." });
  if (codigo !== REGISTRATION_CODE)
    return res.status(403).json({ error: "Código de registro inválido." });
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol, balance, balance_real, platform_id) VALUES ($1, $2, $3, 'usuario', 10000, 0, $4)",
      [nombre, email, hash, platform_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password, platform_id } = req.body;
  if (!platform_id)
    return res
      .status(400)
      .json({ error: "Falta el identificador de la plataforma." });
  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND platform_id = $2",
      [email, platform_id]
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
    console.error("Error en /login:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

app.get("/me", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const result = await pool.query(
      "SELECT id, nombre, email, balance, rol, identificacion, telefono, platform_id FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en /me:", err);
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
});

app.put("/me/profile", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  const { identificacion, telefono } = req.body;
  try {
    const result = await pool.query(
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
  req.session.destroy((err) => {
    if (err)
      return res.status(500).json({ error: "No se pudo cerrar la sesión" });
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

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
    await pool.query("BEGIN");
    const userRes = await pool.query(
      "SELECT balance FROM usuarios WHERE id = $1 FOR UPDATE",
      [usuario_id]
    );
    const balanceActual = parseFloat(userRes.rows[0].balance);
    const costo = precio_entrada * volumen;
    if (balanceActual < costo) {
      await pool.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, error: "Fondos insuficientes" });
    }
    await pool.query(
      "INSERT INTO operaciones (usuario_id, activo, tipo_operacion, volumen, precio_entrada, capital_invertido, take_profit, stop_loss) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
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
    await pool.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await pool.query("ROLLBACK");
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
  if (filter === "abiertas") filterClause = "AND cerrada = false";
  else if (filter === "cerradas") filterClause = "AND cerrada = true";
  try {
    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM operaciones WHERE usuario_id = $1 ${filterClause}`,
      queryParams
    );
    const totalOperations = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalOperations / limit);
    queryParams.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM operaciones WHERE usuario_id = $1 ${filterClause} ORDER BY fecha DESC LIMIT $2 OFFSET $3`,
      queryParams
    );
    res.json({ operations: result.rows, totalPages, currentPage: page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

app.post("/cerrar-operacion", async (req, res) => {
  const { operacion_id } = req.body;
  const usuario_id = req.session.userId;
  if (!usuario_id) return res.status(401).json({ error: "No autenticado" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT * FROM operaciones WHERE id = $1 AND usuario_id = $2 AND cerrada = false FOR UPDATE",
      [operacion_id, usuario_id]
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Operación no encontrada o ya cerrada" });
    }
    const op = rows[0];
    const { activo, tipo_operacion, volumen, precio_entrada } = op;
    const precioActual = await getFreshPriceFromApi(activo);
    if (precioActual === null) {
      await client.query("ROLLBACK");
      return res
        .status(500)
        .json({ error: `Precio para ${activo} no disponible.` });
    }
    const tipo = tipo_operacion.toLowerCase();
    let gananciaFinal = 0;
    if (tipo === "compra" || tipo === "buy")
      gananciaFinal = (precioActual - precio_entrada) * volumen;
    else if (tipo === "venta" || tipo === "sell")
      gananciaFinal = (precio_entrada - precioActual) * volumen;
    await client.query(
      "UPDATE operaciones SET cerrada = true, ganancia = $1, precio_cierre = $2 WHERE id = $3",
      [gananciaFinal, precioActual, operacion_id]
    );
    await client.query(
      "UPDATE usuarios SET balance = balance + $1 WHERE id = $2",
      [gananciaFinal, usuario_id]
    );
    await client.query("COMMIT");
    res.json({ success: true, gananciaFinal, precio_cierre: precioActual });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error interno al cerrar la operación." });
  } finally {
    client.release();
  }
});

app.get("/balance", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const result = await pool.query(
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
    const { rows } = await pool.query(
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
    const { rows } = await pool.query(
      `SELECT DATE(fecha) as fecha, SUM(ganancia) as ganancia_dia FROM operaciones WHERE usuario_id = $1 AND cerrada = true GROUP BY DATE(fecha) ORDER BY fecha ASC`,
      [req.session.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener rendimiento" });
  }
});

app.get("/usuarios", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const adminResult = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin")
      return res.status(403).json({ error: "Acceso denegado" });
    const totalResult = await pool.query("SELECT COUNT(*) FROM usuarios");
    const totalUsers = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);
    const usuariosResult = await pool.query(
      "SELECT id, nombre, email, balance, rol, identificacion, telefono, platform_id FROM usuarios ORDER BY id ASC LIMIT $1 OFFSET $2",
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
    const result = await pool.query("SELECT rol FROM usuarios WHERE id = $1", [
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
    await pool.query(updateQuery, queryParams);
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
    const adminResult = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin")
      return res.status(403).json({ error: "No autorizado" });
    const { id } = req.params;
    if (parseInt(id) === req.session.userId)
      return res
        .status(400)
        .json({ error: "No puedes eliminarte a ti mismo." });
    await pool.query("BEGIN");
    await pool.query("DELETE FROM operaciones WHERE usuario_id = $1", [id]);
    await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    await pool.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await pool.query("ROLLBACK");
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
    const adminResult = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin")
      return res.status(403).json({ error: "Acceso denegado" });
    const { usuarioId } = req.params;
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM operaciones WHERE usuario_id = $1",
      [usuarioId]
    );
    const totalOps = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalOps / limit);
    const [usuario, operaciones] = await Promise.all([
      pool.query("SELECT nombre FROM usuarios WHERE id = $1", [usuarioId]),
      pool.query(
        "SELECT * FROM operaciones WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT $2 OFFSET $3",
        [usuarioId, limit, offset]
      ),
    ]);
    if (usuario.rows.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });
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
    const adminResult = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin")
      return res.status(403).json({ error: "No autorizado" });
    await pool.query(
      "UPDATE operaciones SET precio_entrada = $1 WHERE id = $2",
      [nuevoPrecio, id]
    );
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
    const adminResult = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin")
      return res.status(403).json({ error: "No autorizado" });
    res.json({ code: REGISTRATION_CODE });
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

app.post("/admin/registration-code", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  try {
    const adminResult = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows[0].rol !== "admin")
      return res.status(403).json({ error: "No autorizado" });
    const { newCode } = req.body;
    if (!newCode || typeof newCode !== "string")
      return res.status(400).json({ error: "Código inválido" });
    REGISTRATION_CODE = newCode;
    console.log(`✅ Código de registro cambiado a: ${REGISTRATION_CODE}`);
    res.json({ success: true, newCode: REGISTRATION_CODE });
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

// --- Inicio del Servidor ---
const startServer = async () => {
  try {
    await pool.query(`
          CREATE TABLE IF NOT EXISTS "user_sessions" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL,
            CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sid")
          );
        `);
    console.log("Tabla de sesiones verificada/creada.");

    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      iniciarWebSocketKuCoin();
      iniciarWebSocketTwelveData();
      setInterval(() => cerrarOperacionesAutomáticamente(), 1500);
    });

    server.on("upgrade", (request, socket, head) => {
      sessionMiddleware(request, {}, () => {
        if (!request.session.userId) {
          socket.destroy();
          return;
        }
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      });
    });
  } catch (err) {
    console.error("❌ Fallo al iniciar el servidor:", err);
    process.exit(1);
  }
};

startServer();
