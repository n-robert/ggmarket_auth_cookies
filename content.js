var browser = browser || chrome,
    platforms = {
        'steam': {
            items: [
                {domain: 'steamcommunity.com', names: ['steamLoginSecure']},
                {domain: 'store.steampowered.com', names: ['steamLoginSecure']}
            ]
        },
        'roblox': {
            items: [
                {domain: '.roblox.com', names: ['.ROBLOSECURITY']}
            ]
        },
        'hoyo': {
            items: [
                {domain: '.hoyoverse.com', names: ['login_ticket']},
                {domain: '.hoyolab.com', names: ['cookie_token_v2', 'ltoken_v2', 'account_id_v2']}
            ]
        }
    };

// const checkButton = document.evaluate(
//     "//button[contains(text(), 'Проверить аккаунт')]",
//     document.body,
//     null,
//     XPathResult.ANY_TYPE,
//     null,
// ).iterateNext();
//
// if (checkButton) {
//     checkButton.addEventListener("click", function () {
//         let
//             regex = /product\/(\w+)\/((?!create).)+/g,
//             result = regex.exec(window.location.pathname);
//
//         const platform = result ? result[1] : undefined
//
//         if (platform) {
//             browser.runtime.sendMessage({
//                 from: 'content',
//                 platform: platform,
//                 items: platforms[platform].items
//             });
//         }
//     });
// }

const
    observer = new MutationObserver(function (mutations) {
        let found = false;

        for (const platform in platforms) {
            if (window.location.hostname.indexOf(platform) > -1) {
                switch (platform) {
                    case 'roblox':
                        if (window.location.href === 'https://www.roblox.com/home') {
                            found = true;
                        }

                        break;
                    case 'hoyo':
                        if (window.location.href.indexOf('https://www.hoyolab.com/achievementCenter?target_uid=') > -1) {
                            found = true;
                        }

                        if (window.location.href === 'https://account.hoyoverse.com/#/account/accountInfo') {
                            found = true;
                        }

                        break;
                    case 'steam':
                    default:
                        break;
                }

                if (found) {
                    observer.disconnect();
                    setTimeout(() => {
                        browser.runtime.sendMessage({
                            items: platforms[platform].items
                        });
                    }, 1000);
                }
            }
        }
    }),
    config = {subtree: true, childList: true};

observer.observe(document, config);
