const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const { getInt, getUrlFromPath, isValidUrl } = require('./validator');

async function getScreenshot(url, type) {
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });

    const page = await browser.newPage();
    await page.goto(url);
    if (!type) {
        const file = await page.content();
    } else {
        const file = await page.screenshot({ type });
    }
    await browser.close();
    return file;
}


module.exports = async function (req, res) {
    try {
        const { pathname = '/', query = {} } = parse(req.url, true);
        const type =  query.type;
        const url = getUrlFromPath(pathname);
        console.log(url)
        if (!isValidUrl(url)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/html');
            res.end(`<h1>Bad Request</h1><p>The url <em>${url}</em> is not valid.</p>`);
        } else {
            const file = await getScreenshot(url, type);
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
