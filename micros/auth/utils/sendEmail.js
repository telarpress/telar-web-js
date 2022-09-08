const nodemailer = require("nodemailer");
const { appConfig } = require("../config");
const fs = require("node:fs");
exports.sendEmail = function (
  userName,
  email,
  link,
  templateFile,
  emailVerifactionSubject,
  additionalField
) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: appConfig.SMTP_EMAIL_HOST,
      port: appConfig.SMTP_EMAIL_PORT,
      //secure: true,
      auth: {
        user: appConfig.emailAddress,
        pass: appConfig.emailPassword,
      },
    });

    fs.readFile(
      __dirname + "/../views/" + templateFile + ".html",
      { encoding: "utf-8" },
      function (err, html) {
        if (err) {
          reject(err);
        } else {
          var mapObj = {
            "{{AppURL}}": appConfig.AppURL,
            "{{AppName}}": appConfig.APP_NAME,
            "{{OrgAvatar}}": appConfig.ORG_AVATAR,
            "{{Name}}": userName,
            "{{Code}}": link,
            "{{Link}}": link,
            "{{additionalField}}": additionalField,
            "{{OrgName}}": appConfig.ORG_NAME,
          };
          html = html.replace(
            /{{AppURL}}|{{AppName}}|{{OrgAvatar}}|{{Name}}|{{Code}}|{{Link}}|{{additionalField}}|{{OrgName}}/gi,
            function (matched) {
              return mapObj[matched];
            }
          );

          const mailOptions = {
            from: appConfig.REF_EMAIL, // sender address
            to: email, // list of receivers
            subject: emailVerifactionSubject, // Subject line
            text: link, // plain text body
            html: html,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              reject(new Error("Problem in mailOptions sendMail"));
            }
            resolve(info);
            console.log("Email Sending Information: " + info);
          });
        }
      }
    );
  });
};
