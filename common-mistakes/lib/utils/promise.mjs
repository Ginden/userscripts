/**
 * Returns promise waiting for some time.
 * Usually it's bad practice though.
 * @param {number} ms
 */

export const waitMs = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let lastTick = Date.now();
const maxDiff = 15;

/**
 * Returns promise. If more than 15 miliseconds passed since last call, it will await until next animation frame
 * This keeps user experience on highest level - he won't observe screen freezes
 * Value 15 can be tuned if other script perform busy operations in background
 * @returns {Promise.<undefined>}
 */
export const keep60fps = async function keep60fps() {
    if ((lastTick + maxDiff) < Date.now()) {
        return new Promise(requestAnimationFrame).then(() => {
            lastTick = Date.now();
        });
    }
};

