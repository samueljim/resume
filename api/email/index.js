const express = require('express');
const nodemailer = require("nodemailer");
const {
check,
validationResult
} = require('express-validator/check');
const bodyParser = require("body-parser");
// const Recaptcha = require('express-recaptcha').Recaptcha;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', {'theme':'dark'});


// Mail server
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASSWORD_EMAIL
    }
});

app.post('*', 
    [
        check('contactEmail').isEmail().normalizeEmail().withMessage('That\'s not an email address i can contact you at'),
        check('contactSubject').trim().escape(),
        check('contactMessage').trim().escape().withMessage('please send message longer than 5 characters'),
        check('contactName').not().isEmpty().trim().escape().withMessage('What is your name?'),
    ], (req, res) => {
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

app.get('*', (req, res) => {
    res.status(418);
});

module.exports = app
