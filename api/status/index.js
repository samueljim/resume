const { parse, URL } = require('url');
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

function isValidUrl(str) {
    try {
        const url = new URL(str);
        return url.hostname.includes('.');
    } catch(e) {
        console.error(e.message);
        return false;
    }
}

var browser;
async function getStatus(url, query) {
    browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });
    var file;
    const page = await browser.newPage();
    
    if (query.username && query.password) {
        await page.authenticate({username:query.username, password:query.password});
    }
    
    if (query.waituntil && (query.waituntil == 'domcontentloaded' || query.waitUntil == 'networkidle0' || query.waitUntil == 'networkidle2')) {
        let response = await page.goto(url, {waitUntil: query.waitUntil}); 
    } else {
        let response = await page.goto(url);
    }
    let headers = response.headers;
    let chain = response.request().redirectChain();
    headers.redirectChain = chain;
    headers.url = page.url();
    return headers;
}


module.exports = async function (req, res) {
    try {
        const { query = {} } = parse(req.url, true);
        const type = (query && query.type) ? query.type : null;
        var pathname = (query && query.url) ? query.url : null;
        if (!pathname) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end({error: 'please send a url', status: 500});
        } else {
            if (!pathname.startsWith('http')) {
                pathname = 'https://' + pathname
            }
            if (!isValidUrl(pathname)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end({error: 'please send a valid url', status: 500});
                `);
            } else {
                const status = await getStatus(pathname, query);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(status);
                await browser.close();
            }
        }
    } catch (e) {
        res.statusCode = 200;
        console.error(e.message);
        res.setHeader('Content-Type', 'application/json');
        return res.end({error: e, status: 500});
    }
};
