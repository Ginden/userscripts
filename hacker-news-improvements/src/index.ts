// @ts-ignore
import './index.css';
import { colorUsernames } from "./colors";
import {
  addParagraphToFirstLineOfComment,
  collapseQuotes,
  markParagraphsWithQuotes,
  removeMarkdownQuotationCharacter
} from './quotes';
import { once } from './once';

const main = once(async function main() {
  addParagraphToFirstLineOfComment();
  markParagraphsWithQuotes();
  removeMarkdownQuotationCharacter();
  collapseQuotes();
  await colorUsernames();
});

if (document.readyState === 'complete') {
  console.log(`Manually running code`);
  void main();
} else {
  console.log(`Waiting for load event`);
  window.addEventListener('load', main);
}


