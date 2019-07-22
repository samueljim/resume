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


async function getScreenshot(url, type) {
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });

    const page = await browser.newPage();
    var file;
    await page.goto(url);
    if (!type) {
        file = await page.content();
    } else {
        file = await page.screenshot({ type });
    }
    await browser.close();
    return file;
}


module.exports = async function (req, res) {
    try {
        const { query = {} } = parse(req.url, true);
        const type = (query && query.type) ? query.type : null;
        const pathname = (query && query.url) ? query.url : null;
        console.log(type)
        console.log(pathname)
        if (!isValidUrl(pathname)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/html');
            res.end(`<h1>Bad Request</h1><p>The url <em>${pathname}</em> is not valid.</p>`);
        } else {
            const file = await getScreenshot(pathname, type);
            res.statusCode = 200;
            if (type) {
                res.setHeader('Content-Type', `image/${type}`);
            } else {
                res.setHeader('Content-Type', 'application/json');
            }
            res.end(file);
        }
    } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Server Error</h1><p>Sorry, there was a problem</p>');
        console.error(e.message);
    }
};

// module.exports = async (req, res) => {
//     var url_parts = domain.parse(req.url, true);
//     var query = url_parts.query;
//     console.log(url_parts)
//     console.log(query)
//     let url = query.url;
//     // let url = pathname.slice(1);

//     if (!url.startsWith('http')) {
//         url = 'https://' + url; // add protocol if missing
//     }
//     let data = await getScreenshot(url, type);
//     res.statusCode = 200;
//     if (!type) {
//         res.setHeader('Content-Type', 'application/json');
//     } else {

//     }
//     res.end(data);
// }
