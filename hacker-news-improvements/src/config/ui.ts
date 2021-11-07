import dialogPolyfill from 'dialog-polyfill';
import {
  Config,
  ConfigElement,
  ConfigSection,
  RadioConfigElement,
  RangeConfigElement,
  YesNoConfigElement,
} from './types';

declare function GM_registerMenuCommand(command: string, fn: () => void): void;

const dialogMap = new Map<string, HTMLDialogElement>();

function createElement<K extends keyof HTMLElementTagNameMap>(
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

function getIdFromPath(path: string[]): string {
  return path.join('.');
}

function createHtmlFromRadioConfig(definition: RadioConfigElement, path: string[]): Element {
  const id = getIdFromPath([...path, definition.id]);
  return createElement('div', {}, [
    createElement('label', { for: id }, [definition.title]),
    ...definition.options.map((v, i) => {
      return createElement('input', { type: 'radio', id: `${id}.${i}`, name: id });
    }),
  ]);
}

function createHtmlFromBooleanConfig(definition: YesNoConfigElement, path: string[]): Element {
  const id = getIdFromPath([...path, definition.id]);

  return createElement('div', {}, [
    createElement('label', { for: id }, [definition.title]),
    createElement('input', { type: 'checkbox', id, name: id }),
  ]);
}

function createHtmlFromSectionConfig(definition: ConfigSection, path: string[]): Element {
  return createElement('fieldset', {}, [
    createElement('legend', {}, [definition.title]),
    ...definition.elements.map((v) => createHtmlFromConfigElement(v, [...path, definition.id])),
  ]);
}

function createHtmlFromRangeElement(definition: RangeConfigElement, path: string[]): Element {
  const id = getIdFromPath([...path, definition.id]);

  return createElement('div', {}, [
    createElement('label', { for: id }, [definition.title]),
    createElement('input', {
      type: 'range',
      id,
      name: id,
      min: definition.min,
      max: definition.max,
      step: definition.step ?? 1,
    }),
  ]);
}

function createHtmlFromConfigElement(definition: ConfigElement, path: string[]): Element {
  switch (definition.type) {
    case 'radio':
      return createHtmlFromRadioConfig(definition, path);
    case 'boolean':
      return createHtmlFromBooleanConfig(definition, path);
    case 'section':
      return createHtmlFromSectionConfig(definition, path);
    case 'range':
      return createHtmlFromRangeElement(definition, path);
  }
}

function buildConfigPage(config: Config): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  const form = document.createElement('form');
  dialog.append(form);
  form.append(createElement('legend', {}, ['Config']));
  for (const definition of config.elements) {
    form.append(createHtmlFromConfigElement(definition, []));
  }
  form.append(createElement('input', { type: 'submit' }, ['Save']));
  form.append(createElement('input', { type: 'reset' }, ['Reset & exit']));

  return dialog;
}

function showConfigPage(config: Config): void {
  const dialog = dialogMap.get(config.title);
  if (dialog) {
    dialog.showModal();
  }
}

export function registerConfig(config: Config) {
  const dialog = buildConfigPage(config);
  dialogMap.set(config.title, dialog);
  dialogPolyfill.registerDialog(dialog);
  GM_registerMenuCommand(`Open config: ${config.title}`, () => {
    showConfigPage(config);
  });
}
