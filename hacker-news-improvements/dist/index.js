// ==UserScript==
// @name     Ginden's Hacker News Improvements
// @author Michał Wadas
// @version  21.293.1756
// @grant    none
// @include https://news.ycombinator.com/*
// @downloadURL https://raw.githubusercontent.com/Ginden/userscripts/master/hacker-news-improvements/dist/index.js
// @noframes
// @namespace pl.michalwadas.userscripts.hackernews
// @description Various QoL improvements for Hacker News. Generated from code cc6e6d9e48a12b85af10b37fe54b5e96b819b7b0e03d62c943e59a9d2243d23d
// ==/UserScript==

/**
Copyright (c) 2017-2021 Michał Wadas

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

(function () {
  'use strict';

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = "p.quote {\n    background-position-x: 0;\n    background-position-y: 0;\n    background-repeat: no-repeat;\n    background-size: 1.2em;\n    border-left: 0.5em #ccc solid;\n    color: rgba(0, 0, 0, 0.8);\n    display: inline-block;\n    padding-left: 0.25em;\n}\n";
  styleInject(css_248z);

  async function mapUserToColor(username) {
      const digest = await window.crypto.subtle.digest('SHA-1', (new TextEncoder()).encode(username));
      const firstTwoBytes = new Uint16Array(digest)[0];
      const percent = firstTwoBytes / ((2 ** 16) - 1);
      const h = Math.round(Number((percent * 360)));
      const s = 40;
      const l = 35;
      return `hsl(${h}, ${s}%, ${l}%)`;
  }
  async function colorUsernames() {
      const users = Array.from(window.document.querySelectorAll('a.hnuser'));
      const userNames = new Set(users.map(u => u.textContent).filter(Boolean));
      const map = new Map();
      for (const userName of userNames) {
          map.set(userName, await mapUserToColor(userName));
      }
      for (const user of users) {
          const userColor = map.get(user.textContent || '');
          if (userColor) {
              user.style.color = userColor;
          }
      }
  }

  function addParagraphToFirstLineOfComment() {
      for (const comment of Array.from(window.document.querySelectorAll('.comment > .commtext'))) {
          const children = [];
          for (const child of Array.from(comment.childNodes)) {
              if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'P') {
                  break;
              }
              children.push(child);
          }
          const p = document.createElement('p');
          p.append(...children);
          comment.prepend(p);
      }
  }
  function markParagraphsWithQuotes() {
      Array.from(window.document.querySelectorAll('.comtr p')).forEach(p => {
          if (p.textContent?.trim().startsWith('>')) {
              p.classList.add('quote');
          }
      });
  }
  function collapseQuotes() {
      const quotes = Array.from(window.document.querySelectorAll('p.quote')).reverse();
      for (const quote of quotes) {
          if (quote.previousElementSibling?.classList.contains('quote')) {
              const prev = quote.previousElementSibling;
              prev.appendChild(window.document.createElement('br'));
              prev.append(...Array.from(quote.childNodes));
              quote.parentElement?.removeChild(quote);
          }
      }
  }
  function removeMarkdownQuotationCharacter() {
      const quotes = Array.from(window.document.querySelectorAll('p.quote'));
      for (const quote of quotes) {
          const firstChild = quote.firstChild;
          if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) {
              continue;
          }
          const currTextContent = firstChild.textContent || '';
          firstChild.textContent = (firstChild.textContent || '').slice(currTextContent.indexOf('>') + 1).trim();
      }
  }

  function once(fn) {
      const sentinel = Symbol();
      let result = sentinel;
      return function (...args) {
          if (result !== sentinel) {
              return result;
          }
          result = Reflect.apply(fn, this, args);
          return result;
      };
  }

  function addStylesheet() {
      const styleElement = document.createElement('style');
      styleElement.textContent = css_248z;
      document.head.appendChild(styleElement);
  }
  const main = once(async function main() {
      addStylesheet();
      addParagraphToFirstLineOfComment();
      markParagraphsWithQuotes();
      removeMarkdownQuotationCharacter();
      collapseQuotes();
      await colorUsernames();
  });
  if (document.readyState === 'complete') {
      console.log(`Manually running code`);
      void main();
  }
  else {
      console.log(`Waiting for load event`);
      window.addEventListener('load', main);
  }

})();
