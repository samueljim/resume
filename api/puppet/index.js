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


async function getScreenshot(url, query) {
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });

    var file;
    const page = await browser.newPage();
    if (query.width || query.height) {
        await page.setViewport({width: (query.width) ? parseInt(query.width) : 800, height: (query.height) ? parseInt(query.height) : 800});
    }
    await page.goto(url);
    if (!query.type) {
        file = await page.content();
    } else {
        file = await page.screenshot({ type: 'jpeg', fullPage: query.fullheight || false });
    }
    await browser.close();
    return file;
}


module.exports = async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    try {
        const { query = {} } = parse(req.url, true);
        const type = (query && query.type) ? query.type : null;
        var pathname = (query && query.url) ? query.url : null;
        if (!pathname.startsWith('http')) {
            pathname = 'https://' + pathname
        }
        if (!isValidUrl(pathname)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/html');
            res.end(`<h1>Bad Request</h1><p>The url <em>${pathname}</em> is not valid.</p>`);
        } else {
            const file = await getScreenshot(pathname, query);
            res.statusCode = 200;
            if (type == 'image') {
                res.setHeader('Content-Type', `image/jpeg`);
            } else {
                res.setHeader('Content-Type', 'application/json');
            }
            res.end(file);
        }
    } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>500 Server Error</h1><p>Sorry, there was a problem</p>');
        console.error(e.message);
    }
};