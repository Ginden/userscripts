import {
    keep60fps
} from './utils/promise.mjs';


import MediaWikiAbstraction from './mw-abstraction.mjs';

import defaultStyle from './style.css';

console.log('Starting script');


const mw = new MediaWikiAbstraction();
mw.addHandler(lastThreads);

const style = document.createElement('style');
style.textContent = defaultStyle;

document.head.appendChild(style);

/**
 *
 * @param {MediaWikiConfigAbstraction} mw
 * @returns {Promise.<void>}
 */
async function lastThreads(mw) {
    if(!isDiscussion(mw)) {
        return;
    }
    console.log('Well, that\'s discussion page');
}

/**
 *
 * @param {MediaWikiConfigAbstraction} mw
 */
function isDiscussion(mw) {
    if (!mw.hasWikicodeSource) {
        // Ignore edit pages, special pages etc.
        return;
    }
    const namespace = mw.config.wgNamespaceNumber;
    if (namespace % 2) {
        return true;
    }

}