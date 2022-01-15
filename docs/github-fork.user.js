// ==UserScript==
// @name     GitHub Fork Upstream
// @author Michał Wadas
// @version  22.15.1800
// @grant    none
// @include https://github.com/*
// @noframes
// @namespace pl.michalwadas.userscripts.github
// @license MIT
// @description Generated from code d1bdbcd7fffb4ae20005b8ae3cd816c66bd7b87e06fc13110cafa4d8ef8ad9ca
// ==/UserScript==

/**

Copyright (c) 2017-2022 Michał Wadas

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

(function (exports) {
  'use strict';

  function createElement(tagName, props = {}, children = []) {
      const element = document.createElement(tagName);
      for (const [key, value] of Object.entries(props)) {
          element.setAttribute(key, String(value));
      }
      element.append(...children);
      return element;
  }
  (async () => {
      const header = document.querySelector('#repository-container-header');
      if (!header) {
          return;
      }
      if (!header.textContent?.includes(`forked from`)) {
          return;
      }
      const currentRepositoryAuthor = header.querySelector('h1 [rel="author"]')?.textContent?.trim();
      if (!currentRepositoryAuthor) {
          console.warn(`Repository author empty, it shouldn't happen`);
          return;
      }
      const currentRepositoryName = header.querySelector(`h1 [itemprop="name"] a`)?.textContent?.trim();
      if (!currentRepositoryName) {
          console.warn(`Repository name empty, it shouldn't happen`);
      }
      const repoParentPath = (() => {
          header.normalize();
          const nodeIterator = document.createNodeIterator(header, NodeFilter.SHOW_TEXT);
          do {
              const nextNode = nodeIterator.nextNode();
              if (!nextNode) {
                  return null;
              }
              if (!nextNode.textContent?.includes('forked from')) {
                  continue;
              }
              const parent = nextNode.parentNode;
              if (!parent) {
                  return null;
              }
              return parent.querySelector('a')?.textContent?.trim() ?? null;
          } while (true);
      })();
      if (!repoParentPath) {
          console.warn(`Fork name empty, it shouldn't happen`);
          return;
      }
      const repoPath = `${currentRepositoryAuthor}/${currentRepositoryName}`;
      const commandString = `
    git clone git@github.com:${repoPath}.git &&
    cd ${currentRepositoryName} &&
    git remote add upstream git@github.com:${repoParentPath}.git &&
    git fetch upstream
  `
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .join('\n');
      const sidebar = document.querySelector('#repo-content-pjax-container .Layout-sidebar .BorderGrid');
      if (!sidebar) {
          console.warn(`Sidebar not detected`);
          return;
      }
      const element = createElement('div', { class: 'BorederGrid-Row' }, [
          createElement('div', { class: 'Border-Grid-cell' }, [
              createElement('h2', {}, ['Clone fork']),
              createElement('div', { style: 'font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace' }, [commandString]),
          ]),
      ]);
      sidebar.prepend(element);
      console.log(commandString);
  })().catch(console.error);

  exports.createElement = createElement;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
