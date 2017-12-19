import {flatten} from "./array";

/**
 *
 * @param {string} nodeName
 * @param {Object} attributes
 * @param {...string|Node} children
 * @returns {Element}
 */
export function element(nodeName, attributes = {}, ...children) {
    const node = document.createElement(nodeName);
    for(const [key, value] of Object.entries(attributes)) {
        node.setAttribute(key, value);
    }
    for (const child of flatten(children)) {
        if (typeof child === 'string') {
            node.appendChild(text(child));
        } else {
            node.appendChild(child);
        }
    }
    return node;
}

/**
 *
 * @param {...Node|Node[]} children
 * @returns {DocumentFragment}
 */
export function documentFragment(...children) {
    const df = document.createDocumentFragment();
    for (const node of flatten(children)) {
        df.appendChild(node);
    }
    return df;
}

/**
 *
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
