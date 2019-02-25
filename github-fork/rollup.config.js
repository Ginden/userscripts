import typescript from 'rollup-plugin-typescript2'
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


const defaultConfig = {
    input: 'lib/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'iife',
            banner
        }
    ],
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],

    plugins: [
        typescript({
            typescript: require('typescript'),
        })
    ],
};

export default [
    defaultConfig
]