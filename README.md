# SDMU - Sustav za distribuciju medicinske opreme

Aplikacija je izrađena u Node.js/Express okruženju s PostgreSQL bazom podataka. Sustav omogućuje upravljanje medicinskom opremom, zahtjevima za najam, ugovorima o najmu, servisima uređaja i narudžbama potrošne robe.

## Tehnologije

- Node.js
- Express
- EJS
- PostgreSQL
- pg
- express-session
- Jest

---

## Preduvjeti

Prije pokretanja potrebno je imati instalirano:

- Node.js
- PostgreSQL
- npm

---

## Instalacija projekta

Nakon kloniranja repozitorija potrebno je u pgAdminu napraviti dvije baze: sdmu i sdmu_test.
Nakon toga je potrebno izvršiti kod iz datoteke ./database/schema.sql u obje baze podataka.
U .env file potrebno je kopirati sadržaj iz .env.example. 
Zatim je u terminalu potrebno izvršiti sljedeće naredbe:
```bash
npm install
node .\database\seedUsers.js
```
Time se dodaju svi potrebni paketi i korisnici.  
Djelatnici:  
- ivan.horvat@test.hr - narudžbe 
- ana.kovac@test.hr  - skladište
- marko.maric@test.hr - servis  

Korisnici:
- kbc.zagreb@test.hr  
- kbc.split@test.hr  
- ob.pula@test.hr

Svaki korisnik ima lozinku test123.  
Nakon toga je potrebno u sdmu bazi podataka izvršiti kod iz ./database/seedData.sql time se populira baza inicijalnim podacima.  
Za pokretanje sustava potrebno je napisati sljedeću naredbu u terminal:
```bash
npm run dev
```
Time se pokreće server te je moguće uspješno korištenje aplikacije na adresi http://localhost:3000.  
Za testiranje potrebno je napisati sljedeću naredbu:  
```bash
npm test
```



