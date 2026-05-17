const express = require("express");
const path = require("path");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const rentalRequestRoutes = require("./routes/rentalRequestRoutes");
const workerRentalRequestRoutes = require("./routes/workerRentalRequestRoutes");
const productCatalogRoutes = require("./routes/productCatalogRoutes");
const contractListRoutes = require("./routes/contractListRoutes");
const clientContractRoutes = require("./routes/clientContractRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const workerPurchaseRoutes = require("./routes/workerPurchaseRoutes");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "temporary_secret",
    resave: false,
    saveUninitialized: false
  })
);

function resolveHomePath(user) {
  if (!user) {
    return "/";
  }

  if (user.type === "client") {
    return "/client/dashboard";
  }

  if (user.role === "Djelatnik za narudžbe") {
    return "/worker/orders";
  }

  if (user.role === "Djelatnik skladišta") {
    return "/worker/warehouse";
  }

  if (user.role === "Servisni djelatnik") {
    return "/worker/service";
  }

  if (user.role === "Administrator") {
    return "/worker/admin";
  }

  return "/";
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.homeHref = resolveHomePath(req.session.user);
  res.locals.showHomeLink =
    Boolean(req.session.user) &&
    normalizePath(req.path) !== normalizePath(res.locals.homeHref);
  next();
});

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect(resolveHomePath(req.session.user));
  }

  res.render("home");
});

app.use("/", authRoutes);
app.use("/worker/warehouse/equipment", equipmentRoutes);
app.use("/worker/service/records", serviceRoutes);
app.use("/client/rental-requests", rentalRequestRoutes);
app.use("/client/contracts", clientContractRoutes);
app.use("/client/purchases", purchaseRoutes);
app.use("/worker/orders/rental-requests", workerRentalRequestRoutes);
app.use("/client/products", productCatalogRoutes);
app.use("/worker/orders/contracts", contractListRoutes);
app.use("/worker/orders/purchases", workerPurchaseRoutes);
module.exports = app;
