const pool = require("../../config/db");

async function findAvailableConsumables() {
  const result = await pool.query(
    `
    SELECT
      a.ID_Artikla AS id,
      a.Naziv_Artikla AS name,
      a.Proizvodac AS manufacturer,
      pm.LOT_Broj AS lot_number,
      pm.Trenutna_Zaliha AS current_stock,
      pm.Zadana_Jedinicna_Cijena AS default_unit_price
    FROM Artikl a
    JOIN Potrosni_materijal pm ON a.ID_Artikla = pm.ID_Artikla
    WHERE a.Aktivan = TRUE
    ORDER BY a.Naziv_Artikla
    `
  );

  return result.rows;
}

async function findByClientId(clientId) {
  const result = await pool.query(
    `
    SELECT
      nk.ID_Narudzbe AS id,
      nk.Datum_Kreiranja AS created_date,
      nk.Status_Isporuke AS status,
      nk.ID_Korisnika AS client_id,
      nk.ID_Djelatnika AS worker_id,
      COUNT(sn.ID_Artikla) AS item_count,
      COALESCE(SUM(sn.Kolicina * sn.Jedinicna_Cijena), 0) AS total_amount,
      r.ID_Racuna AS invoice_id,
      r.Datum_Izdavanja AS invoice_date
    FROM Narudzba_za_kupnju nk
    LEFT JOIN Stavka_narudzbe sn ON nk.ID_Narudzbe = sn.ID_Narudzbe
    LEFT JOIN Racun r ON nk.ID_Narudzbe = r.ID_Narudzbe
    WHERE nk.ID_Korisnika = $1
    GROUP BY
      nk.ID_Narudzbe,
      nk.Datum_Kreiranja,
      nk.Status_Isporuke,
      nk.ID_Korisnika,
      nk.ID_Djelatnika,
      r.ID_Racuna,
      r.Datum_Izdavanja
    ORDER BY nk.ID_Narudzbe DESC
    `,
    [clientId]
  );

  return result.rows;
}

async function findAll(search = "") {
  const params = [];
  let where = "";

  if (search) {
    params.push(`%${search}%`);
    where = `
      WHERE
        CAST(nk.ID_Narudzbe AS TEXT) ILIKE $1
        OR LOWER(k.Naziv_Ustanove) LIKE LOWER($1)
        OR LOWER(nk.Status_Isporuke) LIKE LOWER($1)
    `;
  }

  const result = await pool.query(
    `
    SELECT
      nk.ID_Narudzbe AS id,
      nk.Datum_Kreiranja AS created_date,
      nk.Status_Isporuke AS status,
      nk.ID_Korisnika AS client_id,
      nk.ID_Djelatnika AS worker_id,
      k.Naziv_Ustanove AS client_name,
      d.Ime_Prezime AS worker_name,
      COUNT(sn.ID_Artikla) AS item_count,
      COALESCE(SUM(sn.Kolicina * sn.Jedinicna_Cijena), 0) AS total_amount,
      r.ID_Racuna AS invoice_id,
      r.Datum_Izdavanja AS invoice_date
    FROM Narudzba_za_kupnju nk
    JOIN Korisnik k ON nk.ID_Korisnika = k.ID_Korisnika
    LEFT JOIN Djelatnik d ON nk.ID_Djelatnika = d.ID_Djelatnika
    LEFT JOIN Stavka_narudzbe sn ON nk.ID_Narudzbe = sn.ID_Narudzbe
    LEFT JOIN Racun r ON nk.ID_Narudzbe = r.ID_Narudzbe
    ${where}
    GROUP BY
      nk.ID_Narudzbe,
      nk.Datum_Kreiranja,
      nk.Status_Isporuke,
      nk.ID_Korisnika,
      nk.ID_Djelatnika,
      k.Naziv_Ustanove,
      d.Ime_Prezime,
      r.ID_Racuna,
      r.Datum_Izdavanja
    ORDER BY nk.ID_Narudzbe DESC
    `,
    params
  );

  return result.rows;
}

