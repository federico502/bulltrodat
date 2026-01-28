import "dotenv/config";
/*
IMPORTANTE: Para que la nueva funcionalidad de apalancamiento y notificaciones funcione,
es necesario modificar la base de datos. Ejecute los siguientes comandos SQL
en su base de datos PostgreSQL:

ALTER TABLE operaciones ADD COLUMN apalancamiento INTEGER DEFAULT 1;
ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN identificacion VARCHAR(255);
ALTER TABLE operaciones ADD COLUMN precio_cierre NUMERIC;
ALTER TABLE operaciones ADD COLUMN ganancia NUMERIC;
ALTER TABLE operaciones ADD COLUMN cerrada BOOLEAN DEFAULT FALSE;
ALTER TABLE operaciones ADD COLUMN take_profit NUMERIC;
ALTER TABLE operaciones ADD COLUMN stop_loss NUMERIC;

CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

Este comando añade las columnas y la tabla necesarias para la gestión completa.
*/
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
import { runMigrations } from "./auto_migrate.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// --- Carga de Variables de Entorno ---
const {
  DATABASE_URL,
  SESSION_SECRET,
  TWELVE_DATA_API_KEY,
  FRONTEND_URLS,
  NODE_ENV,
  PORT = 3000,
} = process.env;

let REGISTRATION_CODE = process.env.REGISTRATION_CODE || "ADMIN2024";
// Variable global para el apalancamiento máximo
let MAX_LEVERAGE = 200;

// --- VARIABLES GLOBALES PARA COMISIONES, SPREADS Y SWAP ---
let SPREAD_PORCENTAJE = parseFloat(process.env.SPREAD_PORCENTAJE) || 0.01;
let COMISION_PORCENTAJE = parseFloat(process.env.COMISION_PORCENTAJE) || 0.1;
let SWAP_DAILY_PORCENTAJE =
  parseFloat(process.env.SWAP_DAILY_PORCENTAJE) || 0.05;

// --- CONTROL DE TIEMPO DEL SWAP ---
// Usaremos una variable global para simular el último cobro de swap
// En un sistema de producción, esto iría en una tabla de configuración.
let lastSwapChargeTime = new Date().getTime(); // Inicializado al inicio del servidor
const MIN_INTERVAL_BETWEEN_SWAP_MS = 24 * 60 * 60 * 1000; // 24 horas

