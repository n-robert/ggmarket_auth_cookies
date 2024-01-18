var browser = browser || chrome;

function formatCookie(names) {
    return function (co) {
        if (names.indexOf(co.name) !== -1) {
            return JSON.stringify({
                domain: co.domain,
                name: co.name,
                value: co.value
            });
        }
    }
}

/**
 * Save all cookies from a given store.
 * @param {browser.cookies.Cookie[]} cookies Cookies from the store
 * @param names Necessary cookie names
 */
async function saveCookies(cookies, names) {
    var
        body = cookies.map(formatCookie(names)).filter((co) => co !== undefined),
        code = 'localStorage.setItem("ggmarket_auth_cookies", ' + JSON.stringify(body) + ')';

    if (body.length < names.length) {
        browser.tabs.executeScript({file: 'noauth.js'});
        process.exit(0);
    }

    browser.tabs.executeScript({code: code});

    const
        blob = new Blob(body, {type: 'text/plain'}),
        objectURL = URL.createObjectURL(blob);
    browser.downloads.download(
        {
            url: objectURL,
            filename: 'cookies.test.txt',
            saveAs: true,
            conflictAction: 'overwrite'
        }
    );
}

async function getCookies(params) {
    cookies = await browser.cookies.getAll(
        {url: params.url},
        cookies => saveCookies(cookies, params.names)
    );
}

function handleClick(bgMessage = {}) {
    if (bgMessage.url && bgMessage.names) {
        browser.cookies.getAllCookieStores(() =>
            getCookies(bgMessage)
        );
    }
}

browser.runtime.onMessage.addListener(handleClick)
