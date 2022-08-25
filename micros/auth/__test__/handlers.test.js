// Auth End to End Test

it("true", () => {});

const request = require("supertest");

const app = request("http://localhost");

describe("GET", () => {
  it("should return all users", async () => {
    const response = await app.get("/auth/getUsers").expect(200);
    expect(response.text).toContain("_id");
  });
});

const fullName = "firstname lastname";
const email = "email@email.com";
const newPassword = "P@ssw0rdP@ssw0rd123456";
const confirmPassword = "P@ssw0rdP@ssw0rd123456";
const gRecaptchaResponse = "true";

describe("POST", () => {
  it("should Create User an send Email", async () => {
    const response = await app.post("/auth/signup").type("form").send({
      fullName: fullName,
      email: email,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
      "g-recaptcha-response": gRecaptchaResponse,
    });
    expect(response.text).toContain(
      "An Email sent to your account please verify."
    );
    expect(response.status).toBe(200);
  });
});