// Validar que las variables críticas existan
if (
  !DATABASE_URL ||
  !SESSION_SECRET ||
  !FRONTEND_URLS ||
  !TWELVE_DATA_API_KEY
) {
  console.error(
    "CRITICAL ERROR: DATABASE_URL, SESSION_SECRET, FRONTEND_URLS, or TWELVE_DATA_API_KEY is not set."
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
  app.set("trust proxy", 1); // Confía en el primer proxy
}

// Función auxiliar para normalizar el origen y verificar si es permitido
const normalizeOrigin = (origin) => {
  if (!origin) return null;
  let url = origin.toLowerCase();
  url = url.replace(/^https?:\/\//, "");
  url = url.replace(/^www\./, "");
  if (url.endsWith("/")) url = url.slice(0, -1);
  return url;
};

const allowedOrigins = FRONTEND_URLS.split(",").map((url) =>
  normalizeOrigin(url)
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        // Permitir peticiones sin origen (como postman, curl, o solicitudes del mismo servidor)
        if (NODE_ENV !== "production") {
          return callback(null, true);
        }
      }

      const normalizedOrigin = normalizeOrigin(origin);

      const isAllowed = allowedOrigins.some(
        (allowed) =>
          normalizedOrigin === allowed ||
          normalizedOrigin?.endsWith(`.${allowed}`) // Para subdominios, si es necesario
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(
          `CORS Error: Origen no permitido: ${origin} (Normalizado: ${normalizedOrigin})`
        );
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
      // FIX CRÍTICO: Debe permitir la conexión al endpoint REAL.
      "connect-src": ["'self'", "wss:", "https:", "wss://ws.twelvedata.com"],
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
  proxy: true,
  cookie: {
    // ARREGLO CRÍTICO: Configuración de cookies para entornos de producción/cross-domain
    secure: NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    // SameSite: 'none' es NECESARIO para que la cookie se envíe en solicitudes cross-site
    sameSite: NODE_ENV === "production" ? "none" : "lax",
  },
});
app.use(sessionMiddleware);

// --- Lógica de WebSockets ---
global.preciosEnTiempoReal = {};

// --- Listas de Activos para Suscripción a WebSockets ---
const initialCrypto = [
  "BTC-USDT",
  "ETH-USDT",
  "LTC-USDT",
  "XRP-USDT",
  "BNB-USDT",
  "TRX-USDT",
  "ADA-USDT",
  "DOGE-USDT",
  "SOL-USDT",
  "DOT-USDT",
  "LINK-USDT",
  "MATIC-USDT",
  "AVAX-USDT",
  "PEPE-USDT",
  "SUI-USDT",
  "TON-USDT",
];

const initialTwelveDataAssets = [
  "EUR/USD",
  "GBP/USD",
  "EUR/JPY",
  "USD/JPY",
  "AUD/USD",
  "USD/CHF",
  "GBP/JPY",
  "USD/CAD",
  "EUR/GBP",
  "EUR/CHF",
  "AUD/JPY",
  "NZD/USD",
  "CHF/JPY",
  "EUR/AUD",
  "CAD/JPY",
  "GBP/AUD",
  "EUR/CAD",
  "AUD/CAD",
  "GBP/CAD",
  "AUD/NZD",
  "NZD/JPY",
  "AUD/CHF",
  "USD/MXN",
  "GBP/NZD",
  "EUR/NZD",
  "CAD/CHF",
  "NZD/CAD",
  "NZD/CHF",
  "GBP/CHF",
  "USD/BRL",
  "XAU/USD",
  "XAG/USD",
  "WTI/USD",
  "BRENT/USD",
  "XCU/USD",
  "NG/USD",
  "META",
  "JNJ",
  "JPM",
  "KO",
  "MA",
  "IBM",
  "DIS",
  "CVX",
  "AAPL",
  "AMZN",
  "BA",
  "BAC",
  "CSCO",
  "MCD",
  "NVDA",
  "WMT",
  "MSFT",
  "NFLX",
  "NKE",
  "ORCL",
  "PG",
  "T",
  "TSLA",
  "DAX",
  "FCHI",
  "FTSE",
  "SX5E",
  "IBEX",
  "DJI",
  "SPX",
  "NDX",
  "NI225",
];

let kuCoinWs = null;
let twelveDataWs = null;
const activeKuCoinSubscriptions = new Set(initialCrypto);
const activeTwelveDataSubscriptions = new Set(initialTwelveDataAssets);

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function normalizeSymbol(symbol) {
  // Asegura que los símbolos como BTC-USDT o EUR/USD se conviertan a BTCUSDT o EURUSD
  return symbol.toUpperCase().replace(/[-/]/g, "");
}

function subscribeToKuCoin(symbols) {
  if (kuCoinWs && kuCoinWs.readyState === WebSocket.OPEN) {
    const topic = `/market/ticker:${symbols.join(",")}`;
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

function getTwelveDataSymbolFormat(symbol) {
  const s = symbol.toUpperCase();
  if (s.includes("/") && s.length > 6) return s;
  if (!s.includes("/") && s.length === 6)
    return `${s.slice(0, 3)}/${s.slice(3)}`;
  return s;
}

// NUEVA FUNCIÓN: Envía suscripción a Twelve Data
function sendTwelveDataSubscription(symbols) {
  if (twelveDataWs && twelveDataWs.readyState === WebSocket.OPEN) {
    const formattedSymbols = symbols.map(getTwelveDataSymbolFormat);
    twelveDataWs.send(
      JSON.stringify({
        action: "subscribe",
        params: { symbols: formattedSymbols.join(",") },
      })
    );
    console.log(`[TwelveData] Suscrito a: ${formattedSymbols.join(", ")}`);
  }
}

async function iniciarWebSocketKuCoin() {
  try {
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

    // FIX: Asegurar que si ya existe, se cierre antes de reabrir
    if (kuCoinWs) kuCoinWs.close();
    kuCoinWs = new WebSocket(wsUrl);

    kuCoinWs.on("open", () => {
      // Re-suscribir todos los activos activos
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
          const symbolWithDash = message.topic.split(":")[1]; // BTC-USDT
          // Mapeamos a BTCUSDT para el frontend
          const symbol = normalizeSymbol(symbolWithDash);
          const price = parseFloat(message.data.price);
          global.preciosEnTiempoReal[symbol] = price;
          broadcast({ type: "price_update", prices: { [symbol]: price } });
        }
      } catch (err) {
        console.error("❌ Error procesando mensaje de KuCoin:", err);
      }
    });
    kuCoinWs.on("close", () => {
      console.warn(
        "🟡 [KuCoin] Conexión cerrada. Reintentando en 5 segundos..."
      );
      setTimeout(iniciarWebSocketKuCoin, 5000);
    });
    kuCoinWs.on("error", (err) => kuCoinWs.close());
  } catch (error) {
    console.error("❌ Error al iniciar WebSocket KuCoin:", error.message);
    setTimeout(iniciarWebSocketKuCoin, 10000);
  }
}

function iniciarWebSocketTwelveData() {
  if (!TWELVE_DATA_API_KEY) return;
  let twelveDataRetryTimeout = 5000;
  const MAX_RETRY_TIMEOUT = 60000;

  // FIX CRÍTICO: Corregir la URL. Debe ser 'ws.twelvedata.com', no 'ws.twelve-data.com'
  const wsUrl = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${TWELVE_DATA_API_KEY}`;

  // FIX: Asegurar que si ya existe, se cierre antes de reabrir
  if (twelveDataWs) twelveDataWs.close();
  twelveDataWs = new WebSocket(wsUrl);

  twelveDataWs.on("open", () => {
    twelveDataRetryTimeout = 5000;
    // Re-suscribir todos los activos activos
    if (activeTwelveDataSubscriptions.size > 0) {
      sendTwelveDataSubscription(Array.from(activeTwelveDataSubscriptions));
    }
  });

  twelveDataWs.on("message", (data) => {
    try {
      const message = JSON.parse(data);
      if (message.event === "price") {
        const twelveDataSymbol = message.symbol; // Ej: BTC/USD, EUR/USD
        const price = parseFloat(message.price);

        // --- ARREGLO CRÍTICO DE MAPEO V2 (Consolidado) ---
        let internalSymbol = normalizeSymbol(twelveDataSymbol);

        // Identificar criptos de Twelve Data (que vienen como X/USD) y mapearlas a XUSDT
        const knownBaseSymbols =
          /^(EUR|GBP|AUD|NZD|CAD|CHF|JPY|XAG|XAU|WTI|BRENT|NG)/i;
        if (
          twelveDataSymbol.endsWith("/USD") &&
          !twelveDataSymbol.match(knownBaseSymbols)
        ) {
          internalSymbol = internalSymbol.replace("USD", "USDT");
        }
        // --- FIN ARREGLO CRÍTICO DE MAPEO V2 ---

        global.preciosEnTiempoReal[internalSymbol] = price;
        broadcast({
          type: "price_update",
          prices: { [internalSymbol]: price },
        });
      } else if (message.event === "error") {
        console.error(
          `[TwelveData] Error de suscripción: ${message.message} para ${message.symbol}`
        );
      }
    } catch (err) {
      console.error("❌ Error processing message from Twelve Data:", err);
    }
  });
  twelveDataWs.on("close", () => {
    console.warn("🟡 [TwelveData] Conexión cerrada. Reintentando...");
    setTimeout(iniciarWebSocketTwelveData, twelveDataRetryTimeout);
    twelveDataRetryTimeout = Math.min(
      twelveDataRetryTimeout * 2,
      MAX_RETRY_TIMEOUT
    );
  });
  twelveDataWs.on("error", (err) => twelveDataWs.close());
}

async function getLatestPrice(symbol) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const price = global.preciosEnTiempoReal[normalizedSymbol];
  return price !== undefined ? parseFloat(price) : null;
}

// --- LÓGICA CLAVE: CERRAR OPERACIONES AUTOMÁTICAMENTE (TP/SL, SWAP y STOP-OUT) ---
const SWAP_DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
const STOP_OUT_LEVEL = 100; // 100% de Nivel de Margen (Equity <= Margen Usado)

async function liquidarOperacion(client, op, precioActual, motivo, ganancia) {
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

  // Notificar al cliente que la operación se ha cerrado
  broadcast({
    type: "operacion_cerrada",
    operacion_id: op.id,
    activo: op.activo,
    ganancia: ganancia,
    tipoCierre: motivo,
  });
}

async function cerrarOperacionesAutomáticamente() {
  const client = await pool.connect();
  try {
    // 1. Obtener todas las operaciones abiertas por usuario para el Stop-Out
    const openOpsResult = await client.query(
      `SELECT op.*, u.balance as user_balance, u.credito as user_credit
       FROM operaciones op
       JOIN usuarios u ON op.usuario_id = u.id
       WHERE op.cerrada = false`
    );
    const openOperations = openOpsResult.rows;

    // Agrupar operaciones por usuario para calcular Equity y Margen Usado
    const usersData = {};
    openOperations.forEach((op) => {
      const {
        usuario_id,
        user_balance,
        user_credit,
        capital_invertido,
        activo,
        tipo_operacion,
        precio_entrada,
        volumen,
      } = op;
      const normalizedSymbol = normalizeSymbol(activo);
      const precioActual =
        global.preciosEnTiempoReal[normalizedSymbol] ||
        parseFloat(op.precio_entrada); // Usar precio de entrada como fallback
      const precioNum = parseFloat(precioActual);

      // Calcular PnL flotante
      let pnl = 0;
      if (tipo_operacion.toLowerCase().includes("buy")) {
        pnl = (precioNum - parseFloat(precio_entrada)) * parseFloat(volumen);
      } else {
        pnl = (parseFloat(precio_entrada) - precioNum) * parseFloat(volumen);
      }

      const margenUsado = parseFloat(capital_invertido);

      if (!usersData[usuario_id]) {
        usersData[usuario_id] = {
          balance: parseFloat(user_balance),
          credito: parseFloat(user_credit) || 0,
          usedMargin: 0,
          pnl: 0,
          operations: [],
        };
      }

      usersData[usuario_id].usedMargin += margenUsado;
      usersData[usuario_id].pnl += pnl;
      usersData[usuario_id].operations.push(op);
    });

    // --- LÓGICA DE STOP-OUT (Nivel de Margen al 100%) ---
    for (const userId in usersData) {
      const data = usersData[userId];
      // MOD: Equity incluye el Crédito (Bono)
      const equity = data.balance + data.credito + data.pnl;
      const marginLevel =
        data.usedMargin > 0 ? (equity / data.usedMargin) * 100 : Infinity;

      // Si el nivel de margen es <= 100%, liquidar todas las posiciones abiertas
      if (marginLevel <= STOP_OUT_LEVEL) {
        console.log(
          `🚨 [STOP-OUT] Usuario ${userId} liquidado. Nivel de Margen: ${marginLevel.toFixed(
            2
          )}%`
        );
        for (const op of data.operations) {
          const precioActual = await getLatestPrice(op.activo);
          if (precioActual) {
            const tipo = op.tipo_operacion.toLowerCase();
            const precio_entrada = parseFloat(op.precio_entrada);
            const volumen = parseFloat(op.volumen);
            let ganancia = 0;

            if (tipo === "compra" || tipo === "buy") {
              ganancia = (precioActual - precio_entrada) * volumen;
            } else {
              ganancia = (precio_entrada - precioActual) * volumen;
            }

            // Liquidar posición
            await liquidarOperacion(
              client,
              op,
              precioActual,
              "STOP-OUT",
              ganancia
            );
          }
        }
      }
    }

    // 2. Lógica de cierre por TP/SL
    // Solo procesamos las operaciones que no han sido liquidadas por Stop-Out
    const tpSlResult = await client.query(
      `SELECT * FROM operaciones 
       WHERE cerrada = false 
       AND (take_profit IS NOT NULL OR stop_loss IS NOT NULL)`
    );
    const operacionesTPSL = tpSlResult.rows;

    for (const op of operacionesTPSL) {
      // Si la operación ya fue liquidada por Stop-Out, la omitimos
      if (usersData[op.usuario_id] && usersData[op.usuario_id].liquidated)
        continue;

      const precioActual = await getLatestPrice(op.activo);
      if (!precioActual) continue;

      let cerrar = false;
      let motivo = null;
      const entrada = parseFloat(op.precio_entrada);
      const tp = op.take_profit ? parseFloat(op.take_profit) : null;
      const sl = op.stop_loss ? parseFloat(op.stop_loss) : null;
      const tipo = op.tipo_operacion.toLowerCase();

      if (tipo === "buy" || tipo === "compra") {
        if (tp && precioActual >= tp) {
          cerrar = true;
          motivo = "TP";
        } else if (sl && precioActual <= sl) {
          cerrar = true;
          motivo = "SL";
        }
      } else if (tipo === "sell" || tipo === "venta") {
        if (tp && precioActual <= tp) {
          cerrar = true;
          motivo = "TP";
        } else if (sl && precioActual >= sl) {
          cerrar = true;
          motivo = "SL";
        }
      }

      if (cerrar) {
        const volumen = parseFloat(op.volumen);
        let ganancia = 0;

        if (tipo === "buy" || tipo === "compra") {
          ganancia = (precioActual - entrada) * volumen;
        } else {
          ganancia = (entrada - precioActual) * volumen;
        }

        await liquidarOperacion(client, op, precioActual, motivo, ganancia);
      }
    }

    // 3. LÓGICA DE COBRO DE SWAP DIARIO
    const now = new Date().getTime();

    // CRÍTICO: El cobro solo procede si la tasa es > 0 Y ha pasado el intervalo mínimo de 24h.
    if (
      SWAP_DAILY_PORCENTAJE > 0 &&
      now - global.lastSwapChargeTime >= MIN_INTERVAL_BETWEEN_SWAP_MS
    ) {
      const swapOpenOpsResult = await client.query(
        "SELECT id, usuario_id, capital_invertido FROM operaciones WHERE cerrada = false"
      );

      const swapRate = SWAP_DAILY_PORCENTAJE / 100;
      const swapCostByUser = {};

      for (const op of swapOpenOpsResult.rows) {
        const margen = parseFloat(op.capital_invertido);
        const costoSwap = margen * swapRate;

        if (!swapCostByUser[op.usuario_id]) swapCostByUser[op.usuario_id] = 0;
        swapCostByUser[op.usuario_id] += costoSwap;
      }

      if (Object.keys(swapCostByUser).length > 0) {
        await client.query("BEGIN");
        for (const userId in swapCostByUser) {
          const totalSwapCost = swapCostByUser[userId];
          await client.query(
            "UPDATE usuarios SET balance = balance - $1 WHERE id = $2",
            [totalSwapCost, userId]
          );
        }
        await client.query("COMMIT");
        console.log(
          `✅ Swap Diario cobrado (${SWAP_DAILY_PORCENTAJE}% completo) a ${
            Object.keys(swapCostByUser).length
          } usuarios.`
        );

        // CRÍTICO: Actualizar el tiempo del último cobro globalmente
        global.lastSwapChargeTime = now;
      }
    } else if (SWAP_DAILY_PORCENTAJE > 0) {
      const remainingTimeMs =
        MIN_INTERVAL_BETWEEN_SWAP_MS - (now - global.lastSwapChargeTime);
      const remainingHours = Math.round(remainingTimeMs / (1000 * 60 * 60));
      console.log(
        `⏱️ Swap check: ${remainingHours} horas restantes para el próximo cobro. Ignorando el cobro.`
      );
    }
  } catch (err) {
    // No hay rollback aquí porque liquidarOperacion maneja transacciones individuales
    console.error("❌ Error al procesar Swap, TP/SL o Stop-Out:", err);
  } finally {
    client.release();
  }
}
// --- FIN LÓGICA CLAVE ---

// --- RUTAS DE LA API ---
app.get("/", (req, res) => res.send("Backend de Trading está funcionando."));

app.post("/register", async (req, res) => {
  const { nombre, email, password, codigo, telefono, platform_id } = req.body;

  if (!platform_id) {
    return res
      .status(400)
      .json({ error: "Falta el identificador de la plataforma." });
  }

  if (platform_id === "bulltrodat") {
    if (codigo !== REGISTRATION_CODE) {
      return res.status(403).json({ error: "Código de registro inválido." });
    }
  } else if (platform_id === "bulltrading") {
    if (!telefono) {
      return res
        .status(400)
        .json({ error: "El número de teléfono es obligatorio." });
    }
  } else if (platform_id === "luxtrading" || platform_id === "unique1global") {
    // No se requiere validación extra.
  } else {
    return res.status(400).json({ error: "Plataforma no reconocida." });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol, balance, platform_id, telefono) VALUES ($1, $2, $3, 'usuario', 0, $4, $5)",
      [nombre, email, hash, platform_id, telefono || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error en /register: ", err);
    res.status(500).json({
      error: "Error al registrar usuario. El email podría ya estar en uso.",
    });
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
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

app.get("/me", async (req, res) => {
  if (!req.session.userId) {
    console.log("Acceso a /me denegado: No hay session.userId");
    return res.status(401).json({ error: "No autenticado" });
  }
  try {
    const result = await pool.query(
      "SELECT id, nombre, email, balance, credito, rol, identificacion, telefono, platform_id FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
});

app.put("/me/profile", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const { identificacion, telefono } = req.body;
  try {
    await pool.query(
      "UPDATE usuarios SET identificacion = $1, telefono = $2 WHERE id = $3",
      [identificacion, telefono, req.session.userId]
    );
    res.json({ success: true, message: "Perfil actualizado correctamente." });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ error: "Error interno al actualizar el perfil." });
  }
});

// --- NUEVA RUTA: CAMBIAR CONTRASEÑA (Requiere que el frontend la implemente) ---
app.post("/me/change-password", async (req, res) => {
  const usuario_id = req.session.userId;
  if (!usuario_id) return res.status(401).json({ error: "No autenticado" });

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Faltan campos de contraseña." });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "La nueva contraseña debe tener al menos 6 caracteres." });
  }

  try {
    const result = await pool.query(
      "SELECT password FROM usuarios WHERE id = $1",
      [usuario_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const storedHash = result.rows[0].password;

    // 1. Verificar la contraseña actual
    if (!(await bcrypt.compare(currentPassword, storedHash))) {
      return res
        .status(401)
        .json({ error: "La contraseña actual es incorrecta." });
    }

    // 2. Hashear la nueva contraseña
    const newHash = await bcrypt.hash(newPassword, 10);

    // 3. Actualizar la base de datos
    await pool.query("UPDATE usuarios SET password = $1 WHERE id = $2", [
      newHash,
      usuario_id,
    ]);

    res.json({ success: true, message: "Contraseña actualizada con éxito." });
  } catch (err) {
    console.error("Error al cambiar contraseña:", err);
    res.status(500).json({ error: "Error interno al cambiar la contraseña." });
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

// --- RUTA CLAVE: OPERAR (Con comisiones y margen real) ---
app.post("/operar", async (req, res) => {
  const {
    activo,
    tipo_operacion,
    volumen,
    precio_entrada,
    take_profit,
    stop_loss,
    apalancamiento,
  } = req.body;
  const usuario_id = req.session.userId;
  if (!usuario_id) return res.status(401).json({ error: "No autenticado" });

  const nVolumen = parseFloat(volumen);
  const nPrecioEntrada = parseFloat(precio_entrada);
  const nApalancamiento = parseInt(apalancamiento) || 1;
  const nTakeProfit = parseFloat(take_profit);
  const nStopLoss = parseFloat(stop_loss);

  // Validar contra el apalancamiento máximo permitido
  if (nApalancamiento > MAX_LEVERAGE) {
    return res.status(400).json({
      error: `El apalancamiento no puede ser mayor a 1:${MAX_LEVERAGE}`,
    });
  }

  if (
    !activo ||
    typeof activo !== "string" ||
    !tipo_operacion ||
    !["buy", "sell", "compra", "venta"].includes(
      tipo_operacion.toLowerCase()
    ) ||
    isNaN(nVolumen) ||
    nVolumen <= 0 ||
    isNaN(nPrecioEntrada) ||
    nPrecioEntrada <= 0 ||
    isNaN(nApalancamiento) ||
    nApalancamiento <= 0
  ) {
    return res.status(400).json({ error: "Datos de operación inválidos." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Obtener balance y crédito actual del usuario
    const userRes = await client.query(
      "SELECT balance, credito FROM usuarios WHERE id = $1 FOR UPDATE",
      [usuario_id]
    );

    if (userRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    const balanceActual = parseFloat(userRes.rows[0].balance);
    const creditoActual = parseFloat(userRes.rows[0].credito || 0);

    // Obtener el margen usado actual (suma de capital_invertido de operaciones abiertas)
    const margenUsadoRes = await client.query(
      "SELECT COALESCE(SUM(capital_invertido), 0) AS used_margin FROM operaciones WHERE usuario_id = $1 AND cerrada = false",
      [usuario_id]
    );
    const margenUsadoActual = parseFloat(margenUsadoRes.rows[0].used_margin);

    // Calcular el Margen Requerido para la nueva operación
    const margenRequerido = (nPrecioEntrada * nVolumen) / nApalancamiento;

    // --- APLICACIÓN DE COMISIONES Y SPREADS ---

    let precioAperturaFinal = nPrecioEntrada;
    let comisionCosto = 0;

    // 1. Aplicar Spread (Afecta el precio de entrada)
    const spreadMonto = nPrecioEntrada * (SPREAD_PORCENTAJE / 100);

    if (tipo_operacion.toLowerCase().includes("buy")) {
      // En una compra, el spread sube el precio de entrada (te hace comprar más caro)
      precioAperturaFinal = nPrecioEntrada + spreadMonto;
    } else {
      // En una venta, el spread baja el precio de entrada (te hace vender más barato)
      precioAperturaFinal = nPrecioEntrada - spreadMonto;
    }

    // 2. Aplicar Comisión (Afecta el balance)
    // Se calcula sobre el volumen nocional (Volumen * Precio_Entrada)
    const volumenNocional = nVolumen * nPrecioEntrada;
    comisionCosto = volumenNocional * (COMISION_PORCENTAJE / 100);

    // 3. Validación de margen y comisión
    // El Margen Libre es: Balance Total + Crédito - Margen Usado Actual.
    const margenLibre = (balanceActual + creditoActual) - margenUsadoActual;
    const costoTotalRequerido = margenRequerido + comisionCosto;

    // CRÍTICO: Comprobamos si el Margen Libre puede cubrir el Margen Nuevo Y la Comisión.
    if (margenLibre < costoTotalRequerido) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error:
          "Fondos insuficientes. El Margen Libre no cubre el Margen Requerido y la Comisión.",
      });
    }

    // 4. Descontar la comisión del Balance (Esta es una PÉRDIDA REAL e inmediata)
    // El balance se reduce por la comisión.
    await client.query(
      "UPDATE usuarios SET balance = balance - $1 WHERE id = $2",
      [comisionCosto, usuario_id]
    );

    // NOTA: No se resta el Margen Requerido. Solo se descuenta la comisión.
    // El Margen Requerido (capital_invertido) solo se usa para calcular el Margen Libre.

    // 5. Insertar la operación con el precio de apertura final y el margen requerido
    await client.query(
      "INSERT INTO operaciones (usuario_id, activo, tipo_operacion, volumen, precio_entrada, capital_invertido, take_profit, stop_loss, apalancamiento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [
        usuario_id,
        activo,
        tipo_operacion,
        nVolumen,
        precioAperturaFinal, // Usamos el precio con spread aplicado
        margenRequerido, // Usamos margenRequerido como capital_invertido (margen usado)
        !isNaN(nTakeProfit) ? nTakeProfit : null,
        !isNaN(nStopLoss) ? nStopLoss : null,
        nApalancamiento,
      ]
    );

    await client.query("COMMIT");
    // Opcional: devolver la comisión aplicada para feedback al usuario
    res.json({
      success: true,
      comision: comisionCosto,
      precio_final: precioAperturaFinal,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error detallado en /operar:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack,
    });
    res.status(500).json({ error: "Error interno al procesar la operación." });
  } finally {
    client.release();
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

// --- RUTA CLAVE: CERRAR OPERACION (Lógica de Margen Corregida) ---
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

    const precioActual = await getLatestPrice(op.activo);
    if (precioActual === null) {
      await client.query("ROLLBACK");
      return res
        .status(500)
        .json({ error: `Precio para ${op.activo} no disponible.` });
    }

    const tipo = op.tipo_operacion.toLowerCase();
    const precio_entrada = parseFloat(op.precio_entrada); // Ahora incluye el spread
    const volumen = parseFloat(op.volumen);

    let gananciaFinal = 0;

    if (tipo === "compra" || tipo === "buy") {
      gananciaFinal = (precioActual - precio_entrada) * volumen;
    } else if (tipo === "venta" || tipo === "sell") {
      gananciaFinal = (precio_entrada - precioActual) * volumen;
    }

    // *** CAMBIO CLAVE: SOLO SE APLICA LA GANANCIA/PÉRDIDA AL BALANCE ***
    const montoADevolver = gananciaFinal;

    await client.query(
      "UPDATE operaciones SET cerrada = true, ganancia = $1, precio_cierre = $2 WHERE id = $3",
      [gananciaFinal, precioActual, op.id]
    );
    await client.query(
      "UPDATE usuarios SET balance = balance + $1 WHERE id = $2",
      [montoADevolver, usuario_id]
    );

    await client.query("COMMIT");
    res.json({ success: true, gananciaFinal, precio_cierre: precioActual });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error detallado en /cerrar-operacion:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
    });
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
      "SELECT balance, credito FROM usuarios WHERE id = $1",
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
      `SELECT 
        u.credito, 
        u.interes_acumulado, 
        u.tasa_interes,
        u.balance,
        SUM(CASE WHEN op.cerrada THEN op.ganancia ELSE 0 END) AS ganancia_total, 
        COUNT(*) FILTER (WHERE op.cerrada) AS cerradas, 
        COUNT(*) FILTER (WHERE NOT op.cerrada) AS abiertas,
        SUM(op.capital_invertido) FILTER (WHERE NOT op.cerrada) as margen_usado
       FROM usuarios u
       LEFT JOIN operaciones op ON u.id = op.usuario_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.session.userId]
    );
    
    const stats = rows[0] || {};
    // Calculamos el crédito usado aproximado (si el margen usado supera el balance, se usa crédito)
    const margenUsado = parseFloat(stats.margen_usado || 0);
    const balance = parseFloat(stats.balance || 0);
    const creditoUsado = Math.max(0, margenUsado - balance);

    res.json({
      ...stats,
      credito_usado: creditoUsado
    });
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

