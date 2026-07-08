export async function runMigrations(pool) {
  console.log("🔄 Verificando y aplicando migraciones de base de datos...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Tabla Usuarios - Nuevas Columnas (Crédito, Teléfono, Identificación, Plataforma)
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS credito NUMERIC DEFAULT 0;");
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(255);");
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS identificacion VARCHAR(255);");
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS interes_acumulado NUMERIC DEFAULT 0;");
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tasa_interes NUMERIC DEFAULT 4.0;");
    await client.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS platform_id VARCHAR(255);");

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

    // 4. Nueva Tabla Retiros
    await client.query(`
      CREATE TABLE IF NOT EXISTS retiros (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        monto NUMERIC NOT NULL,
        metodo VARCHAR(50) NOT NULL,
        detalles JSONB NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aprobado, rechazado
        fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Nueva Tabla Opciones Binarias
    await client.query(`
      CREATE TABLE IF NOT EXISTS opciones_binarias (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        activo VARCHAR(50) NOT NULL,
        monto NUMERIC NOT NULL,
        precio_entrada NUMERIC NOT NULL,
        precio_cierre NUMERIC,
        tipo_opcion VARCHAR(10) NOT NULL,
        duracion INTEGER NOT NULL,
        ganancia NUMERIC,
        finalizada BOOLEAN DEFAULT FALSE,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);

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
