// ==UserScript==
// @name     Unnamed Script 653972
// @version  1.0.0
// @grant    none
// @include https://pl.wikipedia.org/*
// ==/UserScript==

(function() {
  'use strict';

  const waitMs = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const keep60fps = (function() {
    let lastTick = Date.now();
    const maxDiff = 12;
    return async function keep60fps() {
      if (lastTick + maxDiff > Date.now()) {
        return new Promise(resolve => requestAnimationFrame(() => {
          lastTick = Date.now();
          resolve();
        }));
      }
    };
  })();

  /**
   *
   * @param {string} nodeName
   * @param {Object} attributes
   * @param {...string|Node} children
   * @returns {Element}
   */
  function element(nodeName, attributes = {}, ...children) {
    const node = document.createElement(nodeName);
    for (const [key, value] of Object.entries(attributes)) {
      node.setAttribute(key, value);
    }
    for (const child of [].concat(...children)) {
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
  function documentFragment(...children) {
    const nodes = [].concat(...children);
    const df = document.createDocumentFragment();
    for (const node of nodes) {
      df.appendChild(node);
    }
    return df;
  }

  /**
   *
   * @param args
   * @yields {Node}
   */
  function* GenNodeIterator(...args) {
    const baseIterator = document.createNodeIterator(...args);
    let currentNode;
    while (currentNode = baseIterator.nextNode()) {
      yield currentNode;
    }
  }

  const span = (...args) => element('span', ...args);
  const text = word => document.createTextNode(word);

  /**
   * Split text to word and whitespace fragments.
   * Eg. "foo   bar" becomes ["foo", "   ", "bar"]
   * @param {string} text
   * @returns {Array.<string>}
   */
  function lexSentence(text) {
    const words = [];
    let lastSubSequence = [];
    let isWhiteSpaceMode = false;
    for (const char of text) {
      const wsChar = isWhitespaceChar(char);
      if (wsChar !== isWhiteSpaceMode) {
        words.push(lastSubSequence.join(''));
        lastSubSequence = [];
      }
      isWhiteSpaceMode = wsChar;
      lastSubSequence.push(char);
    }
    words.push(lastSubSequence.join(''));
    return words;
  }

  /**
   * Checks if character is a whitespace.
   * @param {string} char
   * @returns {boolean}
   */
  function isWhitespaceChar(char) {
    return char === '\n' || char === ' ' || char === '\t' || char === '\r';
  }

  var debug = {
    log(...args) {
      console.log(...args);
    },

    error(...args) {
      console.error(...args);
    }
  }

  const win = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;

  class MediaWiki {
    constructor() {
      this._isHandling = false;
      this._handlers = [];
      this._mw = (async function() {
        while (!('mw' in win)) {
          await waitMs(10);
        }
        debug.log('MediaWiki config found');
        return win.mw;

      }());
      this._mw.catch(err => this._emitError(err));
    }

    addHandler(func) {
      this._handlers.push(func);
      this._startHandling();
      return this;
    }

    async _startHandling() {
      if (this._isHandling) return;
      while (this._handlers[0]) {
        const handler = this._handlers.shift();
        await this._mw
          .then(handler)
          .catch(err => this._emitError(err))
          .finally(keep60fps);
        await keep60fps();
      }
    }

    _emitError(err) {
      debug.error(err);
    }
  }

  var defaultStyle = "span.red-underline {\n    text-decoration: red wavy underline;\n}\n";

  console.log('Starting script');


  const mw = new MediaWiki();
  mw.addHandler(run);

  const style = document.createElement('style');

  style.textContent = defaultStyle;

  document.head.appendChild(style);

  async function run(mw) {
    const namespace = mw.config.values.wgCanonicalNamespace;
    if (namespace === '') {
      await commonMistakes();
    }
  }

  async function commonMistakes() {
    const contentRoot = document.querySelector('#mw-content-text');
    contentRoot.normalize();
    await underlinePosiada(contentRoot);
    await keep60fps();


    contentRoot.normalize();
  }


  async function underlinePosiada(contentRoot) {
    const replaceList = [];
    for (const el of GenNodeIterator(contentRoot, NodeFilter.SHOW_TEXT)) {
      await keep60fps();
      if (el.textContent.trim() === '') {
        continue;
      }
      const textContent = el.textContent;
      if (textContent.match(/posiada/i)) {
        await keep60fps();
        const words = lexSentence(textContent);
        const nodes = words.map(word => {
          if (word.toLowerCase().startsWith('posiada')) {
            return span({
              class: 'red-underline'
            }, word);
          } else {
            return text(word);
          }
        });
        const fragment = documentFragment(nodes);
        replaceList.push([el, fragment]);
      }
    }

    for (const [textNode, replaceNode] of replaceList) {
      await keep60fps();
      textNode.replaceWith(replaceNode);
    }
  }

}());
