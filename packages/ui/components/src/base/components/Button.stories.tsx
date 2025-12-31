import type { Meta, StoryObj } from '@storybook/react';
import { Button, LinkButton } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Base/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
        'glass',
        'youtube',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Default Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: 'Glass Button',
  },
  decorators: [
    (Story) => (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export const Youtube: Story = {
  args: {
    variant: 'youtube',
    children: 'Subscribe',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: 'Extra Large',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '\u2605',
  },
};

export const IconSmall: Story = {
  args: {
    size: 'icon-sm',
    children: '\u2605',
  },
};

export const IconLarge: Story = {
  args: {
    size: 'icon-lg',
    children: '\u2605',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

// LinkButton Stories
export const AsLink: StoryObj<typeof LinkButton> = {
  render: (args) => <LinkButton {...args} />,
  args: {
    href: 'https://example.com',
    variant: 'default',
    children: 'Link as Button',
  },
};

export const YoutubeLink: StoryObj<typeof LinkButton> = {
  render: (args) => <LinkButton {...args} />,
  args: {
    href: 'https://youtube.com',
    variant: 'youtube',
    children: 'Watch on YouTube',
  },
};
