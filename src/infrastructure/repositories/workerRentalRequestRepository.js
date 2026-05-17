const pool = require("../../config/db");

async function findAll(search = "") {
  const result = await pool.query(
    `
    SELECT
      z.ID_Zahtjeva AS id,
      z.Datum_Podnosenja AS submitted_date,
      z.Zeljeni_Datum_Pocetka AS desired_start_date,
      z.Zeljeni_Datum_Povrata AS desired_return_date,
      z.Status AS status,
      z.ID_Korisnika AS client_id,
      k.Naziv_Ustanove AS client_name,
      COUNT(s.ID_Artikla) AS item_count
    FROM Zahtjev_za_najam z
    JOIN Korisnik k ON z.ID_Korisnika = k.ID_Korisnika
    LEFT JOIN Stavka_zahtjeva_najma s
      ON z.ID_Zahtjeva = s.ID_Zahtjeva
    WHERE
      LOWER(k.Naziv_Ustanove) LIKE LOWER($1)
      OR LOWER(z.Status) LIKE LOWER($1)
    GROUP BY z.ID_Zahtjeva, k.Naziv_Ustanove
    ORDER BY z.ID_Zahtjeva DESC
    `,
    [`%${search}%`]
  );

  return result.rows;
}

async function findById(id) {
  const requestResult = await pool.query(
    `
    SELECT
      z.ID_Zahtjeva AS id,
      z.Datum_Podnosenja AS submitted_date,
      z.Zeljeni_Datum_Pocetka AS desired_start_date,
      z.Zeljeni_Datum_Povrata AS desired_return_date,
      z.Status AS status,
      z.ID_Korisnika AS client_id,
      z.ID_Djelatnika AS worker_id,
      k.Naziv_Ustanove AS client_name,
      k.OIB AS client_oib
    FROM Zahtjev_za_najam z
    JOIN Korisnik k ON z.ID_Korisnika = k.ID_Korisnika
    WHERE z.ID_Zahtjeva = $1
    `,
    [id]
  );

  const request = requestResult.rows[0];

  if (!request) {
    return null;
  }

  const itemsResult = await pool.query(
    `
    SELECT
      s.ID_Artikla AS equipment_id,
      a.Naziv_Artikla AS equipment_name,
      a.Proizvodac AS manufacturer,
      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status,
      u.Zadana_Cijena_Po_Danu AS default_rental_price_per_day
    FROM Stavka_zahtjeva_najma s
    JOIN Uredaj u ON s.ID_Artikla = u.ID_Artikla
    JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla
    WHERE s.ID_Zahtjeva = $1
    ORDER BY a.Naziv_Artikla
    `,
    [id]
  );

  request.items = itemsResult.rows;

  return request;
}

async function findAvailableDevices() {
  const result = await pool.query(
    `
    SELECT
      u.ID_Artikla AS id,
      a.Naziv_Artikla AS name,
      a.Proizvodac AS manufacturer,
      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status,
      u.Zadana_Cijena_Po_Danu AS default_rental_price_per_day
    FROM Uredaj u
    JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla
    WHERE a.Aktivan = TRUE
      AND u.Status_Raspolozivosti NOT IN ('Na servisu', 'Nedostupan')
    ORDER BY a.Naziv_Artikla
    `
  );

  return result.rows;
}

async function findDeviceById(id) {
  const result = await pool.query(
    `
    SELECT
      u.ID_Artikla AS id,
      a.Naziv_Artikla AS name,
      a.Proizvodac AS manufacturer,
      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status,
      u.Zadana_Cijena_Po_Danu AS default_rental_price_per_day
    FROM Uredaj u
    JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla
    WHERE u.ID_Artikla = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function isDeviceAvailableForPeriod(deviceId, desiredStartDate, desiredReturnDate) {
  const result = await pool.query(
    `
    SELECT COUNT(*) AS overlap_count
    FROM Stavka_ugovora su
    JOIN Ugovor_o_najmu u
      ON su.ID_Ugovora = u.ID_Ugovora
    WHERE su.ID_Artikla = $1
      AND u.Status NOT IN ('Otkazan od klijenta', 'Otkazan od distributera')
      AND u.Datum_Pocetka_Najma <= $3
      AND u.Ocekivani_Povrat >= $2
    `,
    [deviceId, desiredStartDate, desiredReturnDate]
  );

  return Number(result.rows[0].overlap_count) === 0;
}

async function reject(id, workerId) {
  const result = await pool.query(
    `
    UPDATE Zahtjev_za_najam
    SET Status = 'Odbijen',
        ID_Djelatnika = $2
    WHERE ID_Zahtjeva = $1
      AND Status = 'Zaprimljen'
    RETURNING ID_Zahtjeva
    `,
    [id, workerId]
  );

  return result.rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  findAvailableDevices,
  findDeviceById,
  isDeviceAvailableForPeriod,
  reject
};
