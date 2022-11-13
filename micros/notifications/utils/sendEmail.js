const nodemailer = require("nodemailer");
const { appConfig } = require("../config");
const fs = require("node:fs");
exports.sendEmail = function (
  notifyRecieverEmail, subject, emailBody
) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: appConfig.SMTP_EMAIL_HOST,
      port: appConfig.SMTP_EMAIL_PORT,
      //secure: true,
      auth: {
        user: appConfig.SMTP_EMAIL_USER,
        pass: appConfig.SMTP_EMAIL_PASSWORD,
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
            "{{AppName}}":  appConfig.AppName,
            "{{AppURL}}":  appConfig.WebURL,
            "{{Title}}": emailBody.title,
            "{{Avatar}}":  emailBody.ownerAvatar,
            "{{FullName}}": emailBody.ownerDisplayName,
            "{{ViewLink}}": appConfig.WebURL+emailBody.URL,
            "{{UnsubscribeLink}}": appConfig.WebURL+"settings/notification",
          };
          html = html.replace(
            /{{AppURL}}|{{AppName}}|{{OrgAvatar}}|{{Name}}|{{Code}}|{{Link}}|{{additionalField}}|{{OrgName}}/gi,
            function (matched) {
              return mapObj[matched];
            }
          );

          const mailOptions = {
            from: appConfig.REF_EMAIL, // sender address
            to: notifyRecieverEmail, // list of receivers
            subject: subject, // Subject line
            text: appConfig.WebURL+emailBody.URL, // plain text body
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
