const { parse } = require('url');
const { timingSafeEqual } = require('crypto');
const { getScreenshot } = require('./chromium');
const { getInt, getUrlFromPath, isValidUrl } = require('./validator');

const compare = (a, b) => {
    try {
        return timingSafeEqual(Buffer.from(a || , "utf8"), Buffer.from(b, "utf8"));
    } catch {
        return false;
    }
};

module.exports = async function (req, res) {
    if (process.env.SCREENSHOT_AUTH_TOKEN && !compare(
        `Bearer ${process.env.SCREENSHOT_AUTH_TOKEN}`,
        req.headers.authorization
    ) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Auth error</h1><p>You need to send a correct Authorization: header</p>');
        return;
    }
    try {
        const { pathname = '/', query = {} } = parse(req.url, true);
        const { type = 'png', quality, fullPage } = query;
        const url = getUrlFromPath(pathname);
        const qual = getInt(quality);
        if (!isValidUrl(url)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/html');
            res.end(`<h1>Bad Request</h1><p>The url <em>${url}</em> is not valid.</p>`);
        } else {
            const file = await getScreenshot(url, type, qual, fullPage);
            res.statusCode = 200;
            res.setHeader('Content-Type', `image/${type}`);
            res.end(file);
        }
    } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Server Error</h1><p>Sorry, there was a problem</p>');
        console.error(e.message);
    }
};
