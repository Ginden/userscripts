// ==UserScript==
// @name     GitHub Fork Upstream
// @author Michał Wadas
// @version  1.0.0
// @grant    none
// @include https://pl.wikipedia.org/*
// @noframes
// @namespace pl.michalwadas.userscripts
// @license MIT
// @description Generated from code c0e50b8f3531b40b3dc1f8038d6e8ba5ecef74e7e3e7769f90e9282aa96f9fa0
// ==/UserScript==

/**

Copyright (c) 2017-2019 Michał Wadas

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


**/
(function () {
    'use strict';

    const waitMs = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    (async () => {
        let i = 10;
        const actualWindow = typeof windowProxy === 'undefined' ? typeof unsafeWindow === 'undefined' ? window : unsafeWindow : windowProxy;
        while (!('_octo' in actualWindow)) {
            if (i > 35 * 1000)
                return; // Give up after ~1 minute
            await waitMs(i *= 2);
        }
        const { actor, dimensions } = _octo;
        if (!(actor && actor.login && dimensions)) {
            return;
        }
        const { repository_is_fork: isFork, repository_nwo: repoPath, repository_parent_nwo: repoParentPath, repository_public: isPublic } = dimensions;
        if (!(isFork === 'true' && isPublic === 'true' && repoPath && repoParentPath))
            return;
        const repoName = repoPath.split('/').pop();
        const commandString = `
        git clone git@github.com:${repoPath}.git;
        cd ${repoName};
        git remote add upstream git@github.com:${repoParentPath}.git
    `.split('\n').map(line => line.trim()).filter(Boolean).join('\n');
        const domElement = actualWindow.document.createElement('pre');
        domElement.textContent = commandString;
        const pos = actualWindow.document.querySelector('#topics-list-container');
        if (!pos)
            return;
        pos.parentNode.insertBefore(domElement, pos);
    })().catch(err => {
        console.error(err, err.stack);
    });

}());
