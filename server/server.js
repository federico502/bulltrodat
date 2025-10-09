/*
IMPORTANTE: Para que la nueva funcionalidad de apalancamiento funcione,
es necesario modificar la base de datos. Ejecute el siguiente comando SQL
en su base de datos PostgreSQL:

ALTER TABLE operaciones ADD COLUMN apalancamiento INTEGER DEFAULT 1;

Este comando añade la columna 'apalancamiento' a la tabla de operaciones.
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
import fetch from "node-fetch"; // Importación necesaria para llamadas a APIs externas
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
  TWELVE_DATA_API_KEY, // Clave para precios reales
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

const allowedOrigins = FRONTEND_URLS.split(",").map((url) => url.trim());
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        (NODE_ENV !== "production" && !origin)
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
      "connect-src": ["'self'", "wss:", "https:", "wss://ws.twelve-data.com"], // Twelve Data WS
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
    secure: NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    sameSite: NODE_ENV === "production" ? "none" : "lax",
  },
});
app.use(sessionMiddleware);

// --- Lógica de WebSockets ---
global.preciosEnTiempoReal = {};

// Almacena los símbolos a los que el frontend se ha suscrito.
// Key: Normalized Symbol (ej: 'BTCUSDT'), Value: Initial/Base Price
const subscribedAssets = new Map();
let twelveDataWs = null; // Conexión a Twelve Data

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

/**
 * Normaliza el símbolo para ser usado como clave en global.preciosEnTiempoReal (ej: BTCUSDT o EURUSD).
 * Esta clave debe ser la misma que usa el frontend para buscar precios.
 */
function normalizeSymbol(symbol) {
  // Asegura que los símbolos como BTC-USDT o EUR/USD se conviertan a BTCUSDT o EURUSD
  return symbol.toUpperCase().replace(/[-/]/g, "");
}

/**
 * Convierte los símbolos del frontend (ej: BTC-USDT, EUR/USD) al formato de Twelve Data (BTC/USD, EUR/USD).
 * Twelve Data no soporta 'USDT' directamente, por lo que usamos '/USD' y ajustamos el mapeo de vuelta.
 */
function convertToTwelveDataSymbol(symbol) {
  let s = symbol.toUpperCase();
  if (s.includes("-USDT")) {
    // Criptos: BTC-USDT -> BTC/USD
    return s.replace("-USDT", "/USD");
  }
  // Forex/Commodities: EUR/USD, XAU/USD ya están en el formato correcto
  return s.replace("-", "/"); // Asegura que cualquier guion sea barra
}

