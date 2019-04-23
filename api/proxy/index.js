const express = require('express');
const cors = require('cors')
const request = require('request').defaults({ encoding: null });

const app = express();
app.use(cors());

const asyncMiddleware = fnc =>
    (req, res, next) => {
        Promise.resolve(fnc(req, res, next))
            .catch(next);
    };

app.get('/:url', asyncMiddleware(async (req, res, next) => {
    (req.params.url) ? request(req.params.url).pipe(res) : next('No url');
}));

app.get('*', asyncMiddleware(async (req, res, next) => {
    (req.query.url) ? request(req.query.url).pipe(res) : next(req.query.url);
}));

// if there's an error in routing then this will happen
app.use(function (err, req, res, next) {
    res.status(500).send(err);
    res.end();
});

module.exports = app
