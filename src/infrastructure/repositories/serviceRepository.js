const pool = require("../../config/db");

async function findAll(search = "") {
  const result = await pool.query(
    `
    SELECT
      s.ID_Servisa AS id,
      s.Datum_Izdavanja AS service_date,
      s.Opis_Radova AS description,
      s.ID_Artikla AS equipment_id,

      a.Naziv_Artikla AS equipment_name,
      a.Proizvodac AS manufacturer,

      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status,
      CASE
        WHEN u.Status_Raspolozivosti = 'Na servisu' THEN 'U tijeku'
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
      s.Opis_Radova AS description,
      s.ID_Artikla AS equipment_id,

      a.Naziv_Artikla AS equipment_name,
      a.Proizvodac AS manufacturer,

      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status,
      CASE
        WHEN u.Status_Raspolozivosti = 'Na servisu' THEN 'U tijeku'
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

async function create(serviceRecord) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO Servis
      (Datum_Izdavanja, Opis_Radova, ID_Artikla)
      VALUES ($1, $2, $3)
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
  const service = await findById(id);

  if (!service) {
    throw new Error("Servis nije pronađen.");
  }

  await pool.query(
    `
    UPDATE Uredaj
    SET Status_Raspolozivosti = 'Dostupan'
    WHERE ID_Artikla = $1
    `,
    [service.equipment_id]
  );
}

module.exports = {
  findAll,
  findById,
  findAvailableDevices,
  findDeviceById,
  create,
  update,
  remove,
  finishService
};