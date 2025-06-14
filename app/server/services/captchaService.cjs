const generateCaptchaText = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let captchaText = '';
  for (let i = 0; i < length; i++) {
    captchaText += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captchaText;
};

const verifyCaptchaText = (userInput, sessionCaptchaText) => { 
  if (!userInput || !sessionCaptchaText) {
    console.warn("verifyCaptchaText called with invalid arguments:", {userInput, sessionCaptchaText});
    return false;
  }
  return userInput.toLowerCase() === sessionCaptchaText.toLowerCase();
};

module.exports = {
  generateCaptchaText,
  verifyCaptchaText 
};