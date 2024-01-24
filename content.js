var
    browser = browser || chrome,
    previousUrl = '';

const
    checkButton = document.evaluate(
        '//button[contains(text(), \'Проверить аккаунт\')]',
        document.body,
        null,
        XPathResult.ANY_TYPE,
        null,
    ).iterateNext();

if (checkButton) {
    checkButton.addEventListener('click', function () {
        const
            regex = /product\/(\w+)\/\w+/g,
            result = regex.exec(window.location.pathname),
            key = result ? result[1] : undefined;

        if (key) confirm(browser.i18n.getMessage(key + 'Login'));
    });
}

const
    observer = new MutationObserver(function (mutations) {
        let
            regex = /product\/(\w+)\/create/g,
            result = regex.exec(window.location.pathname),
            key = result ? result[1] : undefined;

        if (window.location.href !== previousUrl && key) {
            alert(browser.i18n.getMessage(key + 'Login'));
        }

        previousUrl = window.location.href;
    }),
    config = {subtree: true, childList: true};

observer.observe(document, config);