const pool = require("../../config/db");

async function findAll(search = "") {
  const result = await pool.query(
    `
    SELECT
      u.ID_Ugovora AS id,
      u.Datum_Sklapanja AS contract_date,
      u.Datum_Pocetka_Najma AS rental_start_date,
      u.Ocekivani_Povrat AS expected_return_date,
      u.Status AS status,

      k.ID_Korisnika AS client_id,
      k.Naziv_Ustanove AS client_name,
      k.OIB AS client_oib,

      d.ID_Djelatnika AS worker_id,
      d.Ime_Prezime AS worker_name,

      COUNT(su.ID_Artikla) AS item_count,
      COALESCE(SUM(su.Ugovorena_Cijena_Po_Danu), 0) AS daily_total

    FROM Ugovor_o_najmu u
    JOIN Korisnik k
      ON u.ID_Korisnika = k.ID_Korisnika
    JOIN Djelatnik d
      ON u.ID_Djelatnika = d.ID_Djelatnika
    LEFT JOIN Stavka_ugovora su
      ON u.ID_Ugovora = su.ID_Ugovora

    WHERE
      LOWER(k.Naziv_Ustanove) LIKE LOWER($1)
      OR LOWER(k.OIB) LIKE LOWER($1)
      OR LOWER(d.Ime_Prezime) LIKE LOWER($1)
      OR LOWER(u.Status) LIKE LOWER($1)

    GROUP BY
      u.ID_Ugovora,
      k.ID_Korisnika,
      k.Naziv_Ustanove,
      k.OIB,
      d.ID_Djelatnika,
      d.Ime_Prezime

    ORDER BY u.ID_Ugovora DESC
    `,
    [`%${search}%`]
  );

  return result.rows;
}

async function findById(id) {
  const contractResult = await pool.query(
    `
    SELECT
      u.ID_Ugovora AS id,
      u.Datum_Sklapanja AS contract_date,
      u.Datum_Pocetka_Najma AS rental_start_date,
      u.Ocekivani_Povrat AS expected_return_date,
      u.Status AS status,
      u.ID_Zahtjeva AS request_id,

      k.ID_Korisnika AS client_id,
      k.Naziv_Ustanove AS client_name,
      k.OIB AS client_oib,
      k.Ulica AS client_street,
      k.Grad AS client_city,
      k.Postanski_Broj AS client_postal_code,
      k.Email AS client_email,

      d.ID_Djelatnika AS worker_id,
      d.Ime_Prezime AS worker_name,
      d.Uloga AS worker_role,
      d.Email AS worker_email

    FROM Ugovor_o_najmu u
    JOIN Korisnik k
      ON u.ID_Korisnika = k.ID_Korisnika
    JOIN Djelatnik d
      ON u.ID_Djelatnika = d.ID_Djelatnika

    WHERE u.ID_Ugovora = $1
    `,
    [id]
  );

  const contract = contractResult.rows[0];

  if (!contract) {
    return null;
  }

  const itemsResult = await pool.query(
    `
    SELECT
      su.ID_Ugovora AS contract_id,
      su.ID_Artikla AS equipment_id,
      su.Ugovorena_Cijena_Po_Danu AS agreed_price_per_day,

      a.Naziv_Artikla AS equipment_name,
      a.Proizvodac AS manufacturer,

      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status

    FROM Stavka_ugovora su
    JOIN Uredaj u
      ON su.ID_Artikla = u.ID_Artikla
    JOIN Artikl a
      ON u.ID_Artikla = a.ID_Artikla

    WHERE su.ID_Ugovora = $1

    ORDER BY a.Naziv_Artikla
    `,
    [id]
  );

  contract.items = itemsResult.rows;

  return contract;
}

module.exports = {
  findAll,
  findById
};