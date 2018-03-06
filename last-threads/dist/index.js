// ==UserScript==
// @name     Podświetlanie ostatnich wątków
// @author Michał Wadas
// @version  1.0.0
// @grant    none
// @include https://pl.wikipedia.org/*
// @noframes
// @namespace pl.michalwadas.userscripts
// @license MIT
// @description Generated from code a26c7fd53e1d110e51dd24f1be3413a0120d8efafcde8114c00f893acefaee8f
// ==/UserScript==

/**

Copyright (c) 2017-2018 Michał Wadas

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
  const keep60fps = function keep60fps() {
    if ((lastTick + maxDiff) < Date.now()) {
      return new Promise(requestAnimationFrame).then(() => {
        lastTick = Date.now();
      });
    }
    return Promise.resolve();
  };

  function log(firstArg) {
    console.log(...arguments);
    return firstArg;
  }


  function error(firstArg) {
    console.error(...arguments);
    return firstArg;
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
          i += 10;
          await waitMs(i %= 300);
        }
        log('MediaWiki config found');
        return new MediaWikiConfigAbstraction(windowProxy.mw, windowProxy);
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
      }
      this._isHandling = false;
    }

    _emitError(err) {
      error(err);
    }
  }

  class MediaWikiConfigAbstraction {
    constructor(originalMw, window) {
      this._mw = originalMw;
      this._window = window;
    }

    get raw() {
      return this._mw;
    }

    get window() {
      return this._window;
    }

    /**
     *
     * @returns {Object.<string, *>}
     */
    get config() {
      return this._mw.config.values;
    }

  }

  function mapConfig(fromKey, toKey) {
    Object.defineProperty(MediaWikiConfigAbstraction.prototype, toKey, {
      get() {
        return this.config[fromKey];
      }
    });
  }

  mapConfig('wgPageName', 'pageName');
  mapConfig('wgAction', 'action');
  mapConfig('wgRelevantPageName', 'relevantPageName');
  mapConfig('wgUserName', 'user');
  // " 	true if the content displayed on the page is related to the source of the corresponding article on the wiki. "
  mapConfig('wgIsArticle', 'hasWikicodeSource');

  var defaultStyle = "span.red-underline {\n    text-decoration: red wavy underline;\n}\n\nspan.yellow-underline {\n    text-decoration: #C90 wavy underline;\n}";

  console.log('Starting script');


  const mw = new MediaWiki();
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
    if (!isDiscussion(mw)) {
      return;
    }
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

}());
