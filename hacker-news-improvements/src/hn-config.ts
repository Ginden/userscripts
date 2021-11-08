import { Config } from './config/types';
import { default as HackerNewsSavedConfigRaw } from './default-config.generated';

export const hackerNewsImprovementsConfig: Config = {
  title: 'Hacker news improvements',
  elements: [
    {
      type: 'boolean',
      id: 'quotes',
      title: 'Convert quotes',
      default: true,
    },
    {
      type: 'section',
      id: 'username-colors',
      title: 'Color usernames',
      elements: [
        {
          type: 'boolean',
          title: 'Enable',
          id: 'enabled',
          default: true,
        },
        {
          type: 'range',
          min: 0,
          max: 100,
          id: 'saturation',
          default: 40,
          step: 1,
          title: 'Saturation',
        },
        {
          type: 'range',
          min: 0,
          max: 100,
          id: 'lightness',
          title: 'Lightness',
          default: 35,
          step: 1,
        },
      ],
    },
  ],
};

export type HackerNewsSavedConfig = typeof HackerNewsSavedConfigRaw;
