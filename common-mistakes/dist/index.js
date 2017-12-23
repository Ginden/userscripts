// ==UserScript==
// @name     Częstę błędy i pomyłki
// @author Michał Wadas
// @version  1.2.1
// @grant    none
// @include https://pl.wikipedia.org/*
// @noframes
// @namespace pl.michalwadas.userscripts
// @license MIT
// @description Generated from code d6f4a80b890683b37fb333ed5729ec43bb4016864ff175cb021e069a1e3ae8df
// ==/UserScript==

/**

Copyright (c) 2017 Michał Wadas

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
(function() {
  'use strict';

  /**
   * Returns promise waiting for some time.
   * Usually it's bad practice though.
   * @param {number} ms
   */

  const waitMs = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  let lastTick = Date.now();
  const maxDiff = 15;

  /**
   * Returns promise. If more than 15 miliseconds passed since last call, it will await until next animation frame
   * This keeps user experience on highest level - he won't observe screen freezes
   * Value 15 can be tuned if other script perform busy operations in background
   * @returns {Promise.<undefined>}
   */
  const keep60fps = async function keep60fps() {
    if ((lastTick + maxDiff) < Date.now()) {
      return new Promise(requestAnimationFrame).then(() => {
        lastTick = Date.now();
      });
    }
  };

  /**
   * Recursively flattens array
   * @param arr
   * @returns {*[]}
   */

  function flatten(arr) {
    return Array.isArray(arr) ? ([].concat(...arr.map(flatten))) : arr;
  }

  /**
   * Creates instance of HTML Element class.
   * @param {string} nodeName String identifing element - eg. 'div'
   * @param {Object} attributes Dictionary that contains key => value of DOM attributes
   * @param {...(string|Node|string[]|Node[])} children List of children to be added. Strings becomes to TextElement instances.
   * Arrays are recursively flattened.
   * @returns {Element}
   */
  function element(nodeName, attributes = {}, ...children) {
    const node = document.createElement(nodeName);
    for (const [key, value] of Object.entries(attributes)) {
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
  function documentFragment(...children) {
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
  function* GenNodeIterator(...args) {
    const baseIterator = document.createNodeIterator(...args);
    let currentNode;
    while (currentNode = baseIterator.nextNode()) {
      yield currentNode;
    }
  }

  const span = (...args) => element('span', ...args);
  const text = word => document.createTextNode(word);
  const textIterator = (node) => GenNodeIterator(node, NodeFilter.SHOW_TEXT);

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

  function isEmptyString(str) {
    return str.trim() === '';
  }

  function log(firstArg) {
    console.log(...arguments);
    return firstArg;
  }


  function error(firstArg) {
    console.error(...arguments);
    return firstArg;
  }

  function timed(fn) {
    const wrapped = async function(...args) {
      const startTime = performance.now();
      try {
        return await fn(...args);
      } finally {
        const timeDiff = performance.now() - startTime;
        log(`Executing function ${fn.name} took ${toHumanReadable(timeDiff)}`);
      }
    };
    Object.assign(wrapped, fn);
    wrapped.displayName = fn.name;
    Object.defineProperty(wrapped, 'name', Object.getOwnPropertyDescriptor(fn, 'name'));

    return wrapped;
  }

  function toHumanReadable(timeInMs) {
    if (timeInMs > 1000) {
      return `${(timeInMs / 1000).toFixed(2)}s`;
    } else if (timeInMs > 0.1) {
      return `${(timeInMs).toFixed(1)}ms`;
    }

    return 'less than 0.1ms';
  }

  var posiada = timed(async function underlinePosiada(contentRoot) {
    const replaceList = [];
    for (const el of GenNodeIterator(contentRoot, NodeFilter.SHOW_TEXT)) {
      await keep60fps();
      if (el.textContent.trim() === '') {
        continue;
      }
      const textContent = el.textContent;
      if (textContent.match(/posiada/i)) {
        const words = lexSentence(textContent);
        const nodes = words.map(word => {
          if (word.toLowerCase().startsWith('posiada')) {
            return span({
              class: 'yellow-underline'
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
  });

  async function powszechneBledy(contentRoot) {
    const replaceList = [];
    for (const el of textIterator(contentRoot)) {
      await keep60fps();
      const {textContent} = el;
      if (textContent.length < 3 || isEmptyString(textContent)) {
        continue;
      }
      const issues = validateFragment(textContent);
      if (issues.length) {
        const replacementNode = span({
          class: 'red-underline',
          title: issues.join(', ')
        }, textContent);
        replaceList.push([el, replacementNode]);
      }
    }

    for (const [textNode, replaceNode] of replaceList) {
      await keep60fps();
      textNode.replaceWith(replaceNode);
    }
    contentRoot.normalize();
  }

  var powszechneBledy$1 = timed(powszechneBledy);

  const polishMonthNamesLocativus = [
    'styczniu', 'lutym', 'marcu',
    'kwietniu', 'maju', 'czerwcu',
    'lipcu', 'sierpniu', 'wrześniu',
    'październiku', 'listopadzie', 'grudniu'
  ];


  const predicatePairs = Object.entries({
    'język Polski': matches(/język\S* Polski/),
    'w dniu dzisiejszym': matchesAny(/dni(a|u) dzisie/i, /dzień dzisie/i),
    'w miesiącu lipcu': containsAny(...polishMonthNamesLocativus.map(m => `miesiącu ${m}`)),
    'w każdym bądź razie': contains('bądź razie'),
    'po wg nie powinno być kropki': contains('wg.'),
    'po mgr nie powinno być kropki': contains('mgr.'),
    'nie stosujemy formy v-prezes': matches(/v-(\S*)/i),
    'np': contains('np:'),
    'najmniejsza linia oporu': matches(/najmniejsz(\S*) lini/i),
    'uznać jako': matches(/uzna(\S*) jako/)
  });

  /**
   * Checks fragment for issues and returns array of violation reasons (eg. ["najmniejsza linia", "uznać jako"])
   * @param {string} txt
   * @returns {string[]}
   */
  function validateFragment(txt) {
    const matching = [];
    for (const [reason, predicate] of predicatePairs) {
      if (predicate(txt)) matching.push(reason);
    }
    return matching;
  }

  /**
   * Returns function that checks
   * @param searchedString
   * @returns {function(string): boolean}
   */
  function contains(searchedString) {
    searchedString = String(searchedString);
    return (txt) => txt.includes(searchedString);
  }

  function containsAny(...strings) {
    return (txt) => strings.some(searchedString => txt.includes(searchedString));
  }

  /**
   * Returns predicate checking if text matches regex
   * @param {RegExp} regex
   * @returns {function(string): boolean}
   */
  function matches(regex) {
    return (txt) => regex.test(txt);
  }

  /**
   * Returns predicate checking if text matches any of regexes
   * @param {...RegExp} regexes
   * @returns {function(string) : boolean}
   */
  function matchesAny(...regexes) {
    return (txt) => regexes.some(regex => regex.test(txt));
  }

  const isFirefox = /firefox/.test(navigator.userAgent);
  const windowProxy = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;

  class MediaWiki {
    constructor() {
      this._isHandling = false;
      this._handlers = [];
      let i = 0;
      this._mw = (async function() {
        while (!('mw' in windowProxy)) {
          i += 5;
          await waitMs(i % 100);
        }
        log('MediaWiki config found');
        return windowProxy.mw;
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
        try {
          log(`Executing handler ${handler.name}`);
          await this._mw.then(handler);
          log(`Success in handler ${handler.name}`);
        } catch (err) {
          error(`Handler ${handler.name} threw error: ${err.message}`);
          this._emitError(err);
        } finally {
          await keep60fps();
        }
        await keep60fps();
      }
      this._isHandling = false;
    }

    _emitError(err) {
      error(err);
    }
  }

  var defaultStyle = "span.red-underline {\n    text-decoration: red wavy underline;\n}\n\nspan.yellow-underline {\n    text-decoration: #C90 wavy underline;\n}";

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
    await powszechneBledy$1(contentRoot);
    await keep60fps();
    contentRoot.normalize();
  }

}());
