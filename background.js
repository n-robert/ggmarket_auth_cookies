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
        removeItemCode = 'localStorage.removeItem("ggmarket_auth_cookies");',
        setItemCode = 'localStorage.setItem("ggmarket_auth_cookies", ' + JSON.stringify(body) + ')';

    browser.tabs.executeScript({code: removeItemCode});

    if (body.length < names.length) {
        browser.tabs.executeScript({file: 'noauth.js'});
        process.exit(0);
    }

    browser.tabs.executeScript({code: setItemCode});
    browser.tabs.executeScript({file: 'thankyou.js'});
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
