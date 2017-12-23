import {
    textIterator,
    span
} from '../utils/dom.mjs';
import {keep60fps} from '../utils/promise.mjs';
import {timed} from '../debug.mjs';
import {isEmptyString} from '../utils/string.mjs';


async function powszechneBledy(contentRoot) {
    const replaceList = [];
    for(const el of textIterator(contentRoot)) {
        const {textContent} = el;
        if (isEmptyString(textContent)) {
            continue;
        }
        const issues = validateFragment(textContent);
        if(issues.length) {
            const replacementNode = span({class: 'red-underline', title: issues.join(', ')}, textContent);
            replaceList.push([el, replacementNode]);
        }
        await keep60fps();
    }

    for(const [textNode, replaceNode] of replaceList) {
        await keep60fps();
        textNode.replaceWith(replaceNode);
    }
    contentRoot.normalize();
}

export default timed(powszechneBledy);

export const predicatePairs = Object.entries({
    'język Polski': matches(/język\S* Polski/),
    'w dniu dzisiejszym': matchesAny(/dni(a|u) dzisie/i, /dzień dzisie/i),
    'w miesiącu lipcu': contains('w miesiącu'),
    'w każdym bądź razie': contains('bądź razie'),
    'po wg nie powinno być kropki': contains('wg.'),
    'po mgr nie powinno być kropki': contains('mgr.'),
    'nie stosujemy formy v-prezes': (txt) => txt.match(/v-(\S*)/i),
    'np': contains('np:'),
    'najmniejsza linia oporu': matches(/najmniejsz(\S*) lini/i),
    'uznać jako': matches(/uzna(\S*) jako/),
    'Krótko': contains('Krótko')
});

/**
 * Checks fragment for issues and returns array of violation reasons (eg. ["najmniejsza linia", "uznać jako"])
 * @param {string} txt
 * @returns {string[]}
 */
function validateFragment(txt) {
    const matching = [];
    for(const [reason, predicate] of predicatePairs) {
        if(predicate(txt)) matching.push(reason);
    }
    return matching;
}

/**
 * Returns function that checks
 * @param searchedString
 * @returns {function(string): boolean}
 */
function contains(searchedString) {
    searchedString = String(searchedString);
    return (txt) => txt.includes(searchedString);
}

/**
 * Returns predicate checking if text matches regex
 * @param {RegExp} regex
 * @returns {function(string): boolean}
 */
function matches(regex) {
    return (txt) => regex.test(txt);
}

/**
 * Returns predicate checking if text matches any of regexes
 * @param {...RegExp} regexes
 * @returns {function(string) : boolean}
 */
function matchesAny(...regexes) {
    return (txt) => {
        for(const regex of regexes) {
            if (regex.test(txt)) return true;
        }
        return false;
    };
}