// --- FUNCIÓN CRÍTICA: INICIAR CONEXIÓN REAL TWELVE DATA ---
function iniciarWebSocketTwelveData(symbols) {
  if (!TWELVE_DATA_API_KEY) {
    console.error(
      "No se puede iniciar Twelve Data WS: TWELVE_DATA_API_KEY no está definida."
    );
    return;
  }

  // Si la conexión ya existe y está abierta, solo enviamos la suscripción.
  if (twelveDataWs && twelveDataWs.readyState === WebSocket.OPEN) {
    const twelveDataSymbols = symbols.map(convertToTwelveDataSymbol);
    const subscriptionMessage = JSON.stringify({
      action: "subscribe",
      symbols: twelveDataSymbols.join(","),
    });
    twelveDataWs.send(subscriptionMessage);
    console.log(`[TwelveData] Suscrito a: ${twelveDataSymbols.join(", ")}`);
    return;
  }

  // Intentar abrir la conexión
  const wsUrl = `wss://ws.twelve-data.com/v1/quotes/price?apikey=${TWELVE_DATA_API_KEY}`;
  twelveDataWs = new WebSocket(wsUrl);

  twelveDataWs.onopen = () => {
    console.log(
      "🟢 [TwelveData] Conexión establecida. Suscribiendo activos..."
    );
    if (symbols && symbols.length > 0) {
      const twelveDataSymbols = symbols.map(convertToTwelveDataSymbol);
      const subscriptionMessage = JSON.stringify({
        action: "subscribe",
        symbols: twelveDataSymbols.join(","),
      });
      twelveDataWs.send(subscriptionMessage);
      console.log(`[TwelveData] Suscrito a: ${twelveDataSymbols.join(", ")}`);
    }
  };

  twelveDataWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.event === "price") {
        const twelveDataSymbol = data.symbol; // Ej: BTC/USD, EUR/USD
        const price = parseFloat(data.price);

        // --- ARREGLO CRÍTICO DE MAPEO V2 ---
        let normalizedKey = normalizeSymbol(twelveDataSymbol);

        // Expresión regular para identificar pares X/USD que NO son Forex/Commodities
        // Lista de Forex/Commodities conocidos que usan /USD (o similar) y NO deben ser USDT:
        // EUR, GBP, AUD, NZD, CAD, CHF, JPY (base), XAU, XAG, WTI, BRENT, NG
        const knownBaseSymbols =
          /^(EUR|GBP|AUD|NZD|CAD|CHF|JPY|XAG|XAU|WTI|BRENT|NG)/i;

        if (
          twelveDataSymbol.endsWith("/USD") &&
          !twelveDataSymbol.match(knownBaseSymbols)
        ) {
          // Esto atrapa criptos como BTC/USD y las convierte a BTCUSDT
          normalizedKey = normalizedKey.replace("USD", "USDT");
        }
        // Para el resto (Forex/Commodities y Acciones/Índices), normalizeSymbol es suficiente (EURUSD, AAPL, DAX).

        // --- FIN ARREGLO CRÍTICO DE MAPEO V2 ---

        if (!isNaN(price)) {
          // Usamos toFixed(4) para uniformidad, aunque las acciones/criptos a veces necesitan más.
          // El frontend usará parseFloat(priceString) para la comparación de flasheo.
          global.preciosEnTiempoReal[normalizedKey] = price.toFixed(4);

          // Transmitir la actualización a todos los clientes del frontend
          broadcast({
            type: "price_update",
            prices: {
              [normalizedKey]: global.preciosEnTiempoReal[normalizedKey],
            },
          });
        }
      } else if (data.event === "subscribe-success") {
        console.log(
          `[TwelveData] Suscripción exitosa: ${data.success.join(", ")}`
        );
      } else if (data.event === "error") {
        console.error(
          `[TwelveData] Error de suscripción: ${data.message} para ${data.symbol}`
        );
      }
    } catch (e) {
      console.error("[TwelveData] Error al procesar mensaje:", e);
    }
  };

  twelveDataWs.onclose = () => {
    console.warn(
      "🟡 [TwelveData] Conexión cerrada. Reintentando en 15 segundos..."
    );
    setTimeout(() => iniciarWebSocketTwelveData(symbols), 15000);
  };

  twelveDataWs.onerror = (err) => {
    console.error("❌ [TwelveData] Error de WebSocket:", err.message);
  };
}
// --- FIN FUNCIÓN CRÍTICA TWELVE DATA ---

async function getLatestPrice(symbol) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const price = global.preciosEnTiempoReal[normalizedSymbol];
  return price !== undefined ? parseFloat(price) : null;
}

// Lógica para manejar suscripciones enviadas por el cliente
wss.on("connection", (ws, req) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === "subscribe" && Array.isArray(data.symbols)) {
        console.log(
          `[WS] Cliente solicitó suscripción a: ${data.symbols.join(", ")}`
        );

        // 1. Agregar los símbolos solicitados al mapa de activos suscritos
        const newSymbolsToSubscribe = [];
        data.symbols.forEach((symbol) => {
          const normalized = normalizeSymbol(symbol);
          if (!subscribedAssets.has(normalized)) {
            subscribedAssets.set(normalized, 0); // Añadir al mapa de control
            newSymbolsToSubscribe.push(symbol);
          }
        });

        // 2. Iniciar/Actualizar la conexión a Twelve Data con los nuevos símbolos
        if (newSymbolsToSubscribe.length > 0) {
          iniciarWebSocketTwelveData(newSymbolsToSubscribe);
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
    // Aquí se podría implementar la lógica para desuscribir de Twelve Data
    // si no quedan clientes conectados a un activo, pero lo omitimos por simplicidad.
  });
});

