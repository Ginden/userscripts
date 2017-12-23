export const isFirefox = /firefox/.test(navigator.userAgent);
export const windowProxy = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;