import express from "express";
import pug from "pug";
import path from "path";
import nodemailer from "nodemailer";

var app = express();
var port = process.env.PORT || 4000;
var bodyParser = require("body-parser");
app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "./public")));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// Mail server
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    // two factor auth is used to make sure people can't send email
    user: "sam.job.inquiries@gmail.com",
    pass: "zzroorgvlhqylwsz"
  }
});

// routes will go here
app.get("/:name", function(req, res) {
  var name = req.params.name;
  return res.render("index.pug", {
    name
  });
});
app.get("/", function(req, res) {
  res.render("index.pug");
});
app.post("/", function(req, res) {
  console.log(req.body);
  const mail = {
    to: "me@samueljim.com",
    from: `${req.body.contactEmail}`,
    subject: `${req.body.contactSubject} Website inquiry`,
    html: `<h3>${req.body.contactMessage}</h3><br/><br/><h2>From 
        ${req.body.contactName} - ${req.body.contactEmail}</h2>`
  };
  transporter
    .sendMail(mail)
    .then(cb => {
      return res.status(200).send("Sent email to me@samueljim.com");
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send("There was an issues sending that email");
    });
});

app.get("*", function(req, res) {
  return res.json("error");
});
// start the server
app.listen(port);
console.log("Server started! At http://localhost:" + port);
export default app;