// Ruta para que los usuarios obtengan las opciones de apalancamiento permitidas
app.get("/leverage-options", (req, res) => {
  const allOptions = [1, 5, 10, 25, 50, 100, 200];
  const allowedOptions = allOptions.filter((opt) => opt <= MAX_LEVERAGE);
  res.json(allowedOptions);
});

// --- RUTA: OBTENER COMISIONES, SPREAD Y SWAP ---
app.get("/commissions", (req, res) => {
  res.json({
    spreadPercentage: SPREAD_PORCENTAJE,
    commissionPercentage: COMISION_PORCENTAJE,
    swapDailyPercentage: SWAP_DAILY_PORCENTAJE, // NUEVO
  });
});

app.get("/usuarios", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const adminResult = await pool.query(
      "SELECT rol, platform_id FROM usuarios WHERE id = $1",
      [req.session.userId]
    );

    if (adminResult.rows.length === 0 || adminResult.rows[0].rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const adminPlatformId = adminResult.rows[0].platform_id;
    if (!adminPlatformId) {
      return res
        .status(500)
        .json({ error: "El administrador no tiene una plataforma asignada." });
    }

    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM usuarios WHERE platform_id = $1",
      [adminPlatformId]
    );
    const totalUsers = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    const usuariosResult = await pool.query(
      "SELECT id, nombre, email, balance, credito, rol, identificacion, telefono, platform_id FROM usuarios WHERE platform_id = $1 ORDER BY id ASC LIMIT $2 OFFSET $3",
      [adminPlatformId, limit, offset]
    );

    res.json({ users: usuariosResult.rows, totalPages, currentPage: page });
  } catch (err) {
    console.error("Error en /usuarios:", err);
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

app.get("/admin-operaciones/:usuarioId/all", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });

  try {
    const adminResult = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows.length === 0 || adminResult.rows[0].rol !== "admin")
      return res.status(403).json({ error: "Acceso denegado" });

    const { usuarioId } = req.params;

    const [usuario, operaciones] = await Promise.all([
      pool.query("SELECT nombre FROM usuarios WHERE id = $1", [usuarioId]),
      pool.query(
        "SELECT * FROM operaciones WHERE usuario_id = $1 ORDER BY fecha DESC",
        [usuarioId]
      ),
    ]);

    if (usuario.rows.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
      nombre: usuario.rows[0].nombre,
      operaciones: operaciones.rows,
    });
  } catch (err) {
    console.error("Error al obtener todas las operaciones:", err);
    res.status(500).json({ error: "Error al obtener todas las operaciones" });
  }
});

