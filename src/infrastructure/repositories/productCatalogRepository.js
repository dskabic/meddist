const pool = require("../../config/db");

async function findAvailableProducts(search = "") {
  const result = await pool.query(
    `
    SELECT
      a.ID_Artikla AS id,
      a.Naziv_Artikla AS name,
      a.Proizvodac AS manufacturer,

      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status,
      u.Zadana_Cijena_Po_Danu AS rental_price_per_day,

      pm.LOT_Broj AS lot_number,
      pm.Trenutna_Zaliha AS current_stock,
      pm.Zadana_Jedinicna_Cijena AS unit_price,

      CASE
        WHEN u.ID_Artikla IS NOT NULL THEN 'UREDAJ'
        WHEN pm.ID_Artikla IS NOT NULL THEN 'POTROSNI_MATERIJAL'
        ELSE 'NEPOZNATO'
      END AS type

    FROM Artikl a
    LEFT JOIN Uredaj u
      ON a.ID_Artikla = u.ID_Artikla
    LEFT JOIN Potrosni_materijal pm
      ON a.ID_Artikla = pm.ID_Artikla

    WHERE a.Aktivan = TRUE
      AND (
        u.Status_Raspolozivosti = 'Dostupan'
        OR pm.Trenutna_Zaliha > 0
      )
      AND (
        LOWER(a.Naziv_Artikla) LIKE LOWER($1)
        OR LOWER(COALESCE(a.Proizvodac, '')) LIKE LOWER($1)
        OR LOWER(COALESCE(u.Serijski_Broj, '')) LIKE LOWER($1)
        OR LOWER(COALESCE(pm.LOT_Broj, '')) LIKE LOWER($1)
      )

    ORDER BY a.Naziv_Artikla
    `,
    [`%${search}%`]
  );

  return result.rows;
}

module.exports = {
  findAvailableProducts
};