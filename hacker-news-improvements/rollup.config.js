// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import subProcess from "child_process";
import fs from "fs";
import path from "path";
import pkg from "./package.json";
import nodeResolve from "@rollup/plugin-node-resolve";
import postcss from 'rollup-plugin-postcss';

const url = require('postcss-url');


const fileHash = subProcess.execSync('find src -type f | sort | xargs cat | sha256sum');
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

const banner = fs.readFileSync(path.join(__dirname, 'src/userscript-header.txt'), 'utf8')
    .replace('$VERSION$', versionNumber)
    .replace('$FILE_HASH', fileHash.slice(0,-4))
    .replace('$LICENSE', licenseText);



export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'iife',
        banner,
    },
    plugins: [
        postcss({
            plugins: [
                url({
                    url: "inline", // enable inline assets using base64 encoding
                    maxSize: 10, // maximum file size to inline (in kilobytes)
                    encodeType: 'base64'
                }),
            ],
        }),
        /*      string({
                  include: 'src/*.css'
              }),*/
        typescript(),
        nodeResolve(),

    ]
};
