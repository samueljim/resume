var express = require("express");
var pug = require("pug");
var path = require("path");
var nodemailer = require("nodemailer");

var app = express();
var port = process.env.PORT || 8080;
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
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: "sam.job.inquiries@gmail.com",
        pass: "zzroorgvlhqylwsz"
    }
});

// routes will go here
app.get("/:name", function (req, res) {
    var name = req.params.name;
    var content;
    if (name == 'tanda') {
        content = 'I want to work at tanda becasue i love the companys ideals';
    } else if (name == 'microsoft') {
        content = 'hey bill gates';
    } else {
        return res.render("index.pug");
    }
    return res.render("index.pug", {
        name,
        content
    });

});
app.get("/", function (req, res) {
    res.render("index.pug");
});
app.post("/", function (req, res) {
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
            return res.status(500).send('There was an issues sending that email');
        });
});
app.get("/cv", function (req, res) {
    var file = __dirname + "Samuel Henry 2018.pdf";
    return res.download(file);
});
app.get("*", function (req, res) {
    return res.json("error");
});
// start the server
app.listen(port);
console.log("Server started! At http://localhost:" + port);