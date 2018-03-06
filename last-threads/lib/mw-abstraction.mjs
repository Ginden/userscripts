import {
    keep60fps,
    waitMs
} from './utils/promise.mjs';
import {
    error,
    log
} from './debug.mjs';

import {
    windowProxy
} from './utils/browser.mjs'

export default class MediaWiki {
    constructor() {
        this._isHandling = false;
        this._handlers = [];
        let i = 0;
        this._mw = (async function() {
            while(!('mw' in windowProxy)) {
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
        while(this._handlers[0]) {
            const handler = this._handlers.shift();
            try {
                log(`Executing handler ${handler.name}`);
                await this._mw.then(handler);
                log(`Success in handler ${handler.name}`);
            } catch(err) {
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

export class MediaWikiConfigAbstraction {
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


