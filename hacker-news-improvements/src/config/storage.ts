import { getDefaultsFromConfig } from './helpers';
import { Config, SavedConfig } from './types';

export function getSavedConfig(config: Config): Promise<SavedConfig> {
  return GM.getValue(config.title).then((v) => (v ? JSON.parse(String(v)) : getDefaultsFromConfig(config)));
}

export function saveConfig(config: Config, value: SavedConfig): Promise<void> {
  return GM.setValue(config.title, JSON.stringify(value));
}