async function cerrarOperacionesAutomáticamente() {
  const client = await pool.connect();
  try {
    // 1. Lógica de cierre por TP/SL (manteniendo la lógica de la versión anterior)
    const result = await client.query(
      "SELECT * FROM operaciones WHERE cerrada = false AND (take_profit IS NOT NULL OR stop_loss IS NOT NULL)"
    );
    const operaciones = result.rows;
    for (const op of operaciones) {
      const precioActual = await getLatestPrice(op.activo);
      if (!precioActual) continue;

      let cerrar = false;
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
        const volumen = parseFloat(op.volumen);
        let ganancia = 0;

        if (tipo === "buy" || tipo === "compra") {
          ganancia = (precioActual - entrada) * volumen;
        } else {
          ganancia = (entrada - precioActual) * volumen;
        }

        const montoADevolver = ganancia; // Solo la ganancia/pérdida

        await client.query("BEGIN");
        await client.query(
          "UPDATE operaciones SET cerrada = true, ganancia = $1, precio_cierre = $2 WHERE id = $3",
          [ganancia, precioActual, op.id]
        );
        await client.query(
          "UPDATE usuarios SET balance = balance + $1 WHERE id = $2",
          [montoADevolver, op.usuario_id]
        );
        await client.query("COMMIT");
      }
    }

    // 2. NUEVA LÓGICA: Cobro de Swap Diario
    const openOpsResult = await client.query(
      "SELECT id, usuario_id, capital_invertido FROM operaciones WHERE cerrada = false"
    );
    const operacionesAbiertas = openOpsResult.rows;

    if (operacionesAbiertas.length > 0 && SWAP_DAILY_PORCENTAJE > 0) {
      const swapRate = SWAP_DAILY_PORCENTAJE / 100; // Convertir a decimal

      // Calcular el costo total de Swap para cada usuario
      const swapCostByUser = {};

      for (const op of operacionesAbiertas) {
        const margen = parseFloat(op.capital_invertido);
        const costoSwap = margen * swapRate;

        if (!swapCostByUser[op.usuario_id]) {
          swapCostByUser[op.usuario_id] = 0;
        }
        swapCostByUser[op.usuario_id] += costoSwap;
      }

      await client.query("BEGIN");

      // Descontar el costo de Swap del balance de cada usuario
      for (const userId in swapCostByUser) {
        const totalSwapCost = swapCostByUser[userId];

        if (totalSwapCost > 0) {
          // Descontar el Swap del balance
          await client.query(
            "UPDATE usuarios SET balance = balance - $1 WHERE id = $2",
            [totalSwapCost, userId]
          );
        }
      }

      await client.query("COMMIT");
      console.log(
        `✅ Swap diario cobrado a ${
          Object.keys(swapCostByUser).length
        } usuarios.`
      );
    }
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error al procesar Swap o cerrar operaciones:", err);
  } finally {
    client.release();
  }
}

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
      "SELECT id, nombre, email, balance, rol, identificacion, telefono, platform_id FROM usuarios WHERE id = $1",
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

// --- NUEVA RUTA: CAMBIAR CONTRASEÑA ---
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

// --- RUTA CLAVE: OPERAR (Lógica de Margen Corregida y Comisiones Añadidas) ---
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

    // Obtener balance actual del usuario
    const userRes = await client.query(
      "SELECT balance FROM usuarios WHERE id = $1 FOR UPDATE",
      [usuario_id]
    );

    if (userRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    const balanceActual = parseFloat(userRes.rows[0].balance);

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
    // La equidad mínima necesaria es: Margen Usado Actual + Margen Requerido + Costo de Comisión
    if (balanceActual < margenUsadoActual + margenRequerido + comisionCosto) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error:
          "Fondos insuficientes (Margen Libre bajo o insuficiente para cubrir la comisión).",
      });
    }

    // 4. Descontar la comisión del Balance (Esta sí es una pérdida inmediata)
    await client.query(
      "UPDATE usuarios SET balance = balance - $1 WHERE id = $2",
      [comisionCosto, usuario_id]
    );

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
    // const capital_invertido = parseFloat(op.capital_invertido); // Ya no se necesita el capital invertido aquí

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
      [gananciaFinal, precioActual, operacion_id]
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
      `SELECT SUM(capital_invertido) AS total_invertido, SUM(CASE WHEN cerrada THEN ganancia ELSE 0 END) AS ganancia_total, COUNT(*) FILTER (WHERE cerrada) AS cerradas, COUNT(*) FILTER (WHERE NOT cerrada) AS abiertas FROM operaciones WHERE usuario_id = $1`,
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
      "SELECT id, nombre, email, balance, rol, identificacion, telefono, platform_id FROM usuarios WHERE platform_id = $1 ORDER BY id ASC LIMIT $2 OFFSET $3",
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

// --- NUEVA RUTA ADMIN: GESTIONAR COMISIONES Y SWAP ---
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

    // NOTA CLAVE: No llamamos a iniciarWebSocketTwelveData aquí.
    // Lo llamamos dentro de wss.on('connection') para solo suscribir
    // los símbolos que el cliente realmente necesita.

    // Escuchar en el puerto definido por el entorno (Render)
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      // El Swap se aplica cada 24 horas (86400000 ms), aquí 5s para prueba.
      setInterval(() => cerrarOperacionesAutomáticamente(), 5000); // 5 segundos para prueba
    });

    server.on("upgrade", (request, socket, head) => {
      const origin = request.headers.origin;
      console.log(
        `[WebSocket Upgrade] Intento de conexión desde el origen: ${origin}`
      );

      if (!origin || allowedOrigins.indexOf(origin) === -1) {
        console.error(
          `[WebSocket Upgrade] Bloqueado: El origen '${origin}' no está en la lista de permitidos.`
        );
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      sessionMiddleware(request, {}, () => {
        if (!request.session || !request.session.userId) {
          console.error(
            `[WebSocket Upgrade] Bloqueado: No se encontró una sesión activa para el origen '${origin}'.`
          );
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

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
