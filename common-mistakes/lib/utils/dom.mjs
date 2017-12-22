import {
    flatten
} from './array.mjs';

/**
 * Creates instance of HTML Element class.
 * @param {string} nodeName String identifing element - eg. 'div'
 * @param {Object} attributes Dictionary that contains key => value of DOM attributes
 * @param {...(string|Node|string[]|Node[])} children List of children to be added. Strings becomes to TextElement instances.
 * Arrays are recursively flattened.
 * @returns {Element}
 */
export function element(nodeName, attributes = {}, ...children) {
    const node = document.createElement(nodeName);
    for(const [key, value] of Object.entries(attributes)) {
        node.setAttribute(key, value);
    }
    for (const child of flatten(children).map(normalizeForInsert)) {
        if (typeof child === 'string') {
            node.appendChild(text(child));
        } else {
            node.appendChild(child);
        }
    }
    return node;
}

/**
 * Creates DocumentFragment from list of Nodes.
 * Recursively flattens arrays in arguments list.
 * @param {...(string|Node|string[]|Node[])} children
 * @returns {DocumentFragment}
 */
export function documentFragment(...children) {
    const df = document.createDocumentFragment();
    for (const node of flatten(children).map(normalizeForInsert)) {
        df.appendChild(node);
    }
    return df;
}

/**
 * Converts string to TextElement node, leave other elements as they are.
 * @param {Node|string} el
 * @returns {Node}
 */
function normalizeForInsert(el) {
    if (typeof el === 'string') return text(el);
    return el;
}


/**
 * Wrapper around NodeIterator supporting for-of iteration.
 * @param args
 * @yields {Node}
 */
export function* GenNodeIterator(...args) {
    const baseIterator = document.createNodeIterator(...args);
    let currentNode;
    while(currentNode = baseIterator.nextNode()) {
        yield currentNode;
    }
}

export const span = (...args) => element('span', ...args);
export const text = word => document.createTextNode(word);
export const textIterator = (node) => new GenNodeIterator(node, NodeFilter.SHOW_TEXT);