import { HackerNewsSavedConfig } from '../hn-config';

export async function mapUserToColor(username: string, config: HackerNewsSavedConfig): Promise<string> {
  const digest = await window.crypto.subtle.digest('SHA-1', new TextEncoder().encode(username));
  const firstTwoBytes = new Uint16Array(digest)[0];
  const percent = firstTwoBytes / (2 ** 16 - 1);
  const h = Math.round(Number(percent * 360));
  const s = config['username-colors.saturation'];
  const l = config['username-colors.lightness'];
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export async function colorUsernames(config: HackerNewsSavedConfig) {
  const users = Array.from(window.document.querySelectorAll<HTMLAnchorElement>('a.hnuser'));
  const userNames = new Set(users.map((u) => u.textContent).filter(Boolean) as string[]);
  const map = new Map<string, string>(
    await Promise.all([...userNames].map((userName) => Promise.all([userName, mapUserToColor(userName, config)])))
  );
  for (const user of users) {
    const userColor = map.get(user.textContent || '');
    if (userColor) {
      user.style.color = userColor;
    }
  }
}
