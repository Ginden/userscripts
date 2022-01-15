import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import path from 'path';
import subProcess from 'child_process';
const pkg = require('./package.json');


const fileHash = subProcess.execSync('find lib -type f | sort | xargs cat | sha256sum');
const licenseText = fs.readFileSync(path.join(__dirname, '../LICENSE'), 'utf8');

const now = new Date();
const startOfYear = new Date(now.getFullYear(), 0, 0);
const diff = (now - startOfYear) + ((startOfYear.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
const oneDay = 1000 * 60 * 60 * 24;
const dayOfYear = Math.floor(diff / oneDay);
const majorVersionNumber = now.getFullYear().toString().slice(2);
const minorVersionNumber = dayOfYear;
const patchVersion = `${now.getHours()}${now.getMinutes().toString().padStart(2, '0')}`;
const versionNumber = `${majorVersionNumber}.${minorVersionNumber}.${patchVersion}`;

const banner = fs.readFileSync(path.join(__dirname, 'lib/userscript-header.txt'), 'utf8')
    .replace('$VERSION$', versionNumber)
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
    plugins: [
        typescript(),
    ],
};

export default [
    defaultConfig
]