async function findById(orderId) {
  const orderResult = await pool.query(
    `
    SELECT
      nk.ID_Narudzbe AS id,
      nk.Datum_Kreiranja AS created_date,
      nk.Status_Isporuke AS status,
      nk.ID_Korisnika AS client_id,
      nk.ID_Djelatnika AS worker_id,
      k.Naziv_Ustanove AS client_name,
      k.OIB AS client_oib,
      k.Grad AS client_city,
      d.Ime_Prezime AS worker_name,
      r.ID_Racuna AS invoice_id,
      r.Datum_Izdavanja AS invoice_date,
      r.Ukupan_Iznos AS invoice_total
    FROM Narudzba_za_kupnju nk
    JOIN Korisnik k ON nk.ID_Korisnika = k.ID_Korisnika
    LEFT JOIN Djelatnik d ON nk.ID_Djelatnika = d.ID_Djelatnika
    LEFT JOIN Racun r ON nk.ID_Narudzbe = r.ID_Narudzbe
    WHERE nk.ID_Narudzbe = $1
    `,
    [orderId]
  );

  const order = orderResult.rows[0];
  if (!order) {
    return null;
  }

  const itemsResult = await pool.query(
    `
    SELECT
      sn.ID_Narudzbe AS order_id,
      sn.ID_Artikla AS article_id,
      sn.Kolicina AS quantity,
      sn.Jedinicna_Cijena AS unit_price,
      a.Naziv_Artikla AS article_name,
      a.Proizvodac AS manufacturer,
      pm.LOT_Broj AS lot_number
    FROM Stavka_narudzbe sn
    JOIN Potrosni_materijal pm ON sn.ID_Artikla = pm.ID_Artikla
    JOIN Artikl a ON pm.ID_Artikla = a.ID_Artikla
    WHERE sn.ID_Narudzbe = $1
    ORDER BY a.Naziv_Artikla
    `,
    [orderId]
  );

  order.items = itemsResult.rows;
  order.total_amount = itemsResult.rows.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
    0
  );

  return order;
}

async function findConsumableById(articleId) {
  const result = await pool.query(
    `
    SELECT
      a.ID_Artikla AS id,
      a.Naziv_Artikla AS name,
      a.Aktivan AS active,
      pm.Trenutna_Zaliha AS current_stock,
      pm.Zadana_Jedinicna_Cijena AS default_unit_price
    FROM Artikl a
    JOIN Potrosni_materijal pm ON a.ID_Artikla = pm.ID_Artikla
    WHERE a.ID_Artikla = $1
    `,
    [articleId]
  );

  return result.rows[0] || null;
}

