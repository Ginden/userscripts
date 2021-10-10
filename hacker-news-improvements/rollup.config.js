// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import {string} from "rollup-plugin-string";
import subProcess from "child_process";
import fs from "fs";
import path from "path";
import pkg from "./package.json";
import nodeResolve from "@rollup/plugin-node-resolve";


const fileHash = subProcess.execSync('find src -type f | sort | xargs cat | sha256sum');
const licenseText = fs.readFileSync(path.join(__dirname, '../LICENSE'), 'utf8');
let banner = fs.readFileSync(path.join(__dirname, 'src/userscript-header.txt'), 'utf8')

banner = banner
    .replace('$VERSION$', pkg.version)
    .replace('$FILE_HASH', fileHash.slice(0, -4))
    .replace('$LICENSE', licenseText);


export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'iife',
        banner,
    },
    plugins: [
        string({
            include: 'src/*.css'
        }),
        typescript(),
        nodeResolve()
    ]
};
