var express = require("express");
var pug = require("pug");
var path = require("path");
var nodemailer = require("nodemailer");
var app = express();
var {
    check,
    validationResult
} = require('express-validator/check');
var port = process.env.PORT || 4000;
var bodyParser = require("body-parser");
app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "./public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// Mail server
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "sam.job.inquiries@gmail.com",
        pass: "zzroorgvlhqylwsz"
    }
});

// routes will go here
app.get("/:name", function (req, res) {
    var name = req.params.name;
    return res.render("index.pug", {
        name: name
    });
});
app.get("/", function (req, res) {
    res.render("index.pug");
});
app.post("/", [
    check('contactEmail').isEmail().normalizeEmail().withMessage('That\'s not an email address i can contact you at'),
    check('contactSubject').trim().escape(),
    check('contactMessage').trim().escape().withMessage('please send message longer than 5 characters'),
    check('contactName').not().isEmpty().trim().escape().withMessage('What is your name?'),
], function (req, res) {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(500).json({
            errors: errors.array()
        });
    }
    var mail = {
        to: "me@samueljim.com",
        from: "" + req.body.contactEmail,
        subject: req.body.contactSubject + " Website inquiry",
        html: "<h3>" + req.body.contactMessage + "</h3><br/><br/><h2>From \n        " + req.body.contactName + " - " + req.body.contactEmail + "</h2>"
    };
    transporter
        .sendMail(mail)
        .then(function (cb) {
            return res.status(200).send("Sent email to me@samueljim.com");
        })["catch"](function (err) {
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