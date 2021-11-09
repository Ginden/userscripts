import { getDate } from '../../utils/get-date';

export const maxEntries = 30;

export type DateKarmaStore = [string, number][];

export async function saveKarma(karma: number, date = getDate()): Promise<void> {
  const currentKarmaStore = await getKarmaHistory();
  const valueToUpdate = currentKarmaStore.find(([historicalDate, value]) => historicalDate === date);
  if (valueToUpdate) {
    valueToUpdate[1] = karma;
  } else {
    currentKarmaStore.push([date, karma]);
  }
  while (currentKarmaStore.length > maxEntries) {
    currentKarmaStore.shift();
  }
  await GM.setValue('karma-store', JSON.stringify(currentKarmaStore));
}

export function getKarmaHistory(): Promise<DateKarmaStore> {
  return GM.getValue('karma-store')
    .then(String)
    .then(JSON.parse)
    .catch(() => null)
    .then((v) => (Array.isArray(v) ? v : []));
}