app.post("/admin/actualizar-operacion", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const {
    id,
    activo,
    tipo_operacion,
    volumen,
    precio_entrada,
    precio_cierre,
    take_profit,
    stop_loss,
    cerrada,
    apalancamiento, // Recibe apalancamiento
  } = req.body;

  const client = await pool.connect();
  try {
    const adminResult = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminResult.rows.length === 0 || adminResult.rows[0].rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const opOriginalRes = await client.query(
      "SELECT * FROM operaciones WHERE id = $1",
      [id]
    );
    if (opOriginalRes.rows.length === 0) {
      return res.status(404).json({ error: "Operación no encontrada" });
    }
    const opOriginal = opOriginalRes.rows[0];
    const usuario_id = opOriginal.usuario_id;

    await client.query("BEGIN");

    // 1. Revertir impacto anterior de la operación (si estaba cerrada)
    const fueCerradaOriginalmente = opOriginal.cerrada;
    const gananciaOriginal = parseFloat(opOriginal.ganancia || 0);

    if (fueCerradaOriginalmente) {
      // CORRECCIÓN: Si estaba cerrada, revertimos el impacto de la ganancia anterior
      await client.query(
        "UPDATE usuarios SET balance = balance - $1 WHERE id = $2",
        [gananciaOriginal, usuario_id]
      );
    }

    // 2. Calcular nueva ganancia y estado
    let nuevaGanancia = 0;
    const esCerrada = cerrada === true || cerrada === "true";

    if (esCerrada) {
      // MODIFICACIÓN: Si se envía una ganancia manual, usarla. Si no, calcularla.
      if (req.body.ganancia !== undefined && req.body.ganancia !== null && req.body.ganancia !== "") {
          nuevaGanancia = parseFloat(req.body.ganancia);
      } else {
          // Cálculo automático (fallback)
          if (
            tipo_operacion.toLowerCase() === "buy" ||
            tipo_operacion.toLowerCase() === "compra"
          ) {
            nuevaGanancia =
              (parseFloat(precio_cierre) - parseFloat(precio_entrada)) *
              parseFloat(volumen);
          } else {
            // sell
            nuevaGanancia =
              (parseFloat(precio_entrada) - parseFloat(precio_cierre)) *
              parseFloat(volumen);
          }
      }
    }

    // 3. Recalcular el capital_invertido (margen)
    const leverage = parseInt(apalancamiento) || 1;
    const capitalInvertido =
      (parseFloat(precio_entrada) * parseFloat(volumen)) / leverage;

    // 4. Actualizar la operación
    await client.query(
      `UPDATE operaciones SET 
                activo = $1, 
                tipo_operacion = $2, 
                volumen = $3, 
                precio_entrada = $4, 
                precio_cierre = $5, 
                take_profit = $6, 
                stop_loss = $7, 
                cerrada = $8, 
                ganancia = $9,
                capital_invertido = $10,
                apalancamiento = $12
             WHERE id = $11`,
      [
        activo,
        tipo_operacion,
        volumen,
        precio_entrada,
        precio_cierre,
        take_profit,
        stop_loss,
        esCerrada,
        nuevaGanancia,
        capitalInvertido,
        id,
        leverage,
      ]
    );

    // 5. Aplicar nuevo impacto al balance si ahora está cerrada
    if (esCerrada) {
      // CORRECCIÓN: Aplicar solo la nueva ganancia/pérdida
      await client.query(
        "UPDATE usuarios SET balance = balance + $1 WHERE id = $2",
        [nuevaGanancia, usuario_id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error en /admin/actualizar-operacion:", err);
    res.status(500).json({ error: "Error al actualizar la operación" });
  } finally {
    client.release();
  }
});

// --- SISTEMA DE RETIROS ---

app.post("/withdraw", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "No autenticado" });
  
  const { amount, method, details } = req.body;
  const withdrawAmount = parseFloat(amount);

  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    return res.status(400).json({ error: "Monto inválido" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verificar balance
    const userRes = await client.query("SELECT balance FROM usuarios WHERE id = $1 FOR UPDATE", [req.session.userId]);
    const balance = parseFloat(userRes.rows[0].balance);

    if (balance < withdrawAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Fondos insuficientes para el retiro." });
    }

    // Descontar del balance
    await client.query("UPDATE usuarios SET balance = balance - $1 WHERE id = $2", [withdrawAmount, req.session.userId]);

    // Crear registro de retiro
    await client.query(
      "INSERT INTO retiros (usuario_id, monto, metodo, detalles) VALUES ($1, $2, $3, $4)",
      [req.session.userId, withdrawAmount, method, details || {}]
    );

    await client.query("COMMIT");
    res.json({ success: true, message: "Solicitud de retiro enviada. Fondos descontados temporalmente." });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error procesando el retiro" });
  } finally {
    client.release();
  }
});

