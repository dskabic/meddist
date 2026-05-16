const bcrypt = require("bcrypt");

const korisnikRepository = require("../../infrastructure/repositories/korisnikRepository");
const djelatnikRepository = require("../../infrastructure/repositories/djelatnikRepository");
const authValidator = require("../validators/authValidator");

async function loginClient(email, password) {
  const validation = authValidator.validateLoginInput(email, password);

  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const korisnik = await korisnikRepository.findByEmail(email);

  if (!korisnik || !korisnik.aktivan) {
    throw new Error("Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(password, korisnik.lozinka_hash);

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  return {
    id: korisnik.id_korisnika,
    name: korisnik.naziv_ustanove,
    email: korisnik.email,
    type: "client",
    role: "Korisnik"
  };
}

async function loginWorker(email, password) {
  const validation = authValidator.validateLoginInput(email, password);

  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const djelatnik = await djelatnikRepository.findByEmail(email);

  if (!djelatnik || !djelatnik.aktivan) {
    throw new Error("Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(password, djelatnik.lozinka_hash);

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  return {
    id: djelatnik.id_djelatnika,
    name: djelatnik.ime_prezime,
    email: djelatnik.email,
    type: "worker",
    role: djelatnik.uloga
  };
}

module.exports = {
  loginClient,
  loginWorker
};