const pool = require("../../config/db");

async function findAll(search = "") {
  const result = await pool.query(
    `
    SELECT
      a.ID_Artikla AS id,
      a.Naziv_Artikla AS name,
      a.Proizvodac AS manufacturer,
      a.Aktivan AS active,

      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status,
      u.Zadana_Cijena_Po_Danu AS default_rental_price_per_day,

      pm.LOT_Broj AS lot_number,
      pm.Trenutna_Zaliha AS current_stock,
      pm.Zadana_Jedinicna_Cijena AS default_unit_price,

      CASE
        WHEN u.ID_Artikla IS NOT NULL THEN 'UREDAJ'
        WHEN pm.ID_Artikla IS NOT NULL THEN 'POTROSNI_MATERIJAL'
        ELSE 'NEPOZNATO'
      END AS type

    FROM Artikl a
    LEFT JOIN Uredaj u ON a.ID_Artikla = u.ID_Artikla
    LEFT JOIN Potrosni_materijal pm ON a.ID_Artikla = pm.ID_Artikla
    WHERE a.Aktivan = TRUE
      AND (
        LOWER(a.Naziv_Artikla) LIKE LOWER($1)
        OR LOWER(COALESCE(a.Proizvodac, '')) LIKE LOWER($1)
        OR LOWER(COALESCE(u.Serijski_Broj, '')) LIKE LOWER($1)
        OR LOWER(COALESCE(pm.LOT_Broj, '')) LIKE LOWER($1)
      )
    ORDER BY a.ID_Artikla
    `,
    [`%${search}%`]
  );

  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    `
    SELECT
      a.ID_Artikla AS id,
      a.Naziv_Artikla AS name,
      a.Proizvodac AS manufacturer,
      a.Aktivan AS active,

      u.Serijski_Broj AS serial_number,
      u.Status_Raspolozivosti AS availability_status,
      u.Zadana_Cijena_Po_Danu AS default_rental_price_per_day,

      pm.LOT_Broj AS lot_number,
      pm.Trenutna_Zaliha AS current_stock,
      pm.Zadana_Jedinicna_Cijena AS default_unit_price,

      CASE
        WHEN u.ID_Artikla IS NOT NULL THEN 'UREDAJ'
        WHEN pm.ID_Artikla IS NOT NULL THEN 'POTROSNI_MATERIJAL'
        ELSE 'NEPOZNATO'
      END AS type

    FROM Artikl a
    LEFT JOIN Uredaj u ON a.ID_Artikla = u.ID_Artikla
    LEFT JOIN Potrosni_materijal pm ON a.ID_Artikla = pm.ID_Artikla
    WHERE a.ID_Artikla = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function create(equipment) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const articleResult = await client.query(
      `
      INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
      VALUES ($1, $2, TRUE)
      RETURNING ID_Artikla
      `,
      [equipment.name, equipment.manufacturer || null]
    );

    const articleId = articleResult.rows[0].id_artikla;

    if (equipment.type === "UREDAJ") {
      await client.query(
      `
      INSERT INTO Uredaj
     (ID_Artikla, Serijski_Broj, Status_Raspolozivosti, Zadana_Cijena_Po_Danu)
      VALUES ($1, $2, $3, $4)
    `,
   [
     articleId,
     equipment.serialNumber,
     equipment.availabilityStatus || "Dostupan",
     equipment.defaultRentalPricePerDay
   ]
);
    }

    if (equipment.type === "POTROSNI_MATERIJAL") {
      await client.query(
      `
      INSERT INTO Potrosni_materijal
      (ID_Artikla, LOT_Broj, Trenutna_Zaliha, Zadana_Jedinicna_Cijena)
      VALUES ($1, $2, $3, $4)
     `,
   [
      articleId,
      equipment.lotNumber,
      Number(equipment.currentStock),
     equipment.defaultUnitPrice
   ]
);
    }

    await client.query("COMMIT");

    return findById(articleId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function update(id, equipment) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const oldEquipment = await findById(id);

    if (!oldEquipment) {
      throw new Error("Artikl nije pronađen.");
    }

    await client.query(
      `
      UPDATE Artikl
      SET Naziv_Artikla = $1,
          Proizvodac = $2
      WHERE ID_Artikla = $3
      `,
      [equipment.name, equipment.manufacturer || null, id]
    );

    if (oldEquipment.type !== equipment.type) {
      await client.query("DELETE FROM Uredaj WHERE ID_Artikla = $1", [id]);
      await client.query("DELETE FROM Potrosni_materijal WHERE ID_Artikla = $1", [id]);

      if (equipment.type === "UREDAJ") {
        await client.query(
          `
          INSERT INTO Uredaj
          (ID_Artikla, Serijski_Broj, Status_Raspolozivosti, Zadana_Cijena_Po_Danu)
          VALUES ($1, $2, $3, $4)
          `,
          [
            id,
            equipment.serialNumber,
            equipment.availabilityStatus || "Dostupan",
            equipment.defaultRentalPricePerDay
          ]
        );
      }

      if (equipment.type === "POTROSNI_MATERIJAL") {
        await client.query(
          `
          INSERT INTO Potrosni_materijal
          (ID_Artikla, LOT_Broj, Trenutna_Zaliha, Zadana_Jedinicna_Cijena)
          VALUES ($1, $2, $3, $4)
          `,
          [
            id,
            equipment.lotNumber,
            Number(equipment.currentStock),
            equipment.defaultUnitPrice
          ]
        );
      }
    } else {
      if (equipment.type === "UREDAJ") {
        await client.query(
  `
  UPDATE Uredaj
  SET Serijski_Broj = $1,
      Status_Raspolozivosti = $2,
      Zadana_Cijena_Po_Danu = $3
  WHERE ID_Artikla = $4
  `,
  [
    equipment.serialNumber,
    equipment.availabilityStatus || "Dostupan",
    equipment.defaultRentalPricePerDay,
    id
  ]
);
      }

      if (equipment.type === "POTROSNI_MATERIJAL") {
        await client.query(
  `
  UPDATE Potrosni_materijal
  SET LOT_Broj = $1,
      Trenutna_Zaliha = $2,
      Zadana_Jedinicna_Cijena = $3
  WHERE ID_Artikla = $4
  `,
  [
    equipment.lotNumber,
    Number(equipment.currentStock),
    equipment.defaultUnitPrice,
    id
  ]
);
      }
    }

    await client.query("COMMIT");

    return findById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
async function isDeviceCurrentlyRented(id) {
  const result = await pool.query(
    `
    SELECT
      u.ID_Ugovora AS contract_id,
      u.Datum_Pocetka_Najma AS rental_start_date,
      u.Ocekivani_Povrat AS expected_return_date,
      u.Status AS contract_status
    FROM Ugovor_o_najmu u
    JOIN Stavka_ugovora su
      ON u.ID_Ugovora = su.ID_Ugovora
    WHERE su.ID_Artikla = $1
      AND u.Status IN ('Na čekanju potvrde korisnika', 'Potvrđen')
      AND CURRENT_DATE BETWEEN u.Datum_Pocetka_Najma AND u.Ocekivani_Povrat
    LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function softDelete(id) {
  await pool.query(
    `
    UPDATE Artikl
    SET Aktivan = FALSE
    WHERE ID_Artikla = $1
    `,
    [id]
  );
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete,
  isDeviceCurrentlyRented
};