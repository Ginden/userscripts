export async function mapUserToColor(username: string): Promise<string> {
  const digest = await window.crypto.subtle.digest('SHA-1', new TextEncoder().encode(username));
  const firstTwoBytes = new Uint16Array(digest)[0];
  const percent = firstTwoBytes / (2 ** 16 - 1);
  const h = Math.round(Number(percent * 360));
  const s = 40;
  const l = 35;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export async function colorUsernames() {
  const users = Array.from(window.document.querySelectorAll<HTMLAnchorElement>('a.hnuser'));
  const userNames = new Set(users.map((u) => u.textContent).filter(Boolean) as string[]);
  const map = new Map<string, string>();
  for (const userName of userNames) {
    map.set(userName, await mapUserToColor(userName));
  }
  for (const user of users) {
    const userColor = map.get(user.textContent || '');
    if (userColor) {
      user.style.color = userColor;
    }
  }
}
