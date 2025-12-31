import type { Preview } from '@storybook/react';
import '../apps/tools/app/app.css';
import theme from './theme';

const preview: Preview = {
  parameters: {
    docs: {
      theme,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#111113' },
        { name: 'light', value: '#fafafa' },
        { name: 'brand', value: '#007AFF' },
      ],
    },
    layout: 'centered',
  },
};

export default preview;
