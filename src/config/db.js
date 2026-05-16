const { Pool } = require("pg");

const isTest = process.env.NODE_ENV === "test";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: isTest ? process.env.TEST_DB_NAME : process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT || 5432)
});

module.exports = pool;