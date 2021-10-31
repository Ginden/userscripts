#!/usr/bin/env node

const {join, dirname} = require('path');
const ini = require('ini');
const {readFileSync, mkdirSync, copyFileSync, unlinkSync} = require("fs");

const firefoxDir = join(process.env.HOME, '.mozilla', 'firefox');
const configPath = join(firefoxDir, 'profiles.ini');
const parsedIniFile = ini.parse(readFileSync(configPath, 'utf8'));

const profile = Object.values(parsedIniFile).find((v) => v.Name === 'default');
if (!profile) {
    throw new Error(`No default profile found`);
}
const buildPath = join(__dirname, 'dist', 'userChrome.css');
const outputPath = join(firefoxDir, profile.Path, 'chrome', 'userChrome.css');
try {
    unlinkSync(outputPath);
} catch (e) {
    console.warn(`Warn: `, e);
}
mkdirSync(join(dirname(outputPath)), {
    recursive: true,
});
copyFileSync(buildPath, outputPath);
console.log(readFileSync(outputPath, 'utf8'));
console.log(`Copied file ${buildPath} to ${outputPath}`);
