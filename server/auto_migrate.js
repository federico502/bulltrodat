export async function runMigrations(pool) {
  console.log("🔄 Verificando y aplicando migraciones de base de datos...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Tabla Usuarios - Nuevas Columnas (Crédito, Teléfono, Identificación)
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS credito NUMERIC DEFAULT 0;");
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(255);");
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS identificacion VARCHAR(255);");
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS interes_acumulado NUMERIC DEFAULT 0;");
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tasa_interes NUMERIC DEFAULT 4.0;");

    // 2. Tabla Operaciones - Nuevas Columnas (Apalancamiento, Cierre, TP/SL)
    await client.query("ALTER TABLE operaciones ADD COLUMN IF NOT EXISTS apalancamiento INTEGER DEFAULT 1;");
    await client.query("ALTER TABLE operaciones ADD COLUMN IF NOT EXISTS precio_cierre NUMERIC;");
    await client.query("ALTER TABLE operaciones ADD COLUMN IF NOT EXISTS ganancia NUMERIC;");
    await client.query("ALTER TABLE operaciones ADD COLUMN IF NOT EXISTS cerrada BOOLEAN DEFAULT FALSE;");
    await client.query("ALTER TABLE operaciones ADD COLUMN IF NOT EXISTS take_profit NUMERIC;");
    await client.query("ALTER TABLE operaciones ADD COLUMN IF NOT EXISTS stop_loss NUMERIC;");

    // 3. Nueva Tabla Notificaciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id SERIAL PRIMARY KEY,
        mensaje TEXT NOT NULL,
        fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Asegurar que las columnas existentes tengan el tipo correcto si fuera necesario
    // (Opcional, pero buena práctica si hay errores de tipo)

    await client.query("COMMIT");
    console.log("✅ Migraciones completadas con éxito.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error en migración automática:", err);
    // IMPORTANTE: En producción, tal vez quieras hacer process.exit(1) si esto falla.
    // Pero para ser resiliente, solo logueamos el error.
  } finally {
    client.release();
  }
}
