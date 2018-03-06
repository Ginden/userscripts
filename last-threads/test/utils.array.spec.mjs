import chai from 'chai';
const {expect} = chai;

import {
    test
} from './test-runner';

import {
    flatten
} from '../lib/utils/array';

test('flatten simple', () => {
    const tested = [[1], 2, [3]];
    const expected = [1,2,3];
    const flattened = flatten(tested);
    expect(flattened).to.deep.equal(expected);
});

test('flatten deep nested', () => {
    const tested = [[[1]], 2, [3, [[[[[[4]]]]]]]];
    const expected = [1,2,3, 4];
    const flattened = flatten(tested);
    expect(flattened).to.deep.equal(expected);
});

