function generateCaptchaText(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; // Avoid confusing characters
  let captcha = '';
  for (let i = 0; i < length; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

function generateCaptcha(req, res) {
  const captchaText = generateCaptchaText();
  req.session.captcha = captchaText;
  res.status(200).json({ captchaText });
}

function verifyCaptcha(userInput, req) {
  const expected = req.session.captcha;
  return expected && userInput && expected.toLowerCase() === expected.toLowerCase();
}

module.exports = {
  generateCaptcha,
  verifyCaptcha,
};
