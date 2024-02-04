const isValidEmail = (email) => {
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    
    return emailRegex.test(email);
};


const isStrongPassword = (password) => {
    
    const hasUpperCase = /[A-Z]/.test(password);

    
    const hasSymbol = /[$&+,:;=?@#|'<>.^*()%!-]/.test(password);

    
    const hasNumber = /\d/.test(password);

    
    const hasMinLength = password.length >= 8;

    
    return hasUpperCase && hasSymbol && hasNumber && hasMinLength;
};


const isValidName = (name) => {
    
    if (name.trim() === '') {
        return false;
    }

    
    const nameRegex = /^[a-zA-Z]+$/;
    return nameRegex.test(name);
};


const validateUsername = (username) => {
    // Define minimum and maximum length
    const minLength = 3;
    const maxLength = 20;
  
    // Define allowed characters using a regular expression
    const allowedCharacters = /^[a-zA-Z0-9_-]+$/;
  
    // Check length
    if (username.length < minLength || username.length > maxLength) {
      return false;
    }
  
    // Check if it contains only allowed characters
    if (!allowedCharacters.test(username)) {
      return false;
    }
  
    // Check if it doesn't start or end with underscores or hyphens
    if (username.startsWith('_') || username.startsWith('-') ||
        username.endsWith('_') || username.endsWith('-')) {
      return false;
    }
  
    // Username is valid
    return true;
  }

  function generateOTP() {

    const otp = Math.floor(100000 + Math.random() * 900000);
    
    return otp.toString(); 
  }
  
  // Example usage

  


  module.exports = {isValidEmail, isStrongPassword, isValidName, validateUsername, generateOTP}