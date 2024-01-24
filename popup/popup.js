var
    browser = browser || chrome,
    urls = {
        'steam': {
            items: [
                {domain: 'steamcommunity.com', names: ['steamLoginSecure']},
                {domain: 'store.steampowered.com', names: ['steamLoginSecure']}
            ]
        },
        'roblox': {
            items: [{domain: '.roblox.com', names: ['.ROBLOSECURITY']}]
        },
        'hoyoverse': {
            items: [
                {domain: '.hoyoverse.com', names: ['login_ticket']},
                {domain: '.hoyolab.com', names: ['cookie_token_v2', 'ltoken_v2', 'account_id_v2']}
            ]
        }
    },
    query = {active: true, currentWindow: true},
    bgMessage;

browser.tabs.query(query, tabs => {
    if (tabs.length > 0) {
        const
            pathname = new URL(tabs[0].url).pathname,
            regex = /product\/(\w+)\/\w+/g,
            result = regex.exec(pathname),
            key = result ? result[1] : undefined;

        if (key === undefined || urls[key] === undefined) {
            window.close();
        } else {
            document.getElementById('popup-content').innerText = browser.i18n.getMessage(key + 'Permission');
            document.getElementById('permission').innerText = browser.i18n.getMessage('permission');

            bgMessage = urls[key];
            document.getElementById('permission').addEventListener('click', () => {
                browser.runtime.sendMessage(bgMessage);
                window.close();
            });
        }
    }
});
