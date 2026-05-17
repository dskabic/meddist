-- ============================================================
-- SDMU - Sample data / populate script
-- Run after schema script and after seedUsers.js
-- Does NOT insert Korisnik or Djelatnik
-- Does NOT populate Racun or Zapisnik
-- ============================================================

BEGIN;

-- Clean only application data, keep Korisnik and Djelatnik from seed
TRUNCATE TABLE
    Stavka_narudzbe,
    Narudzba_za_kupnju,
    Stavka_ugovora,
    Ugovor_o_najmu,
    Stavka_zahtjeva_najma,
    Zahtjev_za_najam,
    Servis,
    Potrosni_materijal,
    Uredaj,
    Artikl
RESTART IDENTITY CASCADE;


-- ============================================================
-- ARTIKLI + UREDAJI
-- ============================================================

WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('EKG uređaj', 'MedTech', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Uredaj
(ID_Artikla, Serijski_Broj, Status_Raspolozivosti, Zadana_Cijena_Po_Danu)
SELECT ID_Artikla, 'EKG-2026-001', 'Dostupan', 45.00
FROM a;


WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('Respirator', 'RespiraCare', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Uredaj
(ID_Artikla, Serijski_Broj, Status_Raspolozivosti, Zadana_Cijena_Po_Danu)
SELECT ID_Artikla, 'RESP-2026-001', 'Dostupan', 120.00
FROM a;


WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('Monitor vitalnih funkcija', 'Vitalis', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Uredaj
(ID_Artikla, Serijski_Broj, Status_Raspolozivosti, Zadana_Cijena_Po_Danu)
SELECT ID_Artikla, 'MON-2026-001', 'Dostupan', 70.00
FROM a;


WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('Infuzijska pumpa', 'InfuMed', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Uredaj
(ID_Artikla, Serijski_Broj, Status_Raspolozivosti, Zadana_Cijena_Po_Danu)
SELECT ID_Artikla, 'INF-2026-001', 'Na servisu', 35.00
FROM a;


WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('CPAP uređaj', 'AirHealth', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Uredaj
(ID_Artikla, Serijski_Broj, Status_Raspolozivosti, Zadana_Cijena_Po_Danu)
SELECT ID_Artikla, 'CPAP-2026-001', 'Dostupan', 55.00
FROM a;


WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('Invalidska kolica', 'MobilityPlus', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Uredaj
(ID_Artikla, Serijski_Broj, Status_Raspolozivosti, Zadana_Cijena_Po_Danu)
SELECT ID_Artikla, 'KOL-2026-001', 'Dostupan', 20.00
FROM a;


WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('Defibrilator', 'CardioSafe', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Uredaj
(ID_Artikla, Serijski_Broj, Status_Raspolozivosti, Zadana_Cijena_Po_Danu)
SELECT ID_Artikla, 'DEF-2026-001', 'Nedostupan', 95.00
FROM a;


-- ============================================================
-- ARTIKLI + POTROŠNI MATERIJAL
-- ============================================================

WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('Medicinske rukavice', 'MedSupply', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Potrosni_materijal
(ID_Artikla, LOT_Broj, Trenutna_Zaliha, Zadana_Jedinicna_Cijena)
SELECT ID_Artikla, 'LOT-RUK-001', 500, 0.15
FROM a;


WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('Zaštitne maske', 'SafeMask', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Potrosni_materijal
(ID_Artikla, LOT_Broj, Trenutna_Zaliha, Zadana_Jedinicna_Cijena)
SELECT ID_Artikla, 'LOT-MAS-001', 300, 0.30
FROM a;


WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('Sterilni zavoji', 'BandagePro', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Potrosni_materijal
(ID_Artikla, LOT_Broj, Trenutna_Zaliha, Zadana_Jedinicna_Cijena)
SELECT ID_Artikla, 'LOT-ZAV-001', 120, 1.20
FROM a;


WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('Šprice 5ml', 'InjectMed', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Potrosni_materijal
(ID_Artikla, LOT_Broj, Trenutna_Zaliha, Zadana_Jedinicna_Cijena)
SELECT ID_Artikla, 'LOT-SPR-001', 250, 0.45
FROM a;


WITH a AS (
    INSERT INTO Artikl (Naziv_Artikla, Proizvodac, Aktivan)
    VALUES ('Dezinfekcijsko sredstvo', 'CleanMed', TRUE)
    RETURNING ID_Artikla
)
INSERT INTO Potrosni_materijal
(ID_Artikla, LOT_Broj, Trenutna_Zaliha, Zadana_Jedinicna_Cijena)
SELECT ID_Artikla, 'LOT-DEZ-001', 80, 4.50
FROM a;


-- ============================================================
-- SERVIS
-- Requires at least one Servisni djelatnik only if your app logic uses it.
-- The Servis table itself does not reference Djelatnik in the uploaded schema.
-- ============================================================

INSERT INTO Servis
(Datum_Izdavanja, Datum_Zavrsetka, Opis_Radova, ID_Artikla)
SELECT
    DATE '2026-05-01',
    DATE '2026-05-03',
    'Redovni servis i provjera funkcionalnosti EKG uređaja.',
    u.ID_Artikla
FROM Uredaj u
JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla
WHERE a.Naziv_Artikla = 'EKG uređaj'
LIMIT 1;


INSERT INTO Servis
(Datum_Izdavanja, Datum_Zavrsetka, Opis_Radova, ID_Artikla)
SELECT
    DATE '2026-05-10',
    NULL,
    'Zamjena cijevi i provjera rada infuzijske pumpe.',
    u.ID_Artikla
FROM Uredaj u
JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla
WHERE a.Naziv_Artikla = 'Infuzijska pumpa'
LIMIT 1;


-- ============================================================
-- ZAHTJEV ZA NAJAM - ZAPRIMLJEN
-- Uses first active Korisnik from your seed
-- ============================================================

WITH selected_client AS (
    SELECT ID_Korisnika
    FROM Korisnik
    WHERE Aktivan = TRUE
    ORDER BY ID_Korisnika
    LIMIT 1
),
new_request AS (
    INSERT INTO Zahtjev_za_najam
    (
        Datum_Podnosenja,
        Zeljeni_Datum_Pocetka,
        Zeljeni_Datum_Povrata,
        Status,
        ID_Korisnika,
        ID_Djelatnika
    )
    SELECT
        CURRENT_DATE,
        DATE '2026-06-01',
        DATE '2026-06-10',
        'Zaprimljen',
        ID_Korisnika,
        NULL
    FROM selected_client
    RETURNING ID_Zahtjeva
)
INSERT INTO Stavka_zahtjeva_najma
(ID_Zahtjeva, ID_Artikla)
SELECT nr.ID_Zahtjeva, u.ID_Artikla
FROM new_request nr
JOIN Uredaj u ON TRUE
JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla
WHERE a.Naziv_Artikla IN ('Respirator', 'Monitor vitalnih funkcija');


-- ============================================================
-- ZAHTJEV ZA NAJAM + UGOVOR O NAJMU
-- Approved request with created contract
-- Uses first active Korisnik and first active Djelatnik za narudžbe/Admin
-- ============================================================

WITH selected_client AS (
    SELECT ID_Korisnika
    FROM Korisnik
    WHERE Aktivan = TRUE
    ORDER BY ID_Korisnika
    LIMIT 1
),
selected_worker AS (
    SELECT ID_Djelatnika
    FROM Djelatnik
    WHERE Aktivan = TRUE
      AND Uloga IN ('Djelatnik za narudžbe', 'Administrator')
    ORDER BY
      CASE
        WHEN Uloga = 'Djelatnik za narudžbe' THEN 1
        WHEN Uloga = 'Administrator' THEN 2
        ELSE 3
      END,
      ID_Djelatnika
    LIMIT 1
),
new_request AS (
    INSERT INTO Zahtjev_za_najam
    (
        Datum_Podnosenja,
        Zeljeni_Datum_Pocetka,
        Zeljeni_Datum_Povrata,
        Status,
        ID_Korisnika,
        ID_Djelatnika
    )
    SELECT
        DATE '2026-05-15',
        DATE '2026-06-15',
        DATE '2026-06-20',
        'Odobren',
        c.ID_Korisnika,
        w.ID_Djelatnika
    FROM selected_client c
    CROSS JOIN selected_worker w
    RETURNING ID_Zahtjeva, ID_Korisnika, ID_Djelatnika
),
request_item AS (
    INSERT INTO Stavka_zahtjeva_najma
    (ID_Zahtjeva, ID_Artikla)
    SELECT nr.ID_Zahtjeva, u.ID_Artikla
    FROM new_request nr
    JOIN Uredaj u ON TRUE
    JOIN Artikl a ON u.ID_Artikla = a.ID_Artikla
    WHERE a.Naziv_Artikla = 'EKG uređaj'
    RETURNING ID_Zahtjeva, ID_Artikla
),
new_contract AS (
    INSERT INTO Ugovor_o_najmu
    (
        Datum_Sklapanja,
        Datum_Pocetka_Najma,
        Ocekivani_Povrat,
        Status,
        ID_Korisnika,
        ID_Djelatnika,
        ID_Zahtjeva
    )
    SELECT
        DATE '2026-05-16',
        DATE '2026-06-15',
        DATE '2026-06-20',
        'Na čekanju potvrde korisnika',
        nr.ID_Korisnika,
        nr.ID_Djelatnika,
        nr.ID_Zahtjeva
    FROM new_request nr
    RETURNING ID_Ugovora
)
INSERT INTO Stavka_ugovora
(ID_Ugovora, ID_Artikla, Ugovorena_Cijena_Po_Danu)
SELECT
    nc.ID_Ugovora,
    ri.ID_Artikla,
    50.00
FROM new_contract nc
CROSS JOIN request_item ri;


-- ============================================================
-- NARUDŽBA ZA KUPNJU + STAVKE
-- Uses first active Korisnik and first active Djelatnik za narudžbe/Admin
-- ============================================================

WITH selected_client AS (
    SELECT ID_Korisnika
    FROM Korisnik
    WHERE Aktivan = TRUE
    ORDER BY ID_Korisnika
    LIMIT 1
),
selected_worker AS (
    SELECT ID_Djelatnika
    FROM Djelatnik
    WHERE Aktivan = TRUE
      AND Uloga IN ('Djelatnik za narudžbe', 'Administrator')
    ORDER BY
      CASE
        WHEN Uloga = 'Djelatnik za narudžbe' THEN 1
        WHEN Uloga = 'Administrator' THEN 2
        ELSE 3
      END,
      ID_Djelatnika
    LIMIT 1
),
new_order AS (
    INSERT INTO Narudzba_za_kupnju
    (
        Datum_Kreiranja,
        Status_Isporuke,
        ID_Korisnika,
        ID_Djelatnika
    )
    SELECT
        CURRENT_DATE,
        'U obradi',
        c.ID_Korisnika,
        w.ID_Djelatnika
    FROM selected_client c
    CROSS JOIN selected_worker w
    RETURNING ID_Narudzbe
)
INSERT INTO Stavka_narudzbe
(ID_Narudzbe, ID_Artikla, Kolicina, Jedinicna_Cijena)
SELECT
    no.ID_Narudzbe,
    pm.ID_Artikla,
    CASE
        WHEN a.Naziv_Artikla = 'Medicinske rukavice' THEN 100
        WHEN a.Naziv_Artikla = 'Zaštitne maske' THEN 50
        ELSE 10
    END AS Kolicina,
    pm.Zadana_Jedinicna_Cijena
FROM new_order no
JOIN Potrosni_materijal pm ON TRUE
JOIN Artikl a ON pm.ID_Artikla = a.ID_Artikla
WHERE a.Naziv_Artikla IN ('Medicinske rukavice', 'Zaštitne maske');


COMMIT;