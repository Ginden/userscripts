// @ts-ignore
import dialogPolyfill from 'dialog-polyfill';
import {
  Config,
  ConfigElement,
  ConfigSection,
  RadioConfigElement,
  RangeConfigElement,
  YesNoConfigElement,
  SavedConfig,
} from './types';
import { getSavedConfig, saveConfig } from './storage';
import { getDefaultsFromConfig, getIdFromPath, iterateOverConfig } from './helpers';

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
  const dialog = createElement('dialog');
  const form = createElement('form', { method: 'dialog' });
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
    // @ts-ignore
    dialog.showModal();
  }
}

export function extractDataFromDialogForm(form: HTMLFormElement): SavedConfig {
  const ret: SavedConfig = {};
  const radios = Array.from<HTMLInputElement>(form.querySelectorAll('input[type="radio"]:checked'));
  for (const radio of radios) {
    ret[radio.name] = radio.value;
  }
  for (const checkbox of Array.from(form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))) {
    ret[checkbox.name] = checkbox.checked;
  }
  for (const range of Array.from(form.querySelectorAll<HTMLInputElement>('input[type="range"]'))) {
    ret[range.name] = range.value;
  }
  return ret;
}

export function loadDataIntoDialogForm(config: Config, form: HTMLElement, data: SavedConfig): void {
  const defaults = getDefaultsFromConfig(config);
  for (const element of iterateOverConfig(config)) {
    const name = getIdFromPath(element.path);
    const currentConfigValue = data[name] || defaults[name];
    if (element.type === 'section') {
      continue;
    } else if (element.type === 'range') {
      const selector = `input[type=range][name="${name}"]`;
      const inputHtml = form.querySelector<HTMLInputElement>(selector);
      if (!inputHtml) {
        console.warn(`Missing input HTML`, { element, selector });
        continue;
      }
      inputHtml.value = String(currentConfigValue);
    } else if (element.type === 'radio') {
      const selector = `input[type=radio][name="${name}"]`;
      const inputHtml = form.querySelectorAll<HTMLInputElement>(selector);
      const elementToMarkAsChecked = Array.from(inputHtml).find((v) => v.value === currentConfigValue);
      if (!elementToMarkAsChecked) {
        console.warn(`Missing input HTML`, { element, selector });
        continue;
      }
      elementToMarkAsChecked.checked = true;
    } else if (element.type === 'boolean') {
      const selector = `input[type=checkbox][name="${name}"]`;
      const inputHtml = form.querySelector<HTMLInputElement>(selector);
      if (!inputHtml) {
        console.warn(`Missing input HTML`, { element, selector });
        continue;
      }
      inputHtml.checked = typeof currentConfigValue === 'boolean' ? currentConfigValue : false;
    }
  }
}

export async function registerConfig(config: Config): Promise<void> {
  const dialog = buildConfigPage(config);
  dialog.addEventListener('close', () => {
    return saveConfig(config, extractDataFromDialogForm(dialog.querySelector('form')!));
  });
  dialogMap.set(config.title, dialog);
  dialogPolyfill.registerDialog(dialog);
  document.body.append(dialog);
  GM.registerMenuCommand(`Open config: ${config.title}`, async () => {
    const savedConfig = await getSavedConfig(config);
    loadDataIntoDialogForm(config, dialog, savedConfig);
    showConfigPage(config);
  });
}
