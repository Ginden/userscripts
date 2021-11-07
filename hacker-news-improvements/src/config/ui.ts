import * as console from 'console';
import {
  Config,
  ConfigElement,
  ConfigSection,
  RadioConfigElement,
  RangeConfigElement,
  YesNoConfigElement,
} from './types';

declare function GM_registerMenuCommand(command: string, fn: () => void): void;

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

function createHtmlFromRadioConfig(definition: RadioConfigElement, path: string[]): Element {
  return createElement('nav');
}

function createHtmlFromBooleanConfig(definition: YesNoConfigElement, path: string[]): Element {
  return undefined;
}

function createHtmlFromSectionConfig(definition: ConfigSection, path: string[]): Element {
  return createElement(
    'fieldset',
    {},
    definition.elements.map((v) => createHtmlFromConfigElement(v, [...path, definition.id]))
  );
}

function createHtmlFromRangeElement(definition: RangeConfigElement, path: string[]): Element {
  return undefined;
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

function buildConfigPage(config: Config): HTMLElement {
  const form = document.createElement('form');
  form.append(createElement('legend', {}, ['Config']));
  for (const definition of config.elements) {
    form.append(createHtmlFromConfigElement(definition, []));
  }
  form.append(createElement('input', { type: 'submit' }, ['Save']));
  form.append(createElement('input', { type: 'reset' }, ['Reset & exit']));

  return form;
}

function showConfigPage(config: Config): void {
  const html = buildConfigPage(config);
  ((typeof unsafeWindow === 'undefined' ? window : unsafeWindow) as any).console?.log(html);
}

export function registerConfig(config: Config) {
  GM_registerMenuCommand(`Open config: ${config.title}`, () => {
    showConfigPage(config);
  });
}
