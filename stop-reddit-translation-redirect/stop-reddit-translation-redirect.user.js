// ==UserScript==
// @name         Stop Reddit Translation Redirect
// @namespace    pl.michalwadas.userscripts.reddit
// @version      1.0.0
// @description  Removes Google translation language parameter from Reddit links.
// @match        https://reddit.com/*
// @match        https://*.reddit.com/*
// @grant        none
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    if (!document.referrer) {
        return;
    }

    const referrerUrl = new URL(document.referrer);
    if (!/(^|\.)google\.[a-z.]+$/i.test(referrerUrl.hostname)) {
        return;
    }

    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.has('tl')) {
        return;
    }

    currentUrl.searchParams.delete('tl');
    window.location.replace(currentUrl.toString());
})();
