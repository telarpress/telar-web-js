const nodemailer = require("nodemailer");
const { appConfig } = require("../config");
const fs = require("fs").promises;

exports.sendEmail = async function (
  userName,
  email,
  link,
  templateFile,
  emailVerifactionSubject,
  additionalField
) {
  try {
    const transportOptions = {
      host: appConfig.SMTP_EMAIL_HOST,
      port: appConfig.SMTP_EMAIL_PORT,
    };

    if (appConfig.SMTP_EMAIL_USER && appConfig.SMTP_EMAIL_PASSWORD) {
      transportOptions.auth = {
        user: appConfig.SMTP_EMAIL_USER,
        pass: appConfig.SMTP_EMAIL_PASSWORD,
      };
    }

    const transporter = nodemailer.createTransport(transportOptions);

    const templatePath = __dirname + "/../views/" + templateFile + ".html";
    console.log('fs.readFile(templatePath, { encoding: "');
    let html = await fs.readFile(templatePath, { encoding: "utf-8" });
    console.log('fs.readFile(templatePath, { encoding: "done');

    const mapObj = {
      "{{AppURL}}": appConfig.WEB_URL,
      "{{AppName}}": appConfig.APP_NAME,
      "{{OrgAvatar}}": appConfig.ORG_AVATAR,
      "{{Name}}": userName,
      "{{Code}}": link,
      "{{Link}}": link,
      "{{additionalField}}": additionalField,
      "{{OrgName}}": appConfig.ORG_NAME,
    };

    console.log("html.replace(/}/g,");
    html = html.replace(/{{\w+}}/g, (matched) => mapObj[matched]);
    console.log("html.replace(+}}/gdone");

    const mailOptions = {
      from: appConfig.REF_EMAIL,
      to: email,
      subject: emailVerifactionSubject,
      text: link,
      html: html,
    };

    console.log(
      "transporter.sendMail(mailOptions);",
      JSON.stringify(mailOptions)
    );
    const info = await transporter.sendMail(mailOptions);
    console.log("Email Sending Information: " + info);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Problem sending email");
  }
};
