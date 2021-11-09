import { createElement } from '../../utils/create-element';
import { findLast } from '../../utils/find-last';
import { getDate } from '../../utils/get-date';
import { getKarmaHistory, saveKarma } from './storage';

export function extractKarmaFromWebsite(): number {
  const a = document.querySelector<HTMLAnchorElement>('a#me');
  if (!a) {
    return 0;
  }
  const textContent = (a.parentElement?.textContent ?? '').trim();
  const match = textContent.match(/.*\((\d*)\).*/gm);
  if (match && parseInt(match[1])) {
    return parseInt(match[1]);
  }
  return 0;
}

export function buildChangeElement(change: number, since: string): Node {
  const fragment = document.createDocumentFragment();
  const textNode = document.createTextNode(' | ');
  const changeElement = createElement('span', { class: 'karma-change' });
  fragment.append(changeElement);
  if (change > 0) {
    changeElement.classList.add('positive');
    changeElement.append(createElement('span', { class: 'icon' }, ['⬆']), document.createTextNode(`${change}`));
  } else if (change === 0) {
    changeElement.classList.add('neutral');
    changeElement.append(createElement('span', { class: 'icon' }, ['~']), document.createTextNode('0'));
  } else if (change < 0) {
    changeElement.classList.add('negative');
    changeElement.append(createElement('span', { class: 'icon' }, ['⬇']), document.createTextNode(`${change}`));
  }
  changeElement.title = `Since ${since}`;
  fragment.append(textNode);
  return fragment;
}

export async function trackKarma(): Promise<void> {
  const currentKarma = extractKarmaFromWebsite();
  await saveKarma(currentKarma);
  const currentDate = getDate();
  const karmaHistory = await getKarmaHistory();
  const previousDayVisitKarma = findLast(karmaHistory, ([date]) => date !== currentDate) || [currentDate, currentKarma];
  const [sinceDate, historicalKarma] = previousDayVisitKarma;
  const change = currentKarma - historicalKarma;
  const logoutElement = document.querySelector<HTMLAnchorElement>('a#logout');
  if (!logoutElement) {
    console.warn('No logout element found');
    return;
  }
  const changeElement = buildChangeElement(change, sinceDate);
  logoutElement.parentElement?.insertBefore(changeElement, logoutElement);
}
