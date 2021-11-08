import { Config, ConfigElement, SavedConfig } from './types';

export function* iterateOverConfig(
  config: { elements: ConfigElement[] },
  path: string[] = []
): Iterable<ConfigElement & { path: string[] }> {
  for (const element of config.elements) {
    if (element.type === 'section') {
      yield* iterateOverConfig(element, [...path, element.id]);
    } else {
      yield Object.assign(element, { path: [...path, element.id] });
    }
  }
}

export function getDefaultsFromConfig(config: Config): SavedConfig {
  const ret: SavedConfig = {};
  for (const element of iterateOverConfig(config)) {
    const id = getIdFromPath(element.path);
    if (element.default !== undefined) ret[id] = element.default;
  }
  return ret;
}

export function getIdFromPath(path: string[]): string {
  return path.join('.');
}
