import {
    keep60fps, waitMs
} from "./utils/promise";
import debug from './debug';


const win = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;

export default class MediaWiki {
    constructor() {
        this._isHandling = false;
        this._handlers = [];
        this._mw = (async function() {
            let i = 0;
            while(!('mw' in win)) {
                i += 5;
                await waitMs(i % 300);
            }
            debug.log('MediaWiki config found');
            return win.mw;
        }());
        this._mw.catch(err => this._emitError(err))
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
            await this._mw
                .then(handler)
                .catch(err => this._emitError(err))
                .finally(keep60fps);
            await keep60fps();
        }
        this._isHandling = false;
    }

    _emitError(err) {
        debug.error(err);
    }
}
