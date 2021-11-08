#!/usr/bin/env bash

(cd hacker-news-improvements && npm ci && npm run build);

cp ./hacker-news-improvements/dist/index.js docs/hacker-news-improvements.user.js;
