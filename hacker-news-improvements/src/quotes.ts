export function addParagraphToFirstLineOfComment(): void {
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

export function markParagraphsWithQuotes(): void {
  Array.from(window.document.querySelectorAll('.comtr p')).forEach((p) => {
    if (p.textContent?.trim().startsWith('>')) {
      p.classList.add('quote');
    }
  });
}

export function collapseQuotes(): void {
  const quotes = Array.from(window.document.querySelectorAll<HTMLParagraphElement>('p.quote')).reverse();
  for (const quote of quotes) {
    if (quote.previousElementSibling?.classList.contains('quote')) {
      const prev = quote.previousElementSibling!;
      prev.appendChild(window.document.createElement('br'));
      prev.append(...Array.from(quote.childNodes));
      quote.parentElement?.removeChild(quote);
    }
  }
}

export function removeMarkdownQuotationCharacter() {
  const quotes = Array.from(window.document.querySelectorAll<HTMLParagraphElement>('p.quote'));
  for (const quote of quotes) {
    const firstChild = quote.firstChild;
    if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) {
      continue;
    }
    const currTextContent = firstChild.textContent || '';
    firstChild.textContent = (firstChild.textContent || '').slice(currTextContent.indexOf('>') + 1).trim();
  }
}
