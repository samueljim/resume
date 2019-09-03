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
    await page.setRequestInterception(true);

    let lastRedirectResponse = undefined;
    if (query.noredirects) {
        page.on('response', response => {
            // if this response is a redirect
            if ([301, 302, 303, 307, 308].includes(response.status) 
                    && response.request().resourceType === 'document') {
                lastRedirectResponse = response;
            }
        });
    }

    page.on('request', request => {
        if (query.noredirects) {
            if (lastRedirectResponse && lastRedirectResponse.headers.location === request.url) {
                request.abort();
            }
        }
        if (request.resourceType() === 'stylesheet' || request.resourceType() === 'image')
          request.abort();
        else
          request.continue();
    });   
    
    if (query.username && query.password) {
        await page.authenticate({username:query.username, password:query.password});
    }
    
    if (query.waituntil && (query.waituntil == 'domcontentloaded' || query.waitUntil == 'networkidle0' || query.waitUntil == 'networkidle2')) {
        let response = await page.goto(url, {waitUntil: query.waitUntil, timeout: query.timeout || 5000}); 
        let headers = response.headers;
        let chain = response.request().redirectChain();
        headers.redirectChain = chain;
        headers.url = page.url();
        return headers;
    } else {
        let response = await page.goto(url, {timeout: query.timeout || 5000});
         
        let msg = {}
        // let chain = response.request().redirectChain();
        // headers.redirectChain = chain;
        if (query.noredirects) {
            let chain = response.request().redirectChain();
            msg.status = chain[0].status(); 
            msg.url = chain[0].url(); 
        } else {
            msg.status = response._status;
            msg.url = page.url();
        }
        return msg;
    }
}


module.exports = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    try {
        const { query = {} } = parse(req.url, true);
        const type = (query && query.type) ? query.type : null;
        var pathname = (query && query.url) ? query.url : null;
        if (!pathname) {
            return res.end(JSON.stringify({error: 'please send a url', status: 500}));
        } else {
            if (!pathname.startsWith('http')) {
                pathname = 'https://' + pathname
            }
            if (!isValidUrl(pathname)) {
                res.statusCode = 200;
            
                return res.end(JSON.stringify({error: 'please send a valid url', status: 500}));
            } else {
                let status = await getStatus(pathname, query); 
               
                res.end(JSON.stringify(status));
                await browser.close();
            }
        }
    } catch (e) {
        res.statusCode = 500;
        console.error(e.message);
        return res.end(JSON.stringify({error: e.message, status: 500}));
    }
};
