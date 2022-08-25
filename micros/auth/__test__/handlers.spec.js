// Auth Unit & Intergration Tests

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
require("../handler");
const { signupPageHandler, signupTokenHandle } = require("../handlers");
const fullName = "aaa";
const email = "akcpuemail526@akcpu.com";
const newPassword = "akcpuemail56@akcpu.com";
const confirmPassword = "akcpuemail56@akcpu.com";
const gRecaptchaResponse = "true";

describe("Signup", () => {
  it("signupPageHandler", () => {
    const d = signupPageHandler();
    console.log(d);

    expect(signupPageHandler).toContain("m");
  });

  it("signupTokenHandle With", () => {
    const signupTokenHandler = signupTokenHandle({
      body: {
        fullName: fullName,
        email: email,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
        "g-recaptcha-response": gRecaptchaResponse,
      },
    });
    console.log(signupTokenHandler);

    expect(signupTokenHandler).resolves();
  });
});
