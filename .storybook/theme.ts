import { create } from 'storybook/theming/create';

export default create({
  base: 'dark',

  // Typography
  fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode: '"JetBrains Mono", "Fira Code", monospace',

  // Branding
  brandTitle: 'SoundBlue UI',
  brandUrl: 'https://soundbluemusic.com',
  brandTarget: '_blank',

  // Colors - SoundBlue brand colors
  colorPrimary: '#007AFF',
  colorSecondary: '#5856D6',

  // UI
  appBg: '#0a0a0b',
  appContentBg: '#111113',
  appPreviewBg: '#111113',
  appBorderColor: '#27272a',
  appBorderRadius: 12,

  // Text colors
  textColor: '#fafafa',
  textInverseColor: '#0a0a0b',
  textMutedColor: '#71717a',

  // Toolbar
  barTextColor: '#a1a1aa',
  barHoverColor: '#007AFF',
  barSelectedColor: '#007AFF',
  barBg: '#18181b',

  // Form colors
  inputBg: '#18181b',
  inputBorder: '#27272a',
  inputTextColor: '#fafafa',
  inputBorderRadius: 8,

  // Button
  buttonBg: '#007AFF',
  buttonBorder: 'transparent',

  // Boolean toggle
  booleanBg: '#27272a',
  booleanSelectedBg: '#007AFF',
});
