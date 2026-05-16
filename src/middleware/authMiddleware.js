function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  next();
}

function requireClient(req, res, next) {
  if (!req.session.user || req.session.user.type !== "client") {
    return res.status(403).send("Access denied.");
  }

  next();
}

function requireWorkerRole(...roles) {
  return function (req, res, next) {
    if (!req.session.user || req.session.user.type !== "worker") {
      return res.status(403).send("Access denied.");
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).send("Access denied.");
    }

    next();
  };
}

module.exports = {
  requireLogin,
  requireClient,
  requireWorkerRole
};