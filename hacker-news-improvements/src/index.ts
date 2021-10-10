// @ts-ignore
import style from './index.css';
import { once } from "lodash-es";

function addStylesheet(): void {
  const styleElement = document.createElement('style');
  styleElement.textContent = style;
  document.head.appendChild(styleElement);
}

function addParagraphToFirstLineOfComment(): void {
  for (const comment of Array.from(window.document.querySelectorAll('.comment > .commtext'))) {
    const children: Node[] = [];
    for (const child of Array.from(comment.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName === 'P') {
        break;
      }
      children.push(child);
    }
    const p = document.createElement('p');
    p.append(...children);
    comment.prepend(p);
  }
}

function markParagraphsWithQuotes(): void {
  Array.from(window.document.querySelectorAll('.comtr p')).forEach(p => {
    if (p.textContent?.trim().startsWith('>')) {
      p.classList.add('quote');
    }
  });
}

const main = once(function main() {
  addStylesheet();
  addParagraphToFirstLineOfComment();
  markParagraphsWithQuotes();
});

console.log("foo");

if (document.readyState === 'complete') {
  console.log(`Manually running code`);
  main();
} else {
  console.log(`Waiting for load event`);
  window.addEventListener('load', main);
}


