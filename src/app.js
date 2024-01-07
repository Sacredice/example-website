require("dotenv").config();
const fsPromises = require("fs").promises;
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const JOBS = require("./jobs");
const mustacheExpress = require("mustache-express");
const sendEmail = require("./helperFunctions");

const app = express();

const multer = require("multer");
const upload = multer({ dest: "./public/uploads/" });

// built-in middleware to handle urlencoded data in other words, form data: 'content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

// Configure mustache
app.set("views", path.join(__dirname, "pages"));
app.set("view engine", "mustache");
app.engine("mustache", mustacheExpress());

app.get("/", (req, res) => {
    // res.sendFile(path.join(__dirname, "./pages/index.html"));
    res.render("index", { jobs: JOBS });
});

app.get('/jobs/:id', (req, res) => {
    const id = req.params.id;
    const matchedJob = JOBS.find(job => job.id.toString() === id);
    res.render('job', { job: matchedJob});
})

const transporter = nodemailer.createTransport({
    host: 'mail.gmx.com',   // SMTP host
    port: 465,  // SMTP port
    secure: true,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD
    }
});


app.post("/jobs/:id/apply", upload.single("resume"), async (req, res) => {
    "use strict"
    console.log("req.body", req.body);
    const { name, email, phone, dob, coverletter } = req.body;

    const id = req.params.id;
    const matchedJob = JOBS.find(job => job.id.toString() === id);
    
    console.log("req.file", req.file);
    const extArray = req.file.originalname.split(".");
    const ext = extArray[extArray.length - 1] ? "." + extArray[extArray.length - 1] : "";
    console.log(req.file.filename + ext);
  
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: process.env.EMAIL_ID,
      subject: `New Application for ${matchedJob.title}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Date of Birth:</strong> ${dob}</p>
        <p><strong>Cover Letter:</strong> ${coverletter}</p>
      `,
      attachments: [
        { 
          filename: req.file.filename + ext,
          path: req.file.path
        }
      ]
    };

    console.log(mailOptions);
  
    // await transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error(error);
    //     res.status(500).send(error.stack);
    //     rejects(err);
    //   } else {
    //     console.log('Email sent: ' + info.response);
    //     res.status(200).sendFile(path.join(__dirname, "pages", "applied.html"));
    //     resolve(info);
    //   }
    // });

    // asynchronous sendEmail function
    await sendEmail(mailOptions);

    await fsPromises.unlink(req.file.path, (err) => {
      if (err) throw err;
      console.log("File deleted");
    });
    console.log(req.file);
});



const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});


//  Create an asyncronous function to send the email / How to synchronously send mails through nodemailer?
const sendEmail = async (mailOptions) => {
  try{
    // Use await to wait for the sendMail promise to resolve
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.messageId);
  } catch (err) {
    console.error(err)
  }
};

