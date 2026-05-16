require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../src/config/db");

async function seedUsers() {
  try {
    const password = "test123";
    const passwordHash = await bcrypt.hash(password, 10);

    console.log("Upserting clients...");

    await pool.query(
      `
      INSERT INTO Korisnik 
      (Naziv_Ustanove, OIB, Ulica, Grad, Postanski_Broj, Email, Lozinka_Hash, Aktivan)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, TRUE),
      ($8, $9, $10, $11, $12, $13, $14, TRUE),
      ($15, $16, $17, $18, $19, $20, $21, TRUE)
      ON CONFLICT (Email)
      DO UPDATE SET
        Naziv_Ustanove = EXCLUDED.Naziv_Ustanove,
        OIB = EXCLUDED.OIB,
        Ulica = EXCLUDED.Ulica,
        Grad = EXCLUDED.Grad,
        Postanski_Broj = EXCLUDED.Postanski_Broj,
        Lozinka_Hash = EXCLUDED.Lozinka_Hash,
        Aktivan = TRUE
      `,
      [
        "KBC Zagreb",
        "12345678901",
        "Kišpatićeva 12",
        "Zagreb",
        "10000",
        "kbc.zagreb@test.hr",
        passwordHash,

        "KBC Split",
        "23456789012",
        "Spinčićeva 1",
        "Split",
        "21000",
        "kbc.split@test.hr",
        passwordHash,

        "Opća bolnica Pula",
        "16089706543",
        "Santoriova 24",
        "Pula",
        "52100",
        "ob.pula@test.hr",
        passwordHash
      ]
    );

    console.log("Upserting workers...");

    await pool.query(
      `
      INSERT INTO Djelatnik
      (Ime_Prezime, Uloga, Email, Lozinka_Hash, Aktivan)
      VALUES
      ($1, $2, $3, $4, TRUE),
      ($5, $6, $7, $8, TRUE),
      ($9, $10, $11, $12, TRUE),
      ($13, $14, $15, $16, TRUE)
      ON CONFLICT (Email)
      DO UPDATE SET
        Ime_Prezime = EXCLUDED.Ime_Prezime,
        Uloga = EXCLUDED.Uloga,
        Lozinka_Hash = EXCLUDED.Lozinka_Hash,
        Aktivan = TRUE
      `,
      [
        "Ivan Horvat",
        "Djelatnik za narudžbe",
        "ivan.horvat@test.hr",
        passwordHash,

        "Ana Kovač",
        "Djelatnik skladišta",
        "ana.kovac@test.hr",
        passwordHash,

        "Marko Marić",
        "Servisni djelatnik",
        "marko.maric@test.hr",
        passwordHash,

        "Admin Korisnik",
        "Administrator",
        "admin@test.hr",
        passwordHash
      ]
    );

    console.log("Seed completed successfully.");
    console.log("All seeded users use password: test123");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await pool.end();
  }
}

seedUsers();