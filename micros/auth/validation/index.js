const Ajv = require("ajv");
const auth_schema_register = require("./auth_schema_register.json");
const auth_schema_login = require("./auth_schema_login.json");
const ajv = (exports.ajv = new Ajv());
ajv.addSchema(auth_schema_register, "register");
ajv.addSchema(auth_schema_login, "login");
