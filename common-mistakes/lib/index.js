import {
    keep60fps
} from "./utils/promise";

import {
    documentFragment,
    GenNodeIterator,
    span,
    text
} from "./utils/dom";

import {lexSentence} from "./utils/string";

import MediaWiki from './mw-abstraction';

import defaultStyle from './style.css';

console.log('Starting script');


const mw = new MediaWiki();
mw.addHandler(commonMistakes);

const style = document.createElement('style');
style.textContent = defaultStyle;

document.head.appendChild(style);

async function commonMistakes() {
    const namespace = mw.config.values.wgCanonicalNamespace;
    if (namespace !== '') return;
    const contentRoot = document.querySelector('#mw-content-text');
    contentRoot.normalize();
    await underlinePosiada(contentRoot);
    await keep60fps();
    contentRoot.normalize();
}


async function underlinePosiada(contentRoot) {
    const replaceList = [];
    for(const el of GenNodeIterator(contentRoot, NodeFilter.SHOW_TEXT)) {
        await keep60fps();
        if (el.textContent.trim() === '') {
            continue;
        }
        const textContent = el.textContent;
        if(textContent.match(/posiada/i)) {
            const words = lexSentence(textContent);
            const nodes = words.map(word => {
                if (word.toLowerCase().startsWith('posiada')) {
                    return span({class: 'red-underline'}, word);
                } else {
                    return text(word);
                }
            });
            const fragment = documentFragment(nodes);
            replaceList.push([el, fragment]);
        }
    }

    for(const [textNode, replaceNode] of replaceList) {
        await keep60fps();
        textNode.replaceWith(replaceNode);
    }
}