app.get("/withdrawals", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "No autenticado" });
  
  try {
    const { rows } = await pool.query("SELECT * FROM retiros WHERE usuario_id = $1 ORDER BY fecha DESC", [req.session.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

// --- ADMIN RETIROS ---

// Obtener retiros de un usuario específico
app.get("/admin/withdrawals/:userId", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "No autenticado" });
  
  // Verificar admin
  const adminCheck = await pool.query("SELECT rol FROM usuarios WHERE id = $1", [req.session.userId]);
  if (adminCheck.rows[0]?.rol !== "admin") return res.status(403).json({ error: "No autorizado" });

  const { userId } = req.params;
  
  try {
    const { rows } = await pool.query("SELECT * FROM retiros WHERE usuario_id = $1 ORDER BY fecha DESC", [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener retiros" });
  }
});

// Aprobar o rechazar retiro
app.post("/admin/withdraw/status", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "No autenticado" });

  // Verificar admin
  const adminCheck = await pool.query("SELECT rol FROM usuarios WHERE id = $1", [req.session.userId]);
  if (adminCheck.rows[0]?.rol !== "admin") return res.status(403).json({ error: "No autorizado" });

  const { withdrawalId, status, userId } = req.body; // userId necesario para refund si es rechazado

  if (!['aprobado', 'rechazado'].includes(status)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verificar estado actual
    const currentRes = await client.query("SELECT estado, monto FROM retiros WHERE id = $1 FOR UPDATE", [withdrawalId]);
    if (currentRes.rows.length === 0) throw new Error("Retiro no encontrado");
    
    const { estado: estadoActual, monto } = currentRes.rows[0];

    if (estadoActual !== 'pendiente') {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "El retiro ya fue procesado." });
    }

    // Actualizar estado
    await client.query("UPDATE retiros SET estado = $1 WHERE id = $2", [status, withdrawalId]);

    // SI ES RECHAZADO: DEVOLVER FONDOS
    if (status === 'rechazado') {
      await client.query("UPDATE usuarios SET balance = balance + $1 WHERE id = $2", [monto, userId]);
    }

    await client.query("COMMIT");
    res.json({ 
      success: true, 
      message: status === 'rechazado' 
        ? "Retiro rechazado. Fondos devueltos al usuario." 
        : "Retiro aprobado correctamente." 
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  } finally {
    client.release();
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

// Rutas para gestionar el apalancamiento
app.get("/admin/leverage", async (req, res) => {
  if (!req.session.userId || req.session.rol !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }
  res.json({ maxLeverage: MAX_LEVERAGE });
});

app.post("/admin/leverage", async (req, res) => {
  if (!req.session.userId || req.session.rol !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }
  const { newLeverage } = req.body;
  const nLeverage = parseInt(newLeverage);
  if (isNaN(nLeverage) || nLeverage < 1) {
    return res.status(400).json({ error: "Valor de apalancamiento inválido." });
  }
  MAX_LEVERAGE = nLeverage;
  console.log(`✅ Apalancamiento máximo cambiado a: 1:${MAX_LEVERAGE}`);
  res.json({ success: true, maxLeverage: MAX_LEVERAGE });
});

// --- RUTA ADMIN: GESTIONAR COMISIONES Y SWAP ---
app.get("/admin/commissions", async (req, res) => {
  if (!req.session.userId || req.session.rol !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }
  res.json({
    spreadPercentage: SPREAD_PORCENTAJE,
    commissionPercentage: COMISION_PORCENTAJE,
    swapDailyPercentage: SWAP_DAILY_PORCENTAJE, // NUEVO
  });
});

app.post("/admin/commissions", async (req, res) => {
  if (!req.session.userId || req.session.rol !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }
  const { newSpread, newCommission, newSwap } = req.body; // Recibe newSwap
  let nSpread, nCommission, nSwap;

  if (newSpread !== undefined) {
    nSpread = parseFloat(newSpread);
    if (isNaN(nSpread) || nSpread < 0) {
      return res
        .status(400)
        .json({ error: "Valor de Spread inválido (debe ser >= 0)." });
    }
    SPREAD_PORCENTAJE = nSpread;
  }

  if (newCommission !== undefined) {
    nCommission = parseFloat(newCommission);
    if (isNaN(nCommission) || nCommission < 0) {
      return res
        .status(400)
        .json({ error: "Valor de Comisión inválido (debe ser >= 0)." });
    }
    COMISION_PORCENTAJE = nCommission;
  }

  if (newSwap !== undefined) {
    // Procesa el nuevo valor de Swap
    nSwap = parseFloat(newSwap);
    if (isNaN(nSwap) || nSwap < 0) {
      return res
        .status(400)
        .json({ error: "Valor de Swap inválido (debe ser >= 0)." });
    }
    SWAP_DAILY_PORCENTAJE = nSwap;
  }

  console.log(
    `✅ Comisiones y Swap actualizados. Spread: ${SPREAD_PORCENTAJE}%, Comisión: ${COMISION_PORCENTAJE}%, Swap: ${SWAP_DAILY_PORCENTAJE}%`
  );
  res.json({
    success: true,
    spreadPercentage: SPREAD_PORCENTAJE,
    commissionPercentage: COMISION_PORCENTAJE,
    swapDailyPercentage: SWAP_DAILY_PORCENTAJE, // NUEVO
  });
});

// --- SISTEMA DE CRÉDITO (ADMIN) ---

// --- GESTIÓN DE INTERESES (ADMIN) ---

// Aplicar Interés (Calcula y suma al acumulado basado en la tasa del usuario)
app.post("/admin/interest/apply", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });
  
  // Verificar admin
  const adminCheck = await pool.query(
    "SELECT rol FROM usuarios WHERE id = $1",
    [req.session.userId]
  );
  if (adminCheck.rows[0]?.rol !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }

  const { userId } = req.body; // Si userId es null, aplica a todos (opcional, aquí haremos por usuario)

  if (!userId) {
     return res.status(400).json({ error: "Se requiere userId" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Obtener datos del usuario
    const userRes = await client.query("SELECT credito, tasa_interes FROM usuarios WHERE id = $1 FOR UPDATE", [userId]);
    const user = userRes.rows[0];

    if (!user) throw new Error("Usuario no encontrado");

    const credito = parseFloat(user.credito || 0);
    const tasa = parseFloat(user.tasa_interes || 0);

    if (credito > 0 && tasa > 0) {
      const interesGenerado = credito * (tasa / 100);
      await client.query("UPDATE usuarios SET interes_acumulado = interes_acumulado + $1 WHERE id = $2", [interesGenerado, userId]);
      await client.query("COMMIT");
      res.json({ success: true, message: `Interés de $${interesGenerado.toFixed(2)} aplicado.`, accumulated: interesGenerado });
    } else {
      await client.query("ROLLBACK");
      res.json({ success: false, message: "No se aplicó interés (Crédito 0 o Tasa 0)." });
    }

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al aplicar interés" });
  } finally {
    client.release();
  }
});

// Cobrar Interés Acumulado (Resta del Balance y resetea acumulado)
app.post("/admin/interest/collect", async (req, res) => {
   if (!req.session.userId) return res.status(401).json({ error: "No autenticado" });
   
   // Verificar admin (omitido por brevedad, asumimos middleware o check anterior)
   const adminCheck = await pool.query("SELECT rol FROM usuarios WHERE id = $1", [req.session.userId]);
   if (adminCheck.rows[0]?.rol !== "admin") return res.status(403).json({ error: "No autorizado" });

   const { userId } = req.body;
   const client = await pool.connect();
   try {
     await client.query("BEGIN");
     const userRes = await client.query("SELECT interes_acumulado FROM usuarios WHERE id = $1 FOR UPDATE", [userId]);
     const pendiente = parseFloat(userRes.rows[0].interes_acumulado || 0);

     if (pendiente > 0) {
        // Restar del balance
        await client.query("UPDATE usuarios SET balance = balance - $1, interes_acumulado = 0 WHERE id = $2", [pendiente, userId]);
        
        // Registrar movimiento? (Opcional, por ahora simple actualización)
        
        await client.query("COMMIT");
        res.json({ success: true, message: `Cobrados $${pendiente.toFixed(2)} de intereses.` });
     } else {
        await client.query("ROLLBACK");
        res.status(400).json({ error: "No hay intereses pendientes para cobrar." });
     }
   } catch(err) {
      await client.query("ROLLBACK");
      console.error(err);
      res.status(500).json({ error: "Error al cobrar intereses" });
   } finally {
      client.release();
   }
});

// Actualizar Tasa de Interés
app.post("/admin/interest/rate", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "No autenticado" });
    const adminCheck = await pool.query("SELECT rol FROM usuarios WHERE id = $1", [req.session.userId]);
    if (adminCheck.rows[0]?.rol !== "admin") return res.status(403).json({ error: "No autorizado" });

    const { userId, rate } = req.body;
    const newRate = parseFloat(rate);
    
    if (isNaN(newRate) || newRate < 0) return res.status(400).json({ error: "Tasa inválida" });

    try {
        await pool.query("UPDATE usuarios SET tasa_interes = $1 WHERE id = $2", [newRate, userId]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: "Error al actualizar tasa" });
    }
});


