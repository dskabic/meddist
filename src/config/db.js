require("dotenv").config();

const { Pool } = require("pg");

const database =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_NAME
    : process.env.DB_NAME;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT || 5432)
});

module.exports = pool;