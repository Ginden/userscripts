import {
    keep60fps
} from './utils/promise.mjs';

import {
    posiada,
    powszechneBledy
} from './submodules/index.mjs';

import MediaWiki from './mw-abstraction.mjs';

import defaultStyle from './style.css';

console.log('Starting script');


const mw = new MediaWiki();
mw.addHandler(commonMistakes);

const style = document.createElement('style');
style.textContent = defaultStyle;

document.head.appendChild(style);

async function commonMistakes(mw) {
    const namespace = mw.config.values.wgCanonicalNamespace;
    if (namespace !== '') return;
    const contentRoot = document.querySelector('#mw-content-text');
    contentRoot.normalize();
    await posiada(contentRoot);
    await keep60fps();
    contentRoot.normalize();
    await powszechneBledy(contentRoot);
    await keep60fps();
    contentRoot.normalize();
}