// Asignar Crédito (Suma al crédito existente)
app.post("/admin/credit/assign", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });

  const { userId, amount } = req.body;
  const creditAmount = parseFloat(amount);

  if (isNaN(creditAmount) || creditAmount <= 0) {
    return res.status(400).json({ error: "Monto inválido" });
  }

  try {
    // Verificar que sea admin
    const adminCheck = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    await pool.query(
      "UPDATE usuarios SET credito = COALESCE(credito, 0) + $1 WHERE id = $2",
      [creditAmount, userId]
    );

    res.json({ success: true, message: "Crédito asignado correctamente" });
  } catch (err) {
    console.error("Error asignando crédito:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// Cobrar Crédito (Resta del Crédito Y del Balance)
app.post("/admin/credit/collect", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "No autenticado" });

  const { userId, amount } = req.body;
  const collectAmount = parseFloat(amount);

  if (isNaN(collectAmount) || collectAmount <= 0) {
    return res.status(400).json({ error: "Monto inválido" });
  }

  const client = await pool.connect();
  try {
    // Verificar Admin
    const adminCheck = await client.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [req.session.userId]
    );
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    await client.query("BEGIN");

    // Verificar saldo/crédito actual
    const userRes = await client.query(
      "SELECT balance, credito FROM usuarios WHERE id = $1 FOR UPDATE",
      [userId]
    );
    if (userRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const currentBalance = parseFloat(userRes.rows[0].balance);
    const currentCredit = parseFloat(userRes.rows[0].credito) || 0;

    // Lógica: Restar del Balance Y Restar del Crédito (hasta 0)
    // "cuando se cobre el dinero salga del balance"
    // Pero el crédito también debe bajar, verdad?
    // Si cobro crédito, el usuario "paga" el crédito.
    // Ej: User tiene 1000 crédito. Cobra 1000. Balance baja 1000. Crédito baja 1000.
    
    await client.query(
      "UPDATE usuarios SET balance = balance - $1, credito = GREATEST(0, credito - $1) WHERE id = $2",
      [collectAmount, userId]
    );

    await client.query("COMMIT");
    res.json({ success: true, message: "Crédito cobrado del balance correctamente" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error cobrando crédito:", err);
    res.status(500).json({ error: "Error interno" });
  } finally {
    client.release();
  }
});

// --- NUEVA RUTA ADMIN: ENVIAR NOTIFICACIÓN GLOBAL ---
app.post("/admin/notificar", async (req, res) => {
  if (!req.session.userId || req.session.rol !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }
  const { mensaje } = req.body;

  if (!mensaje || mensaje.length < 5) {
    return res
      .status(400)
      .json({ error: "El mensaje debe tener al menos 5 caracteres." });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO notificaciones (mensaje) VALUES ($1) RETURNING *",
      [mensaje]
    );

    const notification = rows[0];

    // Enviar notificación en tiempo real a todos los clientes conectados
    broadcast({
      type: "admin_notification",
      message: notification.mensaje,
      id: notification.id,
      date: notification.fecha,
    });

    console.log(`📣 NOTIFICACIÓN GLOBAL ENVIADA: ${mensaje}`);
    res.json({ success: true, notification });
  } catch (err) {
    console.error("Error al enviar notificación:", err);
    res.status(500).json({ error: "Error interno al enviar la notificación." });
  }
});