async function createOrder(clientId, items) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `
      INSERT INTO Narudzba_za_kupnju
      (
        Datum_Kreiranja,
        Status_Isporuke,
        ID_Korisnika,
        ID_Djelatnika
      )
      VALUES
      (
        CURRENT_DATE,
        'U obradi',
        $1,
        NULL
      )
      RETURNING ID_Narudzbe
      `,
      [clientId]
    );

    const orderId = orderResult.rows[0].id_narudzbe;

    for (const item of items) {
      const consumableResult = await client.query(
        `
        SELECT
          a.Aktivan AS active,
          pm.Zadana_Jedinicna_Cijena AS default_unit_price
        FROM Artikl a
        JOIN Potrosni_materijal pm ON a.ID_Artikla = pm.ID_Artikla
        WHERE a.ID_Artikla = $1
        `,
        [item.articleId]
      );

      const consumable = consumableResult.rows[0];

      if (!consumable || !consumable.active) {
        throw new Error(`Artikl ID ${item.articleId} nije pronađen u aktivnom katalogu.`);
      }

      const unitPrice = Number(consumable.default_unit_price);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        throw new Error(`Artikl ID ${item.articleId} nema definiranu jediničnu cijenu.`);
      }

      await client.query(
        `
        INSERT INTO Stavka_narudzbe
        (
          ID_Narudzbe,
          ID_Artikla,
          Kolicina,
          Jedinicna_Cijena
        )
        VALUES ($1, $2, $3, $4)
        `,
        [orderId, item.articleId, item.quantity, unitPrice]
      );
    }

    await client.query("COMMIT");
    return findById(orderId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function rejectOrder(orderId, workerId) {
  const result = await pool.query(
    `
    UPDATE Narudzba_za_kupnju
    SET Status_Isporuke = 'Otkazano',
        ID_Djelatnika = $2
    WHERE ID_Narudzbe = $1
      AND Status_Isporuke = 'U obradi'
    `,
    [orderId, workerId]
  );

  return result.rowCount > 0;
}

async function shipOrder(orderId, workerId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `
      SELECT ID_Narudzbe, Status_Isporuke
      FROM Narudzba_za_kupnju
      WHERE ID_Narudzbe = $1
      FOR UPDATE
      `,
      [orderId]
    );

    const order = orderResult.rows[0];

    if (!order) {
      throw new Error("Narudžba nije pronađena.");
    }

    if (order.status_isporuke !== "U obradi") {
      throw new Error("Narudžbu je moguće poslati samo ako je u obradi.");
    }

    const itemsResult = await client.query(
      `
      SELECT ID_Artikla AS article_id, Kolicina AS quantity
      FROM Stavka_narudzbe
      WHERE ID_Narudzbe = $1
      ORDER BY ID_Artikla
      `,
      [orderId]
    );

    for (const item of itemsResult.rows) {
      const stockUpdate = await client.query(
        `
        UPDATE Potrosni_materijal
        SET Trenutna_Zaliha = Trenutna_Zaliha - $2
        WHERE ID_Artikla = $1
          AND Trenutna_Zaliha >= $2
        RETURNING Trenutna_Zaliha
        `,
        [item.article_id, item.quantity]
      );

      if (!stockUpdate.rows[0]) {
        throw new Error(`Artikl ID ${item.article_id} nema dovoljno zaliha za slanje narudžbe.`);
      }
    }

    await client.query(
      `
      UPDATE Narudzba_za_kupnju
      SET Status_Isporuke = 'Poslano',
          ID_Djelatnika = $2
      WHERE ID_Narudzbe = $1
      `,
      [orderId, workerId]
    );

    await client.query("COMMIT");
    return findById(orderId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deliverOrder(orderId, workerId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `
      SELECT ID_Narudzbe, Status_Isporuke
      FROM Narudzba_za_kupnju
      WHERE ID_Narudzbe = $1
      FOR UPDATE
      `,
      [orderId]
    );

    const order = orderResult.rows[0];

    if (!order) {
      throw new Error("Narudžba nije pronađena.");
    }

    if (order.status_isporuke !== "Poslano") {
      throw new Error("Narudžbu je moguće isporučiti samo ako je već poslana.");
    }

    const existingInvoiceResult = await client.query(
      `
      SELECT ID_Racuna
      FROM Racun
      WHERE ID_Narudzbe = $1
      `,
      [orderId]
    );

    let invoiceId = existingInvoiceResult.rows[0]
      ? existingInvoiceResult.rows[0].id_racuna
      : null;

    if (!invoiceId) {
      const totalResult = await client.query(
        `
        SELECT COALESCE(SUM(Kolicina * Jedinicna_Cijena), 0) AS total_amount
        FROM Stavka_narudzbe
        WHERE ID_Narudzbe = $1
        `,
        [orderId]
      );

      const totalAmount = Number(totalResult.rows[0].total_amount);

      const invoiceResult = await client.query(
        `
        INSERT INTO Racun
        (
          Ukupan_Iznos,
          Datum_Izdavanja,
          ID_Ugovora,
          ID_Narudzbe
        )
        VALUES ($1, CURRENT_DATE, NULL, $2)
        RETURNING ID_Racuna
        `,
        [totalAmount, orderId]
      );

      invoiceId = invoiceResult.rows[0].id_racuna;
    }

    await client.query(
      `
      UPDATE Narudzba_za_kupnju
      SET Status_Isporuke = 'Isporučeno',
          ID_Djelatnika = $2
      WHERE ID_Narudzbe = $1
      `,
      [orderId, workerId]
    );

    await client.query("COMMIT");
    return {
      order: await findById(orderId),
      invoiceId
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  findAvailableConsumables,
  findByClientId,
  findAll,
  findById,
  findConsumableById,
  createOrder,
  rejectOrder,
  shipOrder,
  deliverOrder
};
