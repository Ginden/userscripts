export interface BaseConfigElement {
  type: string;
  id: string;
  title: string;
  default?: unknown;
}

export interface YesNoConfigElement extends BaseConfigElement {
  type: 'boolean';
  default: boolean;
}

export interface RangeConfigElement extends BaseConfigElement {
  type: 'range';
  min: number;
  max: number;
  step?: number;
  default: number;
}

export interface RadioConfigElement extends BaseConfigElement {
  type: 'radio';
  options: {
    name: string;
    value: string;
  }[];
  default: string;
}

export interface ConfigSection extends BaseConfigElement {
  type: 'section';
  title: string;
  id: string;
  elements: ConfigElement[];
}

export type ConfigElement = YesNoConfigElement | RangeConfigElement | ConfigSection | RadioConfigElement;

export type Config = {
  title: string;
  elements: ConfigElement[];
};
