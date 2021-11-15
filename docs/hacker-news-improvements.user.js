// ==UserScript==
// @name     Ginden's Hacker News Improvements
// @author Michał Wadas
// @version  21.319.1017
// @grant              GM.getValue
// @grant              GM.setValue
// @grant GM.registerMenuCommand
// @include https://news.ycombinator.com/*
// @downloadURL https://ginden.github.io/userscripts/hacker-news-improvements.user.js
// @noframes
// @namespace pl.michalwadas.userscripts.hackernews
// @description Various QoL improvements for Hacker News. Generated from code 9c8c3f2f66048b6d76217ab54df4d6278645979fd83521108cb90029fba48987
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

  var css_248z = "p.quote {\n  background-position-x: 0;\n  background-position-y: 0;\n  background-repeat: no-repeat;\n  background-size: 1.2em;\n  border-left: 0.5em #ccc solid;\n  color: rgba(0, 0, 0, 0.8);\n  display: inline-block;\n  padding-left: 0.25em;\n}\n\n.karma-change.positive > .icon {\n  color: green;\n}\n\n.karma-change.negative > .icon {\n  color: red;\n}\n\n.karma-change.neutral > .icon {\n  color: gray;\n}\n";
  styleInject(css_248z);

  // nb. This is for IE10 and lower _only_.
  var supportCustomEvent = window.CustomEvent;
  if (!supportCustomEvent || typeof supportCustomEvent === 'object') {
    supportCustomEvent = function CustomEvent(event, x) {
      x = x || {};
      var ev = document.createEvent('CustomEvent');
      ev.initCustomEvent(event, !!x.bubbles, !!x.cancelable, x.detail || null);
      return ev;
    };
    supportCustomEvent.prototype = window.Event.prototype;
  }

  /**
   * Dispatches the passed event to both an "on<type>" handler as well as via the
   * normal dispatch operation. Does not bubble.
   *
   * @param {!EventTarget} target
   * @param {!Event} event
   * @return {boolean}
   */
  function safeDispatchEvent(target, event) {
    var check = 'on' + event.type.toLowerCase();
    if (typeof target[check] === 'function') {
      target[check](event);
    }
    return target.dispatchEvent(event);
  }

  /**
   * @param {Element} el to check for stacking context
   * @return {boolean} whether this el or its parents creates a stacking context
   */
  function createsStackingContext(el) {
    while (el && el !== document.body) {
      var s = window.getComputedStyle(el);
      var invalid = function(k, ok) {
        return !(s[k] === undefined || s[k] === ok);
      };

      if (s.opacity < 1 ||
          invalid('zIndex', 'auto') ||
          invalid('transform', 'none') ||
          invalid('mixBlendMode', 'normal') ||
          invalid('filter', 'none') ||
          invalid('perspective', 'none') ||
          s['isolation'] === 'isolate' ||
          s.position === 'fixed' ||
          s.webkitOverflowScrolling === 'touch') {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  /**
   * Finds the nearest <dialog> from the passed element.
   *
   * @param {Element} el to search from
   * @return {HTMLDialogElement} dialog found
   */
  function findNearestDialog(el) {
    while (el) {
      if (el.localName === 'dialog') {
        return /** @type {HTMLDialogElement} */ (el);
      }
      if (el.parentElement) {
        el = el.parentElement;
      } else if (el.parentNode) {
        el = el.parentNode.host;
      } else {
        el = null;
      }
    }
    return null;
  }

  /**
   * Blur the specified element, as long as it's not the HTML body element.
   * This works around an IE9/10 bug - blurring the body causes Windows to
   * blur the whole application.
   *
   * @param {Element} el to blur
   */
  function safeBlur(el) {
    // Find the actual focused element when the active element is inside a shadow root
    while (el && el.shadowRoot && el.shadowRoot.activeElement) {
      el = el.shadowRoot.activeElement;
    }

    if (el && el.blur && el !== document.body) {
      el.blur();
    }
  }

  /**
   * @param {!NodeList} nodeList to search
   * @param {Node} node to find
   * @return {boolean} whether node is inside nodeList
   */
  function inNodeList(nodeList, node) {
    for (var i = 0; i < nodeList.length; ++i) {
      if (nodeList[i] === node) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {HTMLFormElement} el to check
   * @return {boolean} whether this form has method="dialog"
   */
  function isFormMethodDialog(el) {
    if (!el || !el.hasAttribute('method')) {
      return false;
    }
    return el.getAttribute('method').toLowerCase() === 'dialog';
  }

  /**
   * @param {!DocumentFragment|!Element} hostElement
   * @return {?Element}
   */
  function findFocusableElementWithin(hostElement) {
    // Note that this is 'any focusable area'. This list is probably not exhaustive, but the
    // alternative involves stepping through and trying to focus everything.
    var opts = ['button', 'input', 'keygen', 'select', 'textarea'];
    var query = opts.map(function(el) {
      return el + ':not([disabled])';
    });
    // TODO(samthor): tabindex values that are not numeric are not focusable.
    query.push('[tabindex]:not([disabled]):not([tabindex=""])');  // tabindex != "", not disabled
    var target = hostElement.querySelector(query.join(', '));

    if (!target && 'attachShadow' in Element.prototype) {
      // If we haven't found a focusable target, see if the host element contains an element
      // which has a shadowRoot.
      // Recursively search for the first focusable item in shadow roots.
      var elems = hostElement.querySelectorAll('*');
      for (var i = 0; i < elems.length; i++) {
        if (elems[i].tagName && elems[i].shadowRoot) {
          target = findFocusableElementWithin(elems[i].shadowRoot);
          if (target) {
            break;
          }
        }
      }
    }
    return target;
  }

  /**
   * Determines if an element is attached to the DOM.
   * @param {Element} element to check
   * @return {boolean} whether the element is in DOM
   */
  function isConnected(element) {
    return element.isConnected || document.body.contains(element);
  }

  /**
   * @param {!Event} event
   * @return {?Element}
   */
  function findFormSubmitter(event) {
    if (event.submitter) {
      return event.submitter;
    }

    var form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return null;
    }

    var submitter = dialogPolyfill.formSubmitter;
    if (!submitter) {
      var target = event.target;
      var root = ('getRootNode' in target && target.getRootNode() || document);
      submitter = root.activeElement;
    }

    if (!submitter || submitter.form !== form) {
      return null;
    }
    return submitter;
  }

  /**
   * @param {!Event} event
   */
  function maybeHandleSubmit(event) {
    if (event.defaultPrevented) {
      return;
    }
    var form = /** @type {!HTMLFormElement} */ (event.target);

    // We'd have a value if we clicked on an imagemap.
    var value = dialogPolyfill.imagemapUseValue;
    var submitter = findFormSubmitter(event);
    if (value === null && submitter) {
      value = submitter.value;
    }

    // There should always be a dialog as this handler is added specifically on them, but check just
    // in case.
    var dialog = findNearestDialog(form);
    if (!dialog) {
      return;
    }

    // Prefer formmethod on the button.
    var formmethod = submitter && submitter.getAttribute('formmethod') || form.getAttribute('method');
    if (formmethod !== 'dialog') {
      return;
    }
    event.preventDefault();

    if (value != null) {
      // nb. we explicitly check against null/undefined
      dialog.close(value);
    } else {
      dialog.close();
    }
  }

  /**
   * @param {!HTMLDialogElement} dialog to upgrade
   * @constructor
   */
  function dialogPolyfillInfo(dialog) {
    this.dialog_ = dialog;
    this.replacedStyleTop_ = false;
    this.openAsModal_ = false;

    // Set a11y role. Browsers that support dialog implicitly know this already.
    if (!dialog.hasAttribute('role')) {
      dialog.setAttribute('role', 'dialog');
    }

    dialog.show = this.show.bind(this);
    dialog.showModal = this.showModal.bind(this);
    dialog.close = this.close.bind(this);

    dialog.addEventListener('submit', maybeHandleSubmit, false);

    if (!('returnValue' in dialog)) {
      dialog.returnValue = '';
    }

    if ('MutationObserver' in window) {
      var mo = new MutationObserver(this.maybeHideModal.bind(this));
      mo.observe(dialog, {attributes: true, attributeFilter: ['open']});
    } else {
      // IE10 and below support. Note that DOMNodeRemoved etc fire _before_ removal. They also
      // seem to fire even if the element was removed as part of a parent removal. Use the removed
      // events to force downgrade (useful if removed/immediately added).
      var removed = false;
      var cb = function() {
        removed ? this.downgradeModal() : this.maybeHideModal();
        removed = false;
      }.bind(this);
      var timeout;
      var delayModel = function(ev) {
        if (ev.target !== dialog) { return; }  // not for a child element
        var cand = 'DOMNodeRemoved';
        removed |= (ev.type.substr(0, cand.length) === cand);
        window.clearTimeout(timeout);
        timeout = window.setTimeout(cb, 0);
      };
      ['DOMAttrModified', 'DOMNodeRemoved', 'DOMNodeRemovedFromDocument'].forEach(function(name) {
        dialog.addEventListener(name, delayModel);
      });
    }
    // Note that the DOM is observed inside DialogManager while any dialog
    // is being displayed as a modal, to catch modal removal from the DOM.

    Object.defineProperty(dialog, 'open', {
      set: this.setOpen.bind(this),
      get: dialog.hasAttribute.bind(dialog, 'open')
    });

    this.backdrop_ = document.createElement('div');
    this.backdrop_.className = 'backdrop';
    this.backdrop_.addEventListener('mouseup'  , this.backdropMouseEvent_.bind(this));
    this.backdrop_.addEventListener('mousedown', this.backdropMouseEvent_.bind(this));
    this.backdrop_.addEventListener('click'    , this.backdropMouseEvent_.bind(this));
  }

  dialogPolyfillInfo.prototype = /** @type {HTMLDialogElement.prototype} */ ({

    get dialog() {
      return this.dialog_;
    },

    /**
     * Maybe remove this dialog from the modal top layer. This is called when
     * a modal dialog may no longer be tenable, e.g., when the dialog is no
     * longer open or is no longer part of the DOM.
     */
    maybeHideModal: function() {
      if (this.dialog_.hasAttribute('open') && isConnected(this.dialog_)) { return; }
      this.downgradeModal();
    },

    /**
     * Remove this dialog from the modal top layer, leaving it as a non-modal.
     */
    downgradeModal: function() {
      if (!this.openAsModal_) { return; }
      this.openAsModal_ = false;
      this.dialog_.style.zIndex = '';

      // This won't match the native <dialog> exactly because if the user set top on a centered
      // polyfill dialog, that top gets thrown away when the dialog is closed. Not sure it's
      // possible to polyfill this perfectly.
      if (this.replacedStyleTop_) {
        this.dialog_.style.top = '';
        this.replacedStyleTop_ = false;
      }

      // Clear the backdrop and remove from the manager.
      this.backdrop_.parentNode && this.backdrop_.parentNode.removeChild(this.backdrop_);
      dialogPolyfill.dm.removeDialog(this);
    },

    /**
     * @param {boolean} value whether to open or close this dialog
     */
    setOpen: function(value) {
      if (value) {
        this.dialog_.hasAttribute('open') || this.dialog_.setAttribute('open', '');
      } else {
        this.dialog_.removeAttribute('open');
        this.maybeHideModal();  // nb. redundant with MutationObserver
      }
    },

    /**
     * Handles mouse events ('mouseup', 'mousedown', 'click') on the fake .backdrop element, redirecting them as if
     * they were on the dialog itself.
     *
     * @param {!Event} e to redirect
     */
    backdropMouseEvent_: function(e) {
      if (!this.dialog_.hasAttribute('tabindex')) {
        // Clicking on the backdrop should move the implicit cursor, even if dialog cannot be
        // focused. Create a fake thing to focus on. If the backdrop was _before_ the dialog, this
        // would not be needed - clicks would move the implicit cursor there.
        var fake = document.createElement('div');
        this.dialog_.insertBefore(fake, this.dialog_.firstChild);
        fake.tabIndex = -1;
        fake.focus();
        this.dialog_.removeChild(fake);
      } else {
        this.dialog_.focus();
      }

      var redirectedEvent = document.createEvent('MouseEvents');
      redirectedEvent.initMouseEvent(e.type, e.bubbles, e.cancelable, window,
          e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey,
          e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
      this.dialog_.dispatchEvent(redirectedEvent);
      e.stopPropagation();
    },

    /**
     * Focuses on the first focusable element within the dialog. This will always blur the current
     * focus, even if nothing within the dialog is found.
     */
    focus_: function() {
      // Find element with `autofocus` attribute, or fall back to the first form/tabindex control.
      var target = this.dialog_.querySelector('[autofocus]:not([disabled])');
      if (!target && this.dialog_.tabIndex >= 0) {
        target = this.dialog_;
      }
      if (!target) {
        target = findFocusableElementWithin(this.dialog_);
      }
      safeBlur(document.activeElement);
      target && target.focus();
    },

    /**
     * Sets the zIndex for the backdrop and dialog.
     *
     * @param {number} dialogZ
     * @param {number} backdropZ
     */
    updateZIndex: function(dialogZ, backdropZ) {
      if (dialogZ < backdropZ) {
        throw new Error('dialogZ should never be < backdropZ');
      }
      this.dialog_.style.zIndex = dialogZ;
      this.backdrop_.style.zIndex = backdropZ;
    },

    /**
     * Shows the dialog. If the dialog is already open, this does nothing.
     */
    show: function() {
      if (!this.dialog_.open) {
        this.setOpen(true);
        this.focus_();
      }
    },

    /**
     * Show this dialog modally.
     */
    showModal: function() {
      if (this.dialog_.hasAttribute('open')) {
        throw new Error('Failed to execute \'showModal\' on dialog: The element is already open, and therefore cannot be opened modally.');
      }
      if (!isConnected(this.dialog_)) {
        throw new Error('Failed to execute \'showModal\' on dialog: The element is not in a Document.');
      }
      if (!dialogPolyfill.dm.pushDialog(this)) {
        throw new Error('Failed to execute \'showModal\' on dialog: There are too many open modal dialogs.');
      }

      if (createsStackingContext(this.dialog_.parentElement)) {
        console.warn('A dialog is being shown inside a stacking context. ' +
            'This may cause it to be unusable. For more information, see this link: ' +
            'https://github.com/GoogleChrome/dialog-polyfill/#stacking-context');
      }

      this.setOpen(true);
      this.openAsModal_ = true;

      // Optionally center vertically, relative to the current viewport.
      if (dialogPolyfill.needsCentering(this.dialog_)) {
        dialogPolyfill.reposition(this.dialog_);
        this.replacedStyleTop_ = true;
      } else {
        this.replacedStyleTop_ = false;
      }

      // Insert backdrop.
      this.dialog_.parentNode.insertBefore(this.backdrop_, this.dialog_.nextSibling);

      // Focus on whatever inside the dialog.
      this.focus_();
    },

    /**
     * Closes this HTMLDialogElement. This is optional vs clearing the open
     * attribute, however this fires a 'close' event.
     *
     * @param {string=} opt_returnValue to use as the returnValue
     */
    close: function(opt_returnValue) {
      if (!this.dialog_.hasAttribute('open')) {
        throw new Error('Failed to execute \'close\' on dialog: The element does not have an \'open\' attribute, and therefore cannot be closed.');
      }
      this.setOpen(false);

      // Leave returnValue untouched in case it was set directly on the element
      if (opt_returnValue !== undefined) {
        this.dialog_.returnValue = opt_returnValue;
      }

      // Triggering "close" event for any attached listeners on the <dialog>.
      var closeEvent = new supportCustomEvent('close', {
        bubbles: false,
        cancelable: false
      });
      safeDispatchEvent(this.dialog_, closeEvent);
    }

  });

  var dialogPolyfill = {};

  dialogPolyfill.reposition = function(element) {
    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    var topValue = scrollTop + (window.innerHeight - element.offsetHeight) / 2;
    element.style.top = Math.max(scrollTop, topValue) + 'px';
  };

  dialogPolyfill.isInlinePositionSetByStylesheet = function(element) {
    for (var i = 0; i < document.styleSheets.length; ++i) {
      var styleSheet = document.styleSheets[i];
      var cssRules = null;
      // Some browsers throw on cssRules.
      try {
        cssRules = styleSheet.cssRules;
      } catch (e) {}
      if (!cssRules) { continue; }
      for (var j = 0; j < cssRules.length; ++j) {
        var rule = cssRules[j];
        var selectedNodes = null;
        // Ignore errors on invalid selector texts.
        try {
          selectedNodes = document.querySelectorAll(rule.selectorText);
        } catch(e) {}
        if (!selectedNodes || !inNodeList(selectedNodes, element)) {
          continue;
        }
        var cssTop = rule.style.getPropertyValue('top');
        var cssBottom = rule.style.getPropertyValue('bottom');
        if ((cssTop && cssTop !== 'auto') || (cssBottom && cssBottom !== 'auto')) {
          return true;
        }
      }
    }
    return false;
  };

  dialogPolyfill.needsCentering = function(dialog) {
    var computedStyle = window.getComputedStyle(dialog);
    if (computedStyle.position !== 'absolute') {
      return false;
    }

    // We must determine whether the top/bottom specified value is non-auto.  In
    // WebKit/Blink, checking computedStyle.top == 'auto' is sufficient, but
    // Firefox returns the used value. So we do this crazy thing instead: check
    // the inline style and then go through CSS rules.
    if ((dialog.style.top !== 'auto' && dialog.style.top !== '') ||
        (dialog.style.bottom !== 'auto' && dialog.style.bottom !== '')) {
      return false;
    }
    return !dialogPolyfill.isInlinePositionSetByStylesheet(dialog);
  };

  /**
   * @param {!Element} element to force upgrade
   */
  dialogPolyfill.forceRegisterDialog = function(element) {
    if (window.HTMLDialogElement || element.showModal) {
      console.warn('This browser already supports <dialog>, the polyfill ' +
          'may not work correctly', element);
    }
    if (element.localName !== 'dialog') {
      throw new Error('Failed to register dialog: The element is not a dialog.');
    }
    new dialogPolyfillInfo(/** @type {!HTMLDialogElement} */ (element));
  };

  /**
   * @param {!Element} element to upgrade, if necessary
   */
  dialogPolyfill.registerDialog = function(element) {
    if (!element.showModal) {
      dialogPolyfill.forceRegisterDialog(element);
    }
  };

  /**
   * @constructor
   */
  dialogPolyfill.DialogManager = function() {
    /** @type {!Array<!dialogPolyfillInfo>} */
    this.pendingDialogStack = [];

    var checkDOM = this.checkDOM_.bind(this);

    // The overlay is used to simulate how a modal dialog blocks the document.
    // The blocking dialog is positioned on top of the overlay, and the rest of
    // the dialogs on the pending dialog stack are positioned below it. In the
    // actual implementation, the modal dialog stacking is controlled by the
    // top layer, where z-index has no effect.
    this.overlay = document.createElement('div');
    this.overlay.className = '_dialog_overlay';
    this.overlay.addEventListener('click', function(e) {
      this.forwardTab_ = undefined;
      e.stopPropagation();
      checkDOM([]);  // sanity-check DOM
    }.bind(this));

    this.handleKey_ = this.handleKey_.bind(this);
    this.handleFocus_ = this.handleFocus_.bind(this);

    this.zIndexLow_ = 100000;
    this.zIndexHigh_ = 100000 + 150;

    this.forwardTab_ = undefined;

    if ('MutationObserver' in window) {
      this.mo_ = new MutationObserver(function(records) {
        var removed = [];
        records.forEach(function(rec) {
          for (var i = 0, c; c = rec.removedNodes[i]; ++i) {
            if (!(c instanceof Element)) {
              continue;
            } else if (c.localName === 'dialog') {
              removed.push(c);
            }
            removed = removed.concat(c.querySelectorAll('dialog'));
          }
        });
        removed.length && checkDOM(removed);
      });
    }
  };

  /**
   * Called on the first modal dialog being shown. Adds the overlay and related
   * handlers.
   */
  dialogPolyfill.DialogManager.prototype.blockDocument = function() {
    document.documentElement.addEventListener('focus', this.handleFocus_, true);
    document.addEventListener('keydown', this.handleKey_);
    this.mo_ && this.mo_.observe(document, {childList: true, subtree: true});
  };

  /**
   * Called on the first modal dialog being removed, i.e., when no more modal
   * dialogs are visible.
   */
  dialogPolyfill.DialogManager.prototype.unblockDocument = function() {
    document.documentElement.removeEventListener('focus', this.handleFocus_, true);
    document.removeEventListener('keydown', this.handleKey_);
    this.mo_ && this.mo_.disconnect();
  };

  /**
   * Updates the stacking of all known dialogs.
   */
  dialogPolyfill.DialogManager.prototype.updateStacking = function() {
    var zIndex = this.zIndexHigh_;

    for (var i = 0, dpi; dpi = this.pendingDialogStack[i]; ++i) {
      dpi.updateZIndex(--zIndex, --zIndex);
      if (i === 0) {
        this.overlay.style.zIndex = --zIndex;
      }
    }

    // Make the overlay a sibling of the dialog itself.
    var last = this.pendingDialogStack[0];
    if (last) {
      var p = last.dialog.parentNode || document.body;
      p.appendChild(this.overlay);
    } else if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  };

  /**
   * @param {Element} candidate to check if contained or is the top-most modal dialog
   * @return {boolean} whether candidate is contained in top dialog
   */
  dialogPolyfill.DialogManager.prototype.containedByTopDialog_ = function(candidate) {
    while (candidate = findNearestDialog(candidate)) {
      for (var i = 0, dpi; dpi = this.pendingDialogStack[i]; ++i) {
        if (dpi.dialog === candidate) {
          return i === 0;  // only valid if top-most
        }
      }
      candidate = candidate.parentElement;
    }
    return false;
  };

  dialogPolyfill.DialogManager.prototype.handleFocus_ = function(event) {
    var target = event.composedPath ? event.composedPath()[0] : event.target;

    if (this.containedByTopDialog_(target)) { return; }

    if (document.activeElement === document.documentElement) { return; }

    event.preventDefault();
    event.stopPropagation();
    safeBlur(/** @type {Element} */ (target));

    if (this.forwardTab_ === undefined) { return; }  // move focus only from a tab key

    var dpi = this.pendingDialogStack[0];
    var dialog = dpi.dialog;
    var position = dialog.compareDocumentPosition(target);
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      if (this.forwardTab_) {
        // forward
        dpi.focus_();
      } else if (target !== document.documentElement) {
        // backwards if we're not already focused on <html>
        document.documentElement.focus();
      }
    }

    return false;
  };

  dialogPolyfill.DialogManager.prototype.handleKey_ = function(event) {
    this.forwardTab_ = undefined;
    if (event.keyCode === 27) {
      event.preventDefault();
      event.stopPropagation();
      var cancelEvent = new supportCustomEvent('cancel', {
        bubbles: false,
        cancelable: true
      });
      var dpi = this.pendingDialogStack[0];
      if (dpi && safeDispatchEvent(dpi.dialog, cancelEvent)) {
        dpi.dialog.close();
      }
    } else if (event.keyCode === 9) {
      this.forwardTab_ = !event.shiftKey;
    }
  };

  /**
   * Finds and downgrades any known modal dialogs that are no longer displayed. Dialogs that are
   * removed and immediately readded don't stay modal, they become normal.
   *
   * @param {!Array<!HTMLDialogElement>} removed that have definitely been removed
   */
  dialogPolyfill.DialogManager.prototype.checkDOM_ = function(removed) {
    // This operates on a clone because it may cause it to change. Each change also calls
    // updateStacking, which only actually needs to happen once. But who removes many modal dialogs
    // at a time?!
    var clone = this.pendingDialogStack.slice();
    clone.forEach(function(dpi) {
      if (removed.indexOf(dpi.dialog) !== -1) {
        dpi.downgradeModal();
      } else {
        dpi.maybeHideModal();
      }
    });
  };

  /**
   * @param {!dialogPolyfillInfo} dpi
   * @return {boolean} whether the dialog was allowed
   */
  dialogPolyfill.DialogManager.prototype.pushDialog = function(dpi) {
    var allowed = (this.zIndexHigh_ - this.zIndexLow_) / 2 - 1;
    if (this.pendingDialogStack.length >= allowed) {
      return false;
    }
    if (this.pendingDialogStack.unshift(dpi) === 1) {
      this.blockDocument();
    }
    this.updateStacking();
    return true;
  };

  /**
   * @param {!dialogPolyfillInfo} dpi
   */
  dialogPolyfill.DialogManager.prototype.removeDialog = function(dpi) {
    var index = this.pendingDialogStack.indexOf(dpi);
    if (index === -1) { return; }

    this.pendingDialogStack.splice(index, 1);
    if (this.pendingDialogStack.length === 0) {
      this.unblockDocument();
    }
    this.updateStacking();
  };

  dialogPolyfill.dm = new dialogPolyfill.DialogManager();
  dialogPolyfill.formSubmitter = null;
  dialogPolyfill.imagemapUseValue = null;

  /**
   * Installs global handlers, such as click listers and native method overrides. These are needed
   * even if a no dialog is registered, as they deal with <form method="dialog">.
   */
  if (window.HTMLDialogElement === undefined) {

    /**
     * If HTMLFormElement translates method="DIALOG" into 'get', then replace the descriptor with
     * one that returns the correct value.
     */
    var testForm = document.createElement('form');
    testForm.setAttribute('method', 'dialog');
    if (testForm.method !== 'dialog') {
      var methodDescriptor = Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, 'method');
      if (methodDescriptor) {
        // nb. Some older iOS and older PhantomJS fail to return the descriptor. Don't do anything
        // and don't bother to update the element.
        var realGet = methodDescriptor.get;
        methodDescriptor.get = function() {
          if (isFormMethodDialog(this)) {
            return 'dialog';
          }
          return realGet.call(this);
        };
        var realSet = methodDescriptor.set;
        /** @this {HTMLElement} */
        methodDescriptor.set = function(v) {
          if (typeof v === 'string' && v.toLowerCase() === 'dialog') {
            return this.setAttribute('method', v);
          }
          return realSet.call(this, v);
        };
        Object.defineProperty(HTMLFormElement.prototype, 'method', methodDescriptor);
      }
    }

    /**
     * Global 'click' handler, to capture the <input type="submit"> or <button> element which has
     * submitted a <form method="dialog">. Needed as Safari and others don't report this inside
     * document.activeElement.
     */
    document.addEventListener('click', function(ev) {
      dialogPolyfill.formSubmitter = null;
      dialogPolyfill.imagemapUseValue = null;
      if (ev.defaultPrevented) { return; }  // e.g. a submit which prevents default submission

      var target = /** @type {Element} */ (ev.target);
      if ('composedPath' in ev) {
        var path = ev.composedPath();
        target = path.shift() || target;
      }
      if (!target || !isFormMethodDialog(target.form)) { return; }

      var valid = (target.type === 'submit' && ['button', 'input'].indexOf(target.localName) > -1);
      if (!valid) {
        if (!(target.localName === 'input' && target.type === 'image')) { return; }
        // this is a <input type="image">, which can submit forms
        dialogPolyfill.imagemapUseValue = ev.offsetX + ',' + ev.offsetY;
      }

      var dialog = findNearestDialog(target);
      if (!dialog) { return; }

      dialogPolyfill.formSubmitter = target;

    }, false);

    /**
     * Global 'submit' handler. This handles submits of `method="dialog"` which are invalid, i.e.,
     * outside a dialog. They get prevented.
     */
    document.addEventListener('submit', function(ev) {
      var form = ev.target;
      var dialog = findNearestDialog(form);
      if (dialog) {
        return;  // ignore, handle there
      }

      var submitter = findFormSubmitter(ev);
      var formmethod = submitter && submitter.getAttribute('formmethod') || form.getAttribute('method');
      if (formmethod === 'dialog') {
        ev.preventDefault();
      }
    });

    /**
     * Replace the native HTMLFormElement.submit() method, as it won't fire the
     * submit event and give us a chance to respond.
     */
    var nativeFormSubmit = HTMLFormElement.prototype.submit;
    var replacementFormSubmit = function () {
      if (!isFormMethodDialog(this)) {
        return nativeFormSubmit.call(this);
      }
      var dialog = findNearestDialog(this);
      dialog && dialog.close();
    };
    HTMLFormElement.prototype.submit = replacementFormSubmit;
  }

  async function mapUserToColor(username, config) {
      const digest = await window.crypto.subtle.digest('SHA-1', new TextEncoder().encode(username));
      const firstTwoBytes = new Uint16Array(digest)[0];
      const percent = firstTwoBytes / (2 ** 16 - 1);
      const h = Math.round(Number(percent * 360));
      const s = config['username-colors.saturation'];
      const l = config['username-colors.lightness'];
      return `hsl(${h}, ${s}%, ${l}%)`;
  }
  async function colorUsernames(config) {
      const users = Array.from(window.document.querySelectorAll('a.hnuser'));
      const userNames = new Set(users.map((u) => u.textContent).filter(Boolean));
      const map = new Map(await Promise.all([...userNames].map((userName) => Promise.all([userName, mapUserToColor(userName, config)]))));
      for (const user of users) {
          const userColor = map.get(user.textContent || '');
          if (userColor) {
              user.style.color = userColor;
          }
      }
  }

  function* iterateOverConfig(config, path = []) {
      for (const element of config.elements) {
          if (element.type === 'section') {
              yield* iterateOverConfig(element, [...path, element.id]);
          }
          else {
              yield Object.assign(element, { path: [...path, element.id] });
          }
      }
  }
  function getDefaultsFromConfig(config) {
      const ret = {};
      for (const element of iterateOverConfig(config)) {
          const id = getIdFromPath(element.path);
          if (element.default !== undefined)
              ret[id] = element.default;
      }
      return ret;
  }
  function getIdFromPath(path) {
      return path.join('.');
  }

  function getSavedConfig(config) {
      return GM.getValue(config.title).then((v) => (v ? JSON.parse(String(v)) : getDefaultsFromConfig(config)));
  }
  function saveConfig(config, value) {
      return GM.setValue(config.title, JSON.stringify(value));
  }

  function createElement(tagName, props = {}, children = []) {
      const element = document.createElement(tagName);
      for (const [key, value] of Object.entries(props)) {
          element.setAttribute(key, String(value));
      }
      element.append(...children);
      return element;
  }

  function findLast(arr, predicate, thisArg) {
      for (let i = arr.length - 1; i > 0; i--) {
          const v = arr[i];
          const predicateReturnValue = Reflect.apply(predicate, thisArg, [v, i, arr]);
          if (predicateReturnValue) {
              return v;
          }
      }
      return undefined;
  }

  function getDate(datetime = new Date()) {
      return datetime.toISOString().slice(0, 10);
  }

  const maxEntries = 30;
  async function saveKarma(karma, date = getDate()) {
      const currentKarmaStore = await getKarmaHistory();
      const valueToUpdate = currentKarmaStore.find(([historicalDate, value]) => historicalDate === date);
      if (valueToUpdate) {
          valueToUpdate[1] = karma;
      }
      else {
          currentKarmaStore.push([date, karma]);
      }
      while (currentKarmaStore.length > maxEntries) {
          currentKarmaStore.shift();
      }
      await GM.setValue('karma-store', JSON.stringify(currentKarmaStore));
  }
  function getKarmaHistory() {
      return GM.getValue('karma-store')
          .then(String)
          .then(JSON.parse)
          .catch(() => null)
          .then((v) => (Array.isArray(v) ? v : []));
  }

  function extractKarmaFromWebsite() {
      const a = document.querySelector('a#me');
      if (!a) {
          console.warn(`Not logged in?`);
          return 0;
      }
      const textContent = (a.parentElement?.textContent ?? '').trim();
      const match = textContent.match(/\((\d*)\)/);
      if (match && parseInt(match[1])) {
          return parseInt(match[1]);
      }
      console.warn(`Failed to parse ${textContent}`, { match });
      return 0;
  }
  function buildChangeElement(change, since) {
      const fragment = document.createDocumentFragment();
      const textNode = document.createTextNode(' | ');
      const changeElement = createElement('span', { class: 'karma-change' });
      fragment.append(changeElement);
      if (change > 0) {
          changeElement.classList.add('positive');
          changeElement.append(createElement('span', { class: 'icon' }, ['⬆']), document.createTextNode(`${change}`));
      }
      else if (change === 0) {
          changeElement.classList.add('neutral');
          changeElement.append(createElement('span', { class: 'icon' }, ['~']), document.createTextNode('0'));
      }
      else if (change < 0) {
          changeElement.classList.add('negative');
          changeElement.append(createElement('span', { class: 'icon' }, ['⬇']), document.createTextNode(`${change}`));
      }
      changeElement.title = `Since ${since}`;
      fragment.append(textNode);
      return fragment;
  }
  async function trackKarma() {
      const currentKarma = extractKarmaFromWebsite();
      await saveKarma(currentKarma);
      const currentDate = getDate();
      const karmaHistory = await getKarmaHistory();
      const previousDayVisitKarma = findLast(karmaHistory, ([date]) => date !== currentDate) || [currentDate, currentKarma];
      console.log({ karmaHistory, previousDayVisitKarma, currentKarma });
      const [sinceDate, historicalKarma] = previousDayVisitKarma;
      const change = currentKarma - historicalKarma;
      const logoutElement = document.querySelector('a#logout');
      if (!logoutElement) {
          console.warn('No logout element found');
          return;
      }
      const changeElement = buildChangeElement(change, sinceDate);
      logoutElement.parentElement?.insertBefore(changeElement, logoutElement);
  }

  const hackerNewsImprovementsConfig = {
      title: 'Hacker news improvements',
      elements: [
          {
              type: 'boolean',
              id: 'quotes',
              title: 'Convert quotes',
              default: true,
          },
          {
              type: 'boolean',
              id: 'karma-tracking',
              title: 'Track karma changes',
              default: true,
          },
          {
              type: 'section',
              id: 'username-colors',
              title: 'Color usernames',
              elements: [
                  {
                      type: 'boolean',
                      title: 'Enable',
                      id: 'enabled',
                      default: true,
                  },
                  {
                      type: 'range',
                      min: 0,
                      max: 100,
                      id: 'saturation',
                      default: 40,
                      step: 1,
                      title: 'Saturation',
                  },
                  {
                      type: 'range',
                      min: 0,
                      max: 100,
                      id: 'lightness',
                      title: 'Lightness',
                      default: 35,
                      step: 1,
                  },
              ],
          },
      ],
  };

  const dialogMap = new Map();
  function createHtmlFromRadioConfig(definition, path) {
      const id = getIdFromPath([...path, definition.id]);
      return createElement('div', {}, [
          createElement('label', { for: id }, [definition.title]),
          ...definition.options.map((v, i) => {
              return createElement('input', { type: 'radio', id: `${id}.${i}`, name: id });
          }),
      ]);
  }
  function createHtmlFromBooleanConfig(definition, path) {
      const id = getIdFromPath([...path, definition.id]);
      return createElement('div', {}, [
          createElement('label', { for: id }, [definition.title]),
          createElement('input', { type: 'checkbox', id, name: id }),
      ]);
  }
  function createHtmlFromSectionConfig(definition, path) {
      return createElement('fieldset', {}, [
          createElement('legend', {}, [definition.title]),
          ...definition.elements.map((v) => createHtmlFromConfigElement(v, [...path, definition.id])),
      ]);
  }
  function createHtmlFromRangeElement(definition, path) {
      const id = getIdFromPath([...path, definition.id]);
      return createElement('div', {}, [
          createElement('label', { for: id }, [definition.title]),
          createElement('input', {
              type: 'range',
              id,
              name: id,
              min: definition.min,
              max: definition.max,
              step: definition.step ?? 1,
          }),
      ]);
  }
  function createHtmlFromConfigElement(definition, path) {
      switch (definition.type) {
          case 'radio':
              return createHtmlFromRadioConfig(definition, path);
          case 'boolean':
              return createHtmlFromBooleanConfig(definition, path);
          case 'section':
              return createHtmlFromSectionConfig(definition, path);
          case 'range':
              return createHtmlFromRangeElement(definition, path);
      }
  }
  function buildConfigPage(config) {
      const dialog = createElement('dialog');
      const form = createElement('form', { method: 'dialog' });
      dialog.append(form);
      form.append(createElement('legend', {}, ['Config']));
      for (const definition of config.elements) {
          form.append(createHtmlFromConfigElement(definition, []));
      }
      form.append(createElement('input', { type: 'submit' }, ['Save']));
      form.append(createElement('input', { type: 'reset' }, ['Reset & exit']));
      return dialog;
  }
  function showConfigPage(config) {
      const dialog = dialogMap.get(config.title);
      if (dialog) {
          dialog.showModal();
      }
  }
  function extractDataFromDialogForm(form) {
      const ret = {};
      const radios = Array.from(form.querySelectorAll('input[type="radio"]:checked'));
      for (const radio of radios) {
          ret[radio.name] = radio.value;
      }
      for (const checkbox of Array.from(form.querySelectorAll('input[type="checkbox"]'))) {
          ret[checkbox.name] = checkbox.checked;
      }
      for (const range of Array.from(form.querySelectorAll('input[type="range"]'))) {
          ret[range.name] = range.value;
      }
      return ret;
  }
  function loadDataIntoDialogForm(config, form, data) {
      const defaults = getDefaultsFromConfig(config);
      for (const element of iterateOverConfig(config)) {
          const name = getIdFromPath(element.path);
          const currentConfigValue = data[name] || defaults[name];
          if (element.type === 'section') {
              continue;
          }
          else if (element.type === 'range') {
              const selector = `input[type=range][name="${name}"]`;
              const inputHtml = form.querySelector(selector);
              if (!inputHtml) {
                  console.warn(`Missing input HTML`, { element, selector });
                  continue;
              }
              inputHtml.value = String(currentConfigValue);
          }
          else if (element.type === 'radio') {
              const selector = `input[type=radio][name="${name}"]`;
              const inputHtml = form.querySelectorAll(selector);
              const elementToMarkAsChecked = Array.from(inputHtml).find((v) => v.value === currentConfigValue);
              if (!elementToMarkAsChecked) {
                  console.warn(`Missing input HTML`, { element, selector });
                  continue;
              }
              elementToMarkAsChecked.checked = true;
          }
          else if (element.type === 'boolean') {
              const selector = `input[type=checkbox][name="${name}"]`;
              const inputHtml = form.querySelector(selector);
              if (!inputHtml) {
                  console.warn(`Missing input HTML`, { element, selector });
                  continue;
              }
              inputHtml.checked = typeof currentConfigValue === 'boolean' ? currentConfigValue : false;
          }
      }
  }
  async function registerConfig(config) {
      const dialog = buildConfigPage(config);
      dialog.addEventListener('reset', () => {
          loadDataIntoDialogForm(config, dialog, getDefaultsFromConfig(config));
      });
      dialog.addEventListener('close', async (e) => {
          e.preventDefault();
          await saveConfig(config, extractDataFromDialogForm(dialog.querySelector('form')));
          await new Promise((resolve) => setTimeout(resolve, 300));
          location.reload();
      });
      dialogMap.set(config.title, dialog);
      dialogPolyfill.registerDialog(dialog);
      document.body.append(dialog);
      GM.registerMenuCommand(`Config: ${config.title}`, async () => {
          const savedConfig = await getSavedConfig(config);
          loadDataIntoDialogForm(config, dialog, savedConfig);
          showConfigPage(config);
      });
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
      Array.from(window.document.querySelectorAll('.comtr p')).forEach((p) => {
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

  registerConfig(hackerNewsImprovementsConfig).catch(console.error);
  const main = once(async function main() {
      const config = (await getSavedConfig(hackerNewsImprovementsConfig));
      console.log('Current config', config);
      if (config['quotes']) {
          addParagraphToFirstLineOfComment();
          markParagraphsWithQuotes();
          removeMarkdownQuotationCharacter();
          collapseQuotes();
      }
      if (config['username-colors.enabled']) {
          await colorUsernames(config);
      }
      if (config['karma-tracking']) {
          await trackKarma();
      }
  });
  window.addEventListener('load', main);

})();
