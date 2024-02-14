const express = require("express");

function ensureAuthenticated(req, res, next) {

  try{

    const authToken = req.cookies.authToken;
    
   
    if (authToken) {
      // User is already authenticated, redirect as needed
      res.redirect(`${process.env.FRONT_END_URL}/google/auth/callback?status=success&token=${authToken}`);
    } else {
      // User is not authenticated, proceed to the next middleware/route
      return next();
    }
  }catch(err){
    console.log({err})
  }
}


module.exports = ensureAuthenticated