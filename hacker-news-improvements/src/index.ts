// @ts-ignore
import './index.css';

import '@types/greasemonkey';
import 'dialog-polyfill';
import { colorUsernames } from './features/colors';
import { getSavedConfig } from './config/storage';
import { trackKarma } from './features/track-karma/html';
import { hackerNewsImprovementsConfig, HackerNewsSavedConfig } from './hn-config';
import { registerConfig } from './config/ui';
import {
  addParagraphToFirstLineOfComment,
  collapseQuotes,
  markParagraphsWithQuotes,
  removeMarkdownQuotationCharacter,
} from './features/quotes';
import { once } from './utils/once';

registerConfig(hackerNewsImprovementsConfig).catch(console.error);

const main = once(async function main() {
  const config = (await getSavedConfig(hackerNewsImprovementsConfig)) as HackerNewsSavedConfig;
  console.log('Current config', config);
  if (config['quotes']) {
    addParagraphToFirstLineOfComment();
    markParagraphsWithQuotes();
    removeMarkdownQuotationCharacter();
    collapseQuotes();
  }
  if (config['username-colors.enabled']) {
    await colorUsernames(config);
  }
  if (config['karma-tracking']) {
    await trackKarma();
  }
});

window.addEventListener('load', main);
