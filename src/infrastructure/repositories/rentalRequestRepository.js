const pool = require("../../config/db");

async function findAvailableDevices() {
  const result = await pool.query(
    `
    SELECT
      u.ID_Artikla AS id,
      a.Naziv_Artikla AS name,
      a.Proizvodac AS manufacturer,
      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status
    FROM Uredaj u
    JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla
    WHERE a.Aktivan = TRUE
      AND u.Status_Raspolozivosti = 'Dostupan'
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
      u.Status_Raspolozivosti AS availability_status
    FROM Uredaj u
    JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla
    WHERE u.ID_Artikla = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function create(rentalRequest) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const requestResult = await client.query(
      `
      INSERT INTO Zahtjev_za_najam
      (
        Datum_Podnosenja,
        Zeljeni_Datum_Pocetka,
        Zeljeni_Datum_Povrata,
        Status,
        ID_Korisnika,
        ID_Djelatnika
      )
      VALUES
      (
        CURRENT_DATE,
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING ID_Zahtjeva
      `,
      [
        rentalRequest.desiredStartDate,
        rentalRequest.desiredReturnDate,
        rentalRequest.status,
        rentalRequest.clientId,
        rentalRequest.workerId
      ]
    );

    const requestId = requestResult.rows[0].id_zahtjeva;

    for (const item of rentalRequest.items) {
      await client.query(
        `
        INSERT INTO Stavka_zahtjeva_najma
        (
          ID_Zahtjeva,
          ID_Artikla,
          Cijena_Po_Danu
        )
        VALUES ($1, $2, $3)
        `,
        [
          requestId,
          item.equipmentId,
          item.pricePerDay
        ]
      );
    }

    await client.query("COMMIT");

    return findById(requestId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function findByClientId(clientId) {
  const result = await pool.query(
    `
    SELECT
      z.ID_Zahtjeva AS id,
      z.Datum_Podnosenja AS submitted_date,
      z.Zeljeni_Datum_Pocetka AS desired_start_date,
      z.Zeljeni_Datum_Povrata AS desired_return_date,
      z.Status AS status,
      z.ID_Korisnika AS client_id,
      COUNT(s.ID_Artikla) AS item_count
    FROM Zahtjev_za_najam z
    LEFT JOIN Stavka_zahtjeva_najma s
      ON z.ID_Zahtjeva = s.ID_Zahtjeva
    WHERE z.ID_Korisnika = $1
    GROUP BY z.ID_Zahtjeva
    ORDER BY z.ID_Zahtjeva DESC
    `,
    [clientId]
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
      k.Naziv_Ustanove AS client_name
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
      s.ID_Zahtjeva AS request_id,
      s.ID_Artikla AS equipment_id,
      s.Cijena_Po_Danu AS price_per_day,
      a.Naziv_Artikla AS equipment_name,
      a.Proizvodac AS manufacturer,
      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status
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

module.exports = {
  findAvailableDevices,
  findDeviceById,
  create,
  findByClientId,
  findById
};