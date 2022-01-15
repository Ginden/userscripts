export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props: Record<string, string | number | boolean> = {},
  children: (string | Node)[] = []
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  for (const [key, value] of Object.entries(props)) {
    element.setAttribute(key, String(value));
  }
  element.append(...children);
  return element;
}

(async () => {
  const header = document.querySelector<HTMLDivElement>('#repository-container-header');
  if (!header) {
    return;
  }
  if (!header.textContent?.includes(`forked from`)) {
    return;
  }
  const currentRepositoryAuthor = header.querySelector('h1 [rel="author"]')?.textContent?.trim();
  if (!currentRepositoryAuthor) {
    console.warn(`Repository author empty, it shouldn't happen`);
    return;
  }
  const currentRepositoryName = header.querySelector(`h1 [itemprop="name"] a`)?.textContent?.trim();
  if (!currentRepositoryName) {
    console.warn(`Repository name empty, it shouldn't happen`);
  }
  const repoParentPath = (() => {
    header.normalize();
    const nodeIterator = document.createNodeIterator(header, NodeFilter.SHOW_TEXT);
    do {
      const nextNode: Text | null = nodeIterator.nextNode() as any;
      if (!nextNode) {
        return null;
      }
      if (!nextNode.textContent?.includes('forked from')) {
        continue;
      }
      const parent = nextNode.parentNode;
      if (!parent) {
        return null;
      }
      return parent.querySelector('a')?.textContent?.trim() ?? null;
    } while (true);
  })();
  if (!repoParentPath) {
    console.warn(`Fork name empty, it shouldn't happen`);
    return;
  }

  const repoPath = `${currentRepositoryAuthor}/${currentRepositoryName}`;
  const commandString = `
    git clone git@github.com:${repoPath}.git &&
    cd ${currentRepositoryName} &&
    git remote add upstream git@github.com:${repoParentPath}.git &&
    git fetch upstream
  `
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');

  const sidebar = document.querySelector('#repo-content-pjax-container .Layout-sidebar .BorderGrid');
  if (!sidebar) {
    console.warn(`Sidebar not detected`);
    return;
  }

  const element = createElement('div', { class: 'BorederGrid-Row' }, [
    createElement('div', { class: 'Border-Grid-cell' }, [
      createElement('h2', {}, ['Clone fork']),
      createElement(
        'div',
        { style: 'font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace' },
        [commandString]
      ),
    ]),
  ]);

  sidebar.prepend(element);

  console.log(commandString);
})().catch(console.error);
