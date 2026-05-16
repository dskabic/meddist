const pool = require("../../config/db");

async function findByEmail(email) {
  const result = await pool.query(
    `
    SELECT 
      ID_Korisnika,
      Naziv_Ustanove,
      OIB,
      Email,
      Lozinka_Hash,
      Aktivan
    FROM Korisnik
    WHERE Email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
}
async function findAll() {
  const result = await pool.query(
    `
    SELECT
      ID_Korisnika AS id,
      Naziv_Ustanove AS name,
      OIB AS oib,
      Email AS email
    FROM Korisnik
    WHERE Aktivan = TRUE
    ORDER BY Naziv_Ustanove
    `
  );

  return result.rows;
}

module.exports = {
  findByEmail,
  findAll
};