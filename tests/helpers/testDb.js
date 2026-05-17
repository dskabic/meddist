const pool = require("../../src/config/db");

async function clearDatabase() {
  await pool.query(`
    TRUNCATE TABLE
      Zapisnik,
      Racun,
      Stavka_narudzbe,
      Narudzba_za_kupnju,
      Stavka_ugovora,
      Ugovor_o_najmu,
      Stavka_zahtjeva_najma,
      Zahtjev_za_najam,
      Servis,
      Potrosni_materijal,
      Uredaj,
      Artikl,
      Djelatnik,
      Korisnik
    RESTART IDENTITY CASCADE
  `);
}

async function seedBasicUsers() {
  await pool.query(`
    INSERT INTO Korisnik
    (
      Naziv_Ustanove,
      OIB,
      Ulica,
      Grad,
      Postanski_Broj,
      Email,
      Lozinka_Hash,
      Aktivan
    )
    VALUES
    (
      'KBC Test',
      '12345678901',
      'Test ulica 1',
      'Zagreb',
      '10000',
      'client@test.hr',
      'hash',
      TRUE
    );
  `);

  await pool.query(`
    INSERT INTO Djelatnik
    (
      Ime_Prezime,
      Uloga,
      Email,
      Lozinka_Hash,
      Aktivan
    )
    VALUES
    (
      'Test Worker',
      'Djelatnik za narudžbe',
      'worker@test.hr',
      'hash',
      TRUE
    );
  `);
}

async function seedDevice() {
  const articleResult = await pool.query(`
    INSERT INTO Artikl
    (
      Naziv_Artikla,
      Proizvodac,
      Aktivan
    )
    VALUES
    (
      'EKG uređaj',
      'MedTech',
      TRUE
    )
    RETURNING ID_Artikla;
  `);

  const articleId = articleResult.rows[0].id_artikla;

  await pool.query(
    `
    INSERT INTO Uredaj
    (
      ID_Artikla,
      Serijski_Broj,
      Status_Raspolozivosti,
      Zadana_Cijena_Po_Danu
    )
    VALUES
    (
      $1,
      'SN-TEST-001',
      'Dostupan',
      50.00
    );
    `,
    [articleId]
  );

  return articleId;
}

async function seedConsumableMaterial() {
  const articleResult = await pool.query(`
    INSERT INTO Artikl
    (
      Naziv_Artikla,
      Proizvodac,
      Aktivan
    )
    VALUES
    (
      'Medicinske rukavice',
      'MedSupply',
      TRUE
    )
    RETURNING ID_Artikla;
  `);

  const articleId = articleResult.rows[0].id_artikla;

  await pool.query(
    `
    INSERT INTO Potrosni_materijal
    (
      ID_Artikla,
      LOT_Broj,
      Trenutna_Zaliha,
      Zadana_Jedinicna_Cijena
    )
    VALUES
    (
      $1,
      'LOT-TEST-001',
      100,
      2.50
    );
    `,
    [articleId]
  );

  return articleId;
}

async function closeDatabase() {
  await pool.end();
}

module.exports = {
  pool,
  clearDatabase,
  seedBasicUsers,
  seedDevice,
  seedConsumableMaterial,
  closeDatabase
};