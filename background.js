var browser = browser || chrome,
    platforms = {
        'steam': {
            urls: {
                login: [
                    'https://steamcommunity.com/login/home/?goto=login',
                    'https://store.steampowered.com/login',
                ],
                check: 'https://store.steampowered.com/account/?l=english'
            }
        },
        'roblox': {
            urls: {
                login: ['https://www.roblox.com/Login'],
                check: 'https://www.roblox.com/my/settings/json',
            }
        },
        'hoyo': {
            urls: {
                login: [
                    'https://account.hoyoverse.com/#/login?cb_route=%2Faccount%2FaccountInfo',
                    'https://www.hoyolab.com/achievementCenter',
                ],
                check: 'https://webapi-os.account.hoyoverse.com/Api/login_by_cookie'
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

function raiseMessage(msg) {
    alert(msg);
}

async function fetchData(url, type = 'text', method = 'GET', obj = {}) {
    let init = {method: method}, result;

    if (method === 'POST') {
        init.body = JSON.stringify(obj);
    }

    switch (type) {
        case 'text':
            init.headers = {'Content-Type': 'text/html'};
            result = await (await fetch(url, init)).text();
            break;
        case 'json':
            init.headers = {'Content-Type': 'application/json'};
            result = await (await fetch(url, init)).json();
            break;
    }

    return result;
}

async function getCurrentUserName(platform) {
    let userName, data;
    const url = platforms[platform].urls.check;

    switch (platform) {
        case 'roblox':
            data = await fetchData(url, 'json');
            userName = data.Name;
            break;
        case 'hoyo':
            data = await fetchData(url, 'json');
            userName = data.data.account_info.email;
            break;
        case 'steam':
            data = await fetchData(url);
            const
                regex = /<span class="account_name">(.+)<\/span>/gi,
                result = regex.exec(data);
            userName = result[1];
            break;
    }

    return userName;
}

async function getUserName(tabId) {
    const [{result: userName}] = await new Promise(resolve => {
        browser.scripting.executeScript({
            target: {tabId: tabId},
            func: () => localStorage.getItem('userName'),
        }, resolve)
    });

    return userName;
}

async function checkUserName(platform, tabId) {
    const currentUserName = await getCurrentUserName(platform);
    let userName = await getUserName(tabId);

    switch (platform) {
        case 'hoyo':
            let tmpName = userName.split(''), end = tmpName.indexOf('@');
            tmpName = tmpName.map(
                (v, i) =>
                    (1 < i && i < end - 2) ? '*' : v
            );
            userName = tmpName.join('');
            break;
        case 'roblox':
        case 'steam':
        default:
    }

    return currentUserName === userName;
}

async function saveCookies(cookies, items) {
    const value = cookies.map(
            formatCookie(items)
        ).filter(
            (c) => c !== undefined
        ),
        storageObj = await browser.storage.session.get();

    let i = storageObj.urlIndex, url = platforms[storageObj.platform].urls.login[i];

    if (url) {
        browser.storage.session.set({urlIndex: i + 1});
        browser.tabs.create({
            url: url
        });
    } else {
        browser.tabs.update(storageObj.tabId, {active: true});

        if (value.length < items.length) {
            browser.scripting.executeScript({
                target: {tabId: storageObj.tabId},
                func: raiseMessage,
                args: [browser.i18n.getMessage('cookieMissing')]
            });
        } else {
            const userName = await getUserName(storageObj.tabId);

            if (!await checkUserName(storageObj.platform, storageObj.tabId)) {
                browser.scripting.executeScript({
                    target: {tabId: storageObj.tabId},
                    func: raiseMessage,
                    args: [browser.i18n.getMessage('wrongName') + userName + '.']
                });
            } else {
                browser.scripting.executeScript({
                    target: {tabId: storageObj.tabId},
                    func: saveToStorage,
                    args: ['ggmarket_auth_cookies', value]
                });
            }
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
    if (message.from === 'popup') {
        let storageObj = {urlIndex: 0};

        storageObj.platform = message.platform;
        storageObj.tabId = message.tabId;
        browser.storage.session.set(storageObj);
        browser.scripting.executeScript({
            target: {tabId: message.tabId},
            func: deleteFromStorage,
            args: ['ggmarket_auth_cookies']
        });
    }

    if (message.items) {
        browser.cookies.getAllCookieStores(() =>
            getCookies(message.items)
        );
    }
}

browser.runtime.onMessage.addListener(handleRequest);
