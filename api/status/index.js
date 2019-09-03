const { parse, URL } = require('url');
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
// const puppeteer = require('puppeteer');


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
    chrome.args.push('--profile-directory="Default"')
    browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });
    var file;
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', request => {
        if (request.resourceType() === 'stylesheet' || request.resourceType() === 'image')
          request.abort();
        else
          request.continue();
    });   

    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.resolve(__dirname,'tmp')});

    // page.on('response', response => {
    //     const headers = response.headers;
    //     if (response.url.endsWith('.pdf'))
    //       headers['Content-Disposition'] = 'attachment';
    //     response.continue({headers});
    //   });

    if (query.username && query.password) {
        await page.authenticate({username:query.username, password:query.password});
    }
    
    if (query.waituntil && (query.waituntil == 'domcontentloaded' || query.waitUntil == 'networkidle0' || query.waitUntil == 'networkidle2')) {
        let response = await page.goto(url, {waitUntil: query.waitUntil, timeout: query.timeout || 10000}); 
        let headers = response.headers;
        let chain = response.request().redirectChain();
        headers.redirectChain = chain;
        headers.url = page.url();
        return headers;
    } else {
        let response = await page.goto(url, {timeout: (query.timeout) ? query.timeout : 10000});
         
        let msg = {}
        let chain = response.request().redirectChain();
        msg.redirectCount = chain.length;
        msg.redirects = [];
        for (let i = 0; i < msg.redirectCount;i++) {
            msg.redirects.push({
                url: chain[i].url(),
                status: chain[i].response().status()
            })
        }
        if (chain[0]) {
            msg.firstUrl = chain[0].url();
            msg.firstStatus = chain[0].response().status();
        } else {
            msg.firstUrl = page.url()
            msg.firstStatus = response._status;
        }
        msg.status = response.status();
        msg.url = page.url();
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
