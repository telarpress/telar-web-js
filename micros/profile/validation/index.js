const Ajv = require("ajv");
const user_schema_getID = require("./user_schema_getID.json");
const user_schema_setData = require("./user_schema_setData.json");
const ajv = (exports.ajv = new Ajv());
ajv.addSchema(user_schema_getID, "getID");
ajv.addSchema(user_schema_setData, "setData");
