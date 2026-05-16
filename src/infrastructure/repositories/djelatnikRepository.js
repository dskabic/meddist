const pool = require("../../config/db");

async function findByEmail(email) {
  const result = await pool.query(
    `
    SELECT 
      ID_Djelatnika,
      Ime_Prezime,
      Uloga,
      Email,
      Lozinka_Hash,
      Aktivan
    FROM Djelatnik
    WHERE Email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
}

module.exports = {
  findByEmail
};