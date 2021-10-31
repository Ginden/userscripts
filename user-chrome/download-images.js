#!/usr/bin/env node

const {execFile} = require("child_process");
const {join} = require('path');

const images = {
    'screenshot.svg': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Antu_folder-camera.svg',
};

for (const [fileName, path] of Object.entries(images)) {
    const outputPath = join(__dirname, 'assets', fileName);
    execFile('wget', [path, '-O', outputPath])
}
