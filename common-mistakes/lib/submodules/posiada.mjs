import {documentFragment, GenNodeIterator, span, text} from '../utils/dom.mjs';
import {keep60fps} from '../utils/promise.mjs';
import {lexSentence} from '../utils/string.mjs';
import {timed} from '../debug.mjs';

export default timed(async function underlinePosiada(contentRoot) {
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
                    return span({class: 'yellow-underline'}, word);
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
});




