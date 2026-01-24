import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-oxc';

const config: StorybookConfig = {
  stories: [
    '../packages/ui/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../apps/**/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // React 19 + ESM + Tailwind CSS v4 호환성
    config.plugins = config.plugins || [];
    config.plugins.push(react());
    config.plugins.push(tailwindcss());
    return config;
  },
};

export default config;
