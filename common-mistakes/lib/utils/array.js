/**
 * Recursively flattens array
 * @param arr
 * @returns {*[]}
 */

export function flatten(arr) {
    return Array.isArray(arr) ? ([].concat.apply([], arr.map(flatten))): arr;
}