// Lógica para manejar suscripciones enviadas por el cliente
wss.on("connection", (ws, req) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === "subscribe" && Array.isArray(data.symbols)) {
        console.log(
          `[WS] Cliente solicitó suscripción a: ${data.symbols.join(", ")}`
        );

        const newKuCoinSymbols = [];
        const newTwelveDataSymbols = [];

        data.symbols.forEach((symbol) => {
          const normalized = normalizeSymbol(symbol);

          if (symbol.includes("USDT")) {
            // Es KuCoin. Usamos el formato BTC-USDT para la suscripción
            const kuCoinFormat = symbol.replace("USDT", "USDT");
            if (!activeKuCoinSubscriptions.has(kuCoinFormat)) {
              activeKuCoinSubscriptions.add(kuCoinFormat);
              newKuCoinSymbols.push(kuCoinFormat);
            }
          } else {
            // Es Twelve Data (Forex, Indices, Stocks, Commodities).
            if (!activeTwelveDataSubscriptions.has(symbol)) {
              activeTwelveDataSubscriptions.add(symbol);
              newTwelveDataSymbols.push(symbol);
            }
          }
        });

        // 2. Iniciar/Actualizar las conexiones con nuevos símbolos
        if (newKuCoinSymbols.length > 0) {
          subscribeToKuCoin(Array.from(activeKuCoinSubscriptions));
        }
        if (newTwelveDataSymbols.length > 0) {
          sendTwelveDataSubscription(Array.from(activeTwelveDataSubscriptions));
        }

        // 3. Enviar precios actuales inmediatamente después de la suscripción
        const currentPrices = {};
        data.symbols.forEach((symbol) => {
          const normalized = normalizeSymbol(symbol);
          // Si tenemos el precio, lo enviamos de vuelta al cliente
          if (global.preciosEnTiempoReal[normalized]) {
            currentPrices[normalized] = global.preciosEnTiempoReal[normalized];
          }
        });
        if (Object.keys(currentPrices).length > 0) {
          ws.send(
            JSON.stringify({
              type: "price_update",
              prices: currentPrices,
            })
          );
        }
      }
    } catch (e) {
      console.error("Error al parsear mensaje de WS:", e);
    }
  });

  ws.on("close", () => {
    // La reconexión se maneja en los handlers de KuCoin y Twelve Data
  });
});

