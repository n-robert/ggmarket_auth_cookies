var
    browser = browser || chrome,
    urls = {
        'steam': {url: 'https://steamcommunity.com/', names: ['steamLoginSecure']},
        'roblox': {url: 'https://www.roblox.com', names: ['.ROBLOSECURITY']},
        'hoyoverse': {url: 'https://account.hoyoverse.com', names: ['login_ticket', '_MHYUUID', 'TAsessionID']}
    },
    query = {active: true, currentWindow: true},
    bgMessage;

browser.tabs.query(query, tabs => {
    if (tabs.length > 0) {
        const
            pathname = new URL(tabs[0].url).pathname,
            regex = /product\/(\w+)\/create/g,
            key = regex.exec(pathname)[1];

        if (urls[key] === undefined) {
            window.close();
        } else {
            document.getElementById("popup-content").innerText = browser.i18n.getMessage(key);
            document.getElementById("permission").innerText = browser.i18n.getMessage('permission');

            bgMessage = urls[key];
            document.getElementById("permission").addEventListener("click", () => {
                browser.runtime.sendMessage(bgMessage);
                window.close();
            });
        }
    }
});
