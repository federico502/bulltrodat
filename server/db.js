// server/db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "tradingapp",
  password: "Nayara28*",
  port: 5432,
});

module.exports = pool;