// --- Inicio del Servidor ---
const startServer = async () => {
  try {
    // Ejecutar migraciones automáticas antes de iniciar
    await runMigrations(pool);

    await pool.query(`
          CREATE TABLE IF NOT EXISTS "user_sessions" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL,
            CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sid")
          );
        `);
    console.log("Tabla de sesiones verificada/creada.");

    // Establecer la frecuencia de ejecución del Swap/TP/SL/Stop-Out (cada 15s en modo simulación)
    const CHECK_INTERVAL_MS = 5000; // 5 segundos para comprobaciones rápidas de TP/SL/Stop-Out
    const modeName = "Desarrollo/Producción (TP/SL Rápido, Swap Diario)";

    // Escuchar en el puerto definido por el entorno (Render)
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`🛠️ Modo de Ejecución: ${modeName}`);

      iniciarWebSocketKuCoin();
      iniciarWebSocketTwelveData();

      // El Swap/TP/SL/Stop-Out se aplica al intervalo definido (15s)
      setInterval(() => cerrarOperacionesAutomáticamente(), CHECK_INTERVAL_MS);
      console.log(
        `⏱️ TP/SL/Stop-Out checks se ejecutan cada ${
          CHECK_INTERVAL_MS / 1000
        } segundos. El Swap solo se cobra una vez cada 24 horas.`
      );
    });

    server.on("upgrade", (request, socket, head) => {
      const origin = request.headers.origin;
      console.log(
        `[WebSocket Upgrade] Intento de conexión desde el origen: ${origin}`
      );

      const normalizedOrigin = normalizeOrigin(origin);
      let originIsAllowed = false;

      if (!origin && NODE_ENV !== "production") {
        originIsAllowed = true;
      } else if (normalizedOrigin) {
        originIsAllowed = allowedOrigins.some(
          (allowed) =>
            normalizedOrigin === allowed ||
            normalizedOrigin.endsWith(`.${allowed}`)
        );
      }

      if (!originIsAllowed) {
        console.error(
          `[WebSocket Upgrade] Bloqueado: El origen '${origin}' no está en la lista de permitidos.`
        );
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      // FIX CRÍTICO: Usar un middleware que ya fue inicializado para la sesión
      sessionMiddleware(request, {}, () => {
        // --- CORRECCIÓN DE SEGURIDAD: VERIFICACIÓN DE SESIÓN ---
        if (!request.session || !request.session.userId) {
          console.error(
            `[WebSocket SECURITY] Bloqueado: Sesión no autenticada.`
          );
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }
        // --- FIN CORRECCIÓN DE SEGURIDAD ---

        console.log(
          `[WebSocket Upgrade] Éxito: Sesión validada para el usuario ${request.session.userId}. Actualizando conexión.`
        );

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
