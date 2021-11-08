// @ts-ignore
import './index.css';

import '@types/greasemonkey';
import 'dialog-polyfill';
import { colorUsernames } from './colors';
import { getSavedConfig } from './config/storage';
import { hackerNewsImprovementsConfig, HackerNewsSavedConfig } from "./hn-config";
import { registerConfig } from './config/ui';
import {
  addParagraphToFirstLineOfComment,
  collapseQuotes,
  markParagraphsWithQuotes,
  removeMarkdownQuotationCharacter,
} from './quotes';
import { once } from './once';

registerConfig(hackerNewsImprovementsConfig);

const main = once(async function main() {
  const config = await getSavedConfig(hackerNewsImprovementsConfig) as HackerNewsSavedConfig;
  if (config['quotes']) {
    addParagraphToFirstLineOfComment();
    markParagraphsWithQuotes();
    removeMarkdownQuotationCharacter();
    collapseQuotes();
  }
  if (config['username-colors.enabled']) {
    await colorUsernames(config);
  }
});

if (document.readyState === 'complete') {
  console.log(`Manually running code`);
  void main();
} else {
  console.log(`Waiting for load event`);
  window.addEventListener('load', main);
}
