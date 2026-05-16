const pool = require("../../config/db");

function parseContractItems(formData) {
  const items = [];

  const equipmentIds = Array.isArray(formData.equipmentId)
    ? formData.equipmentId
    : [formData.equipmentId];

  const prices = Array.isArray(formData.pricePerDay)
    ? formData.pricePerDay
    : [formData.pricePerDay];

  for (let i = 0; i < equipmentIds.length; i++) {
    if (!equipmentIds[i] && !prices[i]) {
      continue;
    }

    items.push({
      equipmentId: Number(equipmentIds[i]),
      pricePerDay: Number(prices[i])
    });
  }

  return items;
}

async function createFromContractForm(requestId, workerId, formData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const items = parseContractItems(formData);

    const contractResult = await client.query(
      `
      INSERT INTO Ugovor_o_najmu
      (
        Datum_Sklapanja,
        Datum_Pocetka_Najma,
        Ocekivani_Povrat,
        ID_Korisnika,
        ID_Djelatnika,
        ID_Zahtjeva,
        Status
      )
      VALUES
      (
        CURRENT_DATE,
        $1,
        $2,
        $3,
        $4,
        $5,
        'Na čekanju potvrde korisnika'
      )
      RETURNING ID_Ugovora
      `,
      [
        formData.rentalStartDate,
        formData.expectedReturnDate,
        Number(formData.clientId),
        workerId,
        requestId
      ]
    );

    const contractId = contractResult.rows[0].id_ugovora;

    for (const item of items) {
      await client.query(
        `
        INSERT INTO Stavka_ugovora
        (
          ID_Ugovora,
          ID_Artikla,
          Ugovorena_Cijena_Po_Danu
        )
        VALUES ($1, $2, $3)
        `,
        [
          contractId,
          item.equipmentId,
          item.pricePerDay
        ]
      );

    }

    await client.query(
      `
      UPDATE Zahtjev_za_najam
      SET Status = 'Odobren',
          ID_Djelatnika = $2
      WHERE ID_Zahtjeva = $1
      `,
      [requestId, workerId]
    );

    await client.query("COMMIT");

    return contractId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createFromContractForm
};
