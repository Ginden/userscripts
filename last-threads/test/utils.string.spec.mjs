import chai from 'chai';
const {expect} = chai;

import {
    test
} from './test-runner';

import {
    isEmptyString
} from '../lib/utils/string.mjs';

const isEmptyStringTestCases = [
    ['', true],
    [' ', true],
    ['\n', true],
    ['chrząszcz brzmi', false],
    [' foo \n bar \n \t \n', false]
];

for(const [str, expected] of isEmptyStringTestCases) {
    test(`isEmptyString(${JSON.stringify(str)})`, () => expect(isEmptyString(str)).to.equal(expected));
}
