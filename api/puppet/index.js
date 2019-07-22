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
    try {
        const { query = {} } = parse(req.url, true);
        const type = (query && query.type) ? query.type : null;
        var pathname = (query && query.url) ? query.url : null;
        if (!pathname) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/html');
            return res.end(`
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tachyons/4.11.1/tachyons.min.css" />
                <article class="mw5 center bg-white br3 pa3 pa4-ns mv3 ba b--black-10">
                <div class="tc">
                <img src="http://tachyons.io/img/avatar_1.jpg" class="br-100 h3 w3 dib" title="Photo of a kitty staring at you">
                <h1 class="f4">No url supplied</h1>
                <hr class="mw3 bb bw1 b--black-10">
                </div>
                <p class="lh-copy measure center f6 black-70">
                    Please send a url query string <br>
                    https://samueljim.com/puppet/?url=https://google.com.au/maps
                </p>
                <p class="lh-copy measure center f6 black-70">
                    Screen shot example <br>
                    https://samueljim.com/puppet/?type=image&width=1000&fullheight=true&url=https://google.com.au/maps
                </p>
            </article>
            `);
        } else {
            if (!pathname.startsWith('http')) {
                pathname = 'https://' + pathname
            }
            if (!isValidUrl(pathname)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'text/html');
                return res.end(`
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tachyons/4.11.1/tachyons.min.css" />
                    <article class="mw5 center bg-white br3 pa3 pa4-ns mv3 ba b--black-10">
                    <div class="tc">
                    <img src="http://tachyons.io/img/avatar_1.jpg" class="br-100 h3 w3 dib" title="Photo of a kitty staring at you">
                    <h1 class="f4">URL error</h1>
                    <hr class="mw3 bb bw1 b--black-10">
                    </div>
                    <p class="lh-copy measure center f6 black-70">
                        ${pathname} is not a valid url
                    </p>
                </article>
                `);
            } else {
                const file = await getScreenshot(pathname, query);
                res.statusCode = 200;
                if (type == 'image') {
                    res.setHeader('Content-Type', `image/jpeg`);
                } else {
                    res.setHeader('Content-Type', 'application/json');
                }
                return res.end(file);
            }
        }
    } catch (e) {
        res.statusCode = 500;
        console.error(e.message);
        res.setHeader('Content-Type', 'text/html');
        return res.end(`
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tachyons/4.11.1/tachyons.min.css" />
            <article class="mw5 center bg-white br3 pa3 pa4-ns mv3 ba b--black-10">
            <div class="tc">
            <img src="http://tachyons.io/img/avatar_1.jpg" class="br-100 h3 w3 dib" title="Photo of a kitty staring at you">
            <h1 class="f4">Server error</h1>
            <hr class="mw3 bb bw1 b--black-10">
            </div>
            <p class="lh-copy measure center f6 black-70">
                This is not what I wanted to happen
            </p>
        </article>
        `);
    }
};