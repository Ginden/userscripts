import string from 'rollup-plugin-string';
import esformatter from 'rollup-plugin-esformatter'
import fs from 'fs';
import path from 'path';
const pkg = require('./package.json');

const banner = fs.readFileSync(path.join(__dirname, 'lib/userscript-header.txt'), 'utf8')
    .replace('$VERSION$', pkg.version);

export default {
    input: 'lib/index.js',
    output: {
        format: 'iife',
        file: 'dist/index.js',
        interop: false,
        banner
    },
    plugins: [
        string({
            include: '**/*.css',
        }),
        esformatter({
            indent: {
                value: '  ',
            },
        })
    ]
};
