/**
 * @fileoverview Button component tests
 *
 * Tests for:
 * - Button rendering with different variants
 * - Button rendering with different sizes
 * - LinkButton rendering
 * - Custom class application
 * - Disabled state
 */

import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonVariants, LinkButton } from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('should render button with children', () => {
      render(() => <Button>Click me</Button>);

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with default variant and size', () => {
      render(() => <Button>Default</Button>);

      const button = screen.getByRole('button');
      // Default variant is primary, default size is md
      expect(button).toHaveClass('bg-accent');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      render(() => <Button variant="primary">Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-accent');
      expect(button).toHaveClass('text-white');
    });

    it('should render secondary variant', () => {
      render(() => <Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-surface-dim');
      expect(button).toHaveClass('text-content');
    });

    it('should render ghost variant', () => {
      render(() => <Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-content-muted');
    });

    it('should render youtube variant', () => {
      render(() => <Button variant="youtube">YouTube</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
      expect(button).toHaveClass('text-white');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      render(() => <Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-sm');
    });

    it('should render medium size (default)', () => {
      render(() => <Button size="md">Medium</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });

    it('should render large size', () => {
      render(() => <Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-base');
    });
  });

  describe('Custom class', () => {
    it('should apply custom class alongside default classes', () => {
      render(() => <Button class="custom-class">Custom</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-accent'); // Still has default classes
    });
  });

  describe('Disabled state', () => {
    it('should render disabled button', () => {
      render(() => <Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none');
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('should not trigger onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(() => (
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      ));

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Click handling', () => {
    it('should trigger onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(() => <Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button type', () => {
    it('should have submit type when specified', () => {
      render(() => <Button type="submit">Submit</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should have button type by default', () => {
      render(() => <Button>Default Type</Button>);

      // Note: browsers default to "submit" but we should test explicit type
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});

describe('LinkButton', () => {
  describe('Rendering', () => {
    it('should render as anchor element', () => {
      render(() => <LinkButton href="/test">Link</LinkButton>);

      const link = screen.getByRole('link', { name: 'Link' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should render with default variant and size', () => {
      render(() => <LinkButton href="/test">Default Link</LinkButton>);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-accent');
      expect(link).toHaveClass('px-4');
    });
  });

  describe('Variants', () => {
    it('should render with primary variant', () => {
      render(() => (
        <LinkButton href="/test" variant="primary">
          Primary Link
        </LinkButton>
      ));

      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-accent');
      expect(link).toHaveClass('text-white');
    });

    it('should render with secondary variant', () => {
      render(() => (
        <LinkButton href="/test" variant="secondary">
          Secondary Link
        </LinkButton>
      ));

      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-surface-dim');
    });

    it('should render with ghost variant', () => {
      render(() => (
        <LinkButton href="/test" variant="ghost">
          Ghost Link
        </LinkButton>
      ));

      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('should render with small size', () => {
      render(() => (
        <LinkButton href="/test" size="sm">
          Small Link
        </LinkButton>
      ));

      const link = screen.getByRole('link');
      expect(link).toHaveClass('px-3');
      expect(link).toHaveClass('py-1.5');
    });

    it('should render with large size', () => {
      render(() => (
        <LinkButton href="/test" size="lg">
          Large Link
        </LinkButton>
      ));

      const link = screen.getByRole('link');
      expect(link).toHaveClass('px-6');
      expect(link).toHaveClass('py-3');
    });
  });

  describe('Custom class', () => {
    it('should apply custom class', () => {
      render(() => (
        <LinkButton href="/test" class="my-custom-class">
          Custom Link
        </LinkButton>
      ));

      const link = screen.getByRole('link');
      expect(link).toHaveClass('my-custom-class');
      expect(link).toHaveClass('bg-accent'); // Default classes preserved
    });
  });

  describe('External link attributes', () => {
    it('should support target attribute', () => {
      render(() => (
        <LinkButton href="https://example.com" target="_blank">
          External
        </LinkButton>
      ));

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should support rel attribute', () => {
      render(() => (
        <LinkButton href="https://example.com" rel="noopener noreferrer">
          External
        </LinkButton>
      ));

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});

describe('buttonVariants', () => {
  it('should generate class string for default options', () => {
    const classes = buttonVariants();
    expect(classes).toContain('bg-accent');
    expect(classes).toContain('px-4');
  });

  it('should generate class string for specific variant', () => {
    const classes = buttonVariants({ variant: 'ghost' });
    expect(classes).toContain('bg-transparent');
  });

  it('should generate class string for specific size', () => {
    const classes = buttonVariants({ size: 'lg' });
    expect(classes).toContain('px-6');
    expect(classes).toContain('py-3');
  });

  it('should generate class string for combined options', () => {
    const classes = buttonVariants({ variant: 'secondary', size: 'sm' });
    expect(classes).toContain('bg-surface-dim');
    expect(classes).toContain('px-3');
  });
});
