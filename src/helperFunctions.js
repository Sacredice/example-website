const path = require("path");

//  Create an asyncronous function to send the email / How to synchronously send mails through nodemailer?
const sendEmail = async (res, transporter, mailOptions) => {
    try{
      // Use await to wait for the sendMail promise to resolve
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.messageId);
      res.status(200).sendFile(path.join(__dirname, "pages", "applied.html"));
    } catch (err) {
      console.error(err)
    }
  };

  module.exports = sendEmail;