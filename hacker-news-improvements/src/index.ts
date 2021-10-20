// @ts-ignore
import style from './index.css';
import { colorUsernames } from "./colors";
import { once } from "lodash-es";
import {
  addParagraphToFirstLineOfComment,
  collapseQuotes,
  markParagraphsWithQuotes,
  removeMarkdownQuotationCharacter
} from './quotes';

function addStylesheet(): void {
  const styleElement = document.createElement('style');
  styleElement.textContent = style;
  document.head.appendChild(styleElement);
}



const main = once(async function main() {
  addStylesheet();
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


