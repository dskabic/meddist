function validateLoginInput(email, password) {
  if (!email || !password) {
    return {
      isValid: false,
      message: "Email and password are required."
    };
  }

  if (!email.includes("@")) {
    return {
      isValid: false,
      message: "Email format is not valid."
    };
  }

  if (password.length < 4) {
    return {
      isValid: false,
      message: "Password is too short."
    };
  }

  return {
    isValid: true,
    message: null
  };
}

module.exports = {
  validateLoginInput
};