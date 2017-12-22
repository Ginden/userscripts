
/**
 * Split text to word and whitespace fragments.
 * Eg. "foo   bar" becomes ["foo", "   ", "bar"]
 * @param {string} text
 * @returns {Array.<string>}
 */
export function lexSentence(text) {
    const words = [];
    let lastSubSequence = [];
    let isWhiteSpaceMode = false;
    for(const char of text) {
        const wsChar = isWhitespaceChar(char);
        if(wsChar !== isWhiteSpaceMode) {
            words.push(lastSubSequence.join(''));
            lastSubSequence = [];
        }
        isWhiteSpaceMode = wsChar;
        lastSubSequence.push(char);
    }
    words.push(lastSubSequence.join(''));
    return words;
}

/**
 * Checks if character is a whitespace.
 * @param {string} char
 * @returns {boolean}
 */
export function isWhitespaceChar(char) {
    return char === '\n' || char === ' ' || char === '\t' || char === '\r';
}

export function isEmptyString(str) {
    return str.trim() === '';
}