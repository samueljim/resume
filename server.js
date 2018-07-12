var express = require("express");
var pug = require("pug");
var path = require("path");
var app = express();
var port = process.env.PORT || 8080;
var bodyParser = require('body-parser');
app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "./public")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// routes will go here
app.get("/:name", function (req, res) {
    res.render("index.pug", {
        name: req.params.name
    });
});
app.get("/", function (req, res) {
    res.render("index.pug");
});
app.post("/", function (req, res) {
    console.log('post');
    console.log(req.body);
    return res.status(200);
});
app.get("/cv", function (req, res) {
    var file = __dirname + 'Samuel Henry 2018.pdf';
    return res.download(file);
});
app.get("*", function (req, res) {
    return res.json("error");
});
// start the server
app.listen(port);
console.log("Server started! At http://localhost:" + port);