const authService = require("../models/services/authService");

function chooseLogin(req, res) {
  res.render("auth/chooseLogin");
}

function clientLoginForm(req, res) {
  res.render("auth/clientLogin", {
    error: null
  });
}

function workerLoginForm(req, res) {
  res.render("auth/workerLogin", {
    error: null
  });
}

async function clientLogin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await authService.loginClient(email, password);

    req.session.user = user;

    res.redirect("/client/dashboard");
  } catch (error) {
    res.render("auth/clientLogin", {
      error: error.message
    });
  }
}

async function workerLogin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await authService.loginWorker(email, password);

    req.session.user = user;

    if (user.role === "Djelatnik za narudžbe") {
      return res.redirect("/worker/orders");
    }

    if (user.role === "Djelatnik skladišta") {
      return res.redirect("/worker/warehouse");
    }

    if (user.role === "Servisni djelatnik") {
      return res.redirect("/worker/service");
    }

    if (user.role === "Administrator") {
      return res.redirect("/worker/admin");
    }

    res.redirect("/");
  } catch (error) {
    res.render("auth/workerLogin", {
      error: error.message
    });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

function clientDashboard(req, res) {
  res.render("dashboards/clientDashboard");
}

function ordersDashboard(req, res) {
  res.render("dashboards/ordersDashboard");
}

function warehouseDashboard(req, res) {
  res.render("dashboards/warehouseDashboard");
}

function serviceDashboard(req, res) {
  res.render("dashboards/serviceDashboard");
}

function adminDashboard(req, res) {
  res.render("dashboards/adminDashboard");
}

module.exports = {
  chooseLogin,
  clientLoginForm,
  workerLoginForm,
  clientLogin,
  workerLogin,
  logout,
  clientDashboard,
  ordersDashboard,
  warehouseDashboard,
  serviceDashboard,
  adminDashboard
};