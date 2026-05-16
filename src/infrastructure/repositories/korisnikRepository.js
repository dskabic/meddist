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

module.exports = {
  findByEmail
};