import string from 'rollup-plugin-string';
import esformatter from 'rollup-plugin-esformatter'
import fs from 'fs';
import path from 'path';
import subProcess from 'child_process';
const pkg = require('./package.json');


const fileHash = subProcess.execSync('find lib -type f | sort | xargs cat | sha256sum');
const licenseText = fs.readFileSync(path.join(__dirname, '../LICENSE'), 'utf8');
const banner = fs.readFileSync(path.join(__dirname, 'lib/userscript-header.txt'), 'utf8')
    .replace('$VERSION$', pkg.version)
    .replace('$FILE_HASH', fileHash.slice(0,-4))
    .replace('$LICENSE', licenseText);

export default {
    input: 'lib/index.mjs',
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
