var browser = browser || chrome,
    platforms = {
        'steam': {
            platform: 'steam',
            items: [
                {domain: 'steamcommunity.com', names: ['steamLoginSecure']},
                {domain: 'store.steampowered.com', names: ['steamLoginSecure']},
            ]
        },
        'roblox': {
            platform: 'roblox',
            items: [
                {domain: '.roblox.com', names: ['.ROBLOSECURITY']},
            ]
        },
        'hoyoverse': {
            platform: 'hoyo',
            items: [
                {domain: '.hoyoverse.com', names: ['login_ticket']},
                {domain: '.hoyolab.com', names: ['cookie_token_v2', 'ltoken_v2', 'account_id_v2']},
            ]
        },
        'genshin-impact': {
            platform: 'hoyo',
            items: [
                {domain: '.hoyoverse.com', names: ['login_ticket']},
                {domain: '.hoyolab.com', names: ['cookie_token_v2', 'ltoken_v2', 'account_id_v2']},
            ]
        }
    },
    query = {active: true, currentWindow: true},
    message = {};

browser.tabs.query(query, tabs => {
    if (tabs.length > 0) {
        const
            pathname = new URL(tabs[0].url).pathname,
            regex = /product\/(\D+)\/\w+/g,
            result = regex.exec(pathname),
            key = result ? result[1] : undefined;

        if (key === undefined || platforms[key] === undefined) {
            window.close();
        } else {
            const platform = platforms[key].platform, items = platforms[key].items;
            document.getElementById('popup-content').innerText = browser.i18n.getMessage(platform + 'Permission');
            document.getElementById('permission').innerText = browser.i18n.getMessage('permission');

            message = {
                from: 'popup',
                tabId: tabs[0].id,
                platform: platform,
                items: items,
            };
            document.getElementById('permission').addEventListener('click', () => {
                browser.runtime.sendMessage(message);
                window.close();
            });
        }
    }
});
