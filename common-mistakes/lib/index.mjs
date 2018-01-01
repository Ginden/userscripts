import {
    keep60fps
} from './utils/promise.mjs';

import {
    posiada,
    powszechneBledy
} from './submodules/index.mjs';

import MediaWikiAbstraction from './mw-abstraction.mjs';

import defaultStyle from './style.css';

console.log('Starting script');


const mw = new MediaWikiAbstraction();
mw.addHandler(commonMistakes);

const style = document.createElement('style');
style.textContent = defaultStyle;

document.head.appendChild(style);

/**
 *
 * @param {MediaWikiConfigAbstraction} mw
 * @returns {Promise.<void>}
 */
async function commonMistakes(mw) {

    const namespace = mw.config.wgCanonicalNamespace;
    const action = mw.config.wgAction;
    if (action !== 'view') return;
    if (!(namespace === '' || mw.pageName === 'Wikipedysta:Michalwadas/common-mistakes-test')) return;
    const contentRoot = document.querySelector('#mw-content-text');
    contentRoot.normalize();
    await posiada(contentRoot);
    await keep60fps();
    contentRoot.normalize();
    await powszechneBledy(contentRoot);
    await keep60fps();
    contentRoot.normalize();
}

