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
            await keep60fps();
        }
        this._isHandling = false;
    }

    _emitError(err) {
        error(err);
    }
}
