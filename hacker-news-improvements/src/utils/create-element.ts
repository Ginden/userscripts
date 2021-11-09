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
