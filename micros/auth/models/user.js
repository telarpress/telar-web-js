const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

const UserAuthSchema = new Schema({
  objectId: { type: String, required: true },
  username: { type: String, required: true, trim: true, unique: true },
  password: { type: String, default: null },
  access_token: { type: String, default: null },
  emailVerified: { type: Boolean, default: false },
  role: {
    type: [String],
    enum: ["user", "admin", "super_admin"],
    default: ["user"],
  },
  phoneVerified: { type: Boolean, default: false },
  token_expires: { type: String, default: Date, expires: 1 * 600 }, // 10 min
  created_date: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now },
});

const UserAuth = mongoose.model("UserAuthSchema", UserAuthSchema);

// TODO: Validation Implantation
const UserAuthValidate = (user) => {
  const schema = Joi.object({
    objectId: Joi.string(),
    username: Joi.string().email().required(),
    password: Joi.string().email().required(),
    newPassword: Joi.string().required().min(5), // you can set .max(15)
    confirmPassword: Joi.any().valid(Joi.ref("newPassword")).required(),
    "g-recaptcha-response": Joi.string().required(),
    access_token: Joi.string(),
    emailVerified: Joi.boolean().default(false),
    role: Joi.string().default("user"),
    phoneVerified: Joi.boolean().default(false),
    token_expires: Joi.string(),
    created_date: Joi.string(),
    last_updated: Joi.string(),
  });
  return schema.validate(UserAuth);
};

module.exports = { UserAuth, UserAuthValidate };
