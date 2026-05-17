const pool = require("../../config/db");

async function findAll(search = "") {
  const result = await pool.query(
    `
    SELECT
      s.ID_Servisa AS id,
      s.Datum_Izdavanja AS service_date,
      s.Datum_Zavrsetka AS finished_date,
      s.Opis_Radova AS description,
      s.ID_Artikla AS equipment_id,

      a.Naziv_Artikla AS equipment_name,
      a.Proizvodac AS manufacturer,

      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status,
      CASE
        WHEN s.Datum_Zavrsetka IS NULL THEN 'U tijeku'
        ELSE 'Završen'
      END AS service_status

    FROM Servis s
    JOIN Uredaj u ON s.ID_Artikla = u.ID_Artikla
    JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla

    WHERE
      LOWER(a.Naziv_Artikla) LIKE LOWER($1)
      OR LOWER(COALESCE(a.Proizvodac, '')) LIKE LOWER($1)
      OR LOWER(u.Serijski_Broj) LIKE LOWER($1)
      OR LOWER(COALESCE(s.Opis_Radova, '')) LIKE LOWER($1)

    ORDER BY s.Datum_Izdavanja DESC, s.ID_Servisa DESC
    `,
    [`%${search}%`]
  );

  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    `
    SELECT
      s.ID_Servisa AS id,
      s.Datum_Izdavanja AS service_date,
      s.Datum_Zavrsetka AS finished_date,
      s.Opis_Radova AS description,
      s.ID_Artikla AS equipment_id,

      a.Naziv_Artikla AS equipment_name,
      a.Proizvodac AS manufacturer,

      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status,
      CASE
        WHEN s.Datum_Zavrsetka IS NULL THEN 'U tijeku'
        ELSE 'Završen'
      END AS service_status

    FROM Servis s
    JOIN Uredaj u ON s.ID_Artikla = u.ID_Artikla
    JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla

    WHERE s.ID_Servisa = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function findAvailableDevices(currentEquipmentId = null) {
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
      OR u.ID_Artikla = $1

    ORDER BY a.Naziv_Artikla
    `
    ,
    [currentEquipmentId]
  );

  return result.rows;
}

async function findDeviceById(equipmentId) {
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
    [equipmentId]
  );

  return result.rows[0] || null;
}

async function findOpenServiceByEquipmentId(equipmentId, excludedServiceId = null) {
  const result = await pool.query(
    `
    SELECT
      ID_Servisa AS id,
      ID_Artikla AS equipment_id
    FROM Servis
    WHERE ID_Artikla = $1
      AND Datum_Zavrsetka IS NULL
      AND ($2::int IS NULL OR ID_Servisa <> $2)
    ORDER BY ID_Servisa DESC
    LIMIT 1
    `,
    [equipmentId, excludedServiceId]
  );

  return result.rows[0] || null;
}

async function create(serviceRecord) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO Servis
      (Datum_Izdavanja, Datum_Zavrsetka, Opis_Radova, ID_Artikla)
      VALUES ($1, NULL, $2, $3)
      RETURNING ID_Servisa
      `,
      [
        serviceRecord.serviceDate,
        serviceRecord.description,
        serviceRecord.equipmentId
      ]
    );

    await client.query(
      `
      UPDATE Uredaj
      SET Status_Raspolozivosti = 'Na servisu'
      WHERE ID_Artikla = $1
      `,
      [serviceRecord.equipmentId]
    );

    await client.query("COMMIT");

    return findById(result.rows[0].id_servisa);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function update(id, serviceRecord) {
  const result = await pool.query(
    `
    UPDATE Servis
    SET Datum_Izdavanja = $1,
        Opis_Radova = $2,
        ID_Artikla = $3
    WHERE ID_Servisa = $4
    RETURNING ID_Servisa
    `,
    [
      serviceRecord.serviceDate,
      serviceRecord.description,
      serviceRecord.equipmentId,
      id
    ]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return findById(id);
}

async function remove(id) {
  await pool.query(
    `
    DELETE FROM Servis
    WHERE ID_Servisa = $1
    `,
    [id]
  );
}

async function finishService(id) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const serviceResult = await client.query(
      `
      SELECT
        ID_Servisa AS id,
        ID_Artikla AS equipment_id,
        Datum_Izdavanja AS service_date,
        Datum_Zavrsetka AS finished_date
      FROM Servis
      WHERE ID_Servisa = $1
      FOR UPDATE
      `,
      [id]
    );

    const service = serviceResult.rows[0];

    if (!service) {
      throw new Error("Servis nije pronađen.");
    }

    if (service.finished_date) {
      throw new Error("Servis je već završen.");
    }

    await client.query(
      `
      UPDATE Servis
      SET Datum_Zavrsetka = GREATEST(CURRENT_DATE, Datum_Izdavanja)
      WHERE ID_Servisa = $1
      `,
      [id]
    );

    const openServicesResult = await client.query(
      `
      SELECT COUNT(*) AS open_count
      FROM Servis
      WHERE ID_Artikla = $1
        AND Datum_Zavrsetka IS NULL
      `,
      [service.equipment_id]
    );

    if (Number(openServicesResult.rows[0].open_count) === 0) {
      await client.query(
        `
        UPDATE Uredaj
        SET Status_Raspolozivosti = 'Dostupan'
        WHERE ID_Artikla = $1
        `,
        [service.equipment_id]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  findAll,
  findById,
  findAvailableDevices,
  findDeviceById,
  findOpenServiceByEquipmentId,
  create,
  update,
  remove,
  finishService
};
