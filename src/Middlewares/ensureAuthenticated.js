const express = require("express");

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      // User is already authenticated, redirect as needed
      res.redirect(`http://localhost:3000/google/auth/callback?status=success`);
    } else {
      // User is not authenticated, proceed to the next middleware/route
      return next();
    }
  }

module.exports = ensureAuthenticated