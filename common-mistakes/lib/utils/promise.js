export const waitMs = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const keep60fps = (function () {
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
