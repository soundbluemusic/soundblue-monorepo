/**
 * @soundblue/ui-components - Button Tests
 * Tests for Button component
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonVariants, LinkButton } from '../src/base/components/Button';

describe('Button component', () => {
  describe('rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with default type="button"', () => {
      render(<Button>Test</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should render with custom type', () => {
      render(<Button type="submit">Submit</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should forward ref', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Test</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('variants', () => {
    it('should apply default variant', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('bg-primary');
    });

    it('should apply destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('bg-destructive');
    });

    it('should apply outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('border');
    });

    it('should apply secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('bg-secondary');
    });

    it('should apply ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('bg-transparent');
    });

    it('should apply link variant', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('underline-offset');
    });

    it('should apply glass variant', () => {
      render(<Button variant="glass">Glass</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('backdrop-blur');
    });

    it('should apply youtube variant', () => {
      render(<Button variant="youtube">YouTube</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('bg-[#dc2626]');
    });
  });

  describe('sizes', () => {
    it('should apply default size', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('h-11');
    });

    it('should apply sm size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('h-9');
    });

    it('should apply lg size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('h-12');
    });

    it('should apply xl size', () => {
      render(<Button size="xl">Extra Large</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('h-14');
    });

    it('should apply icon size', () => {
      render(<Button size="icon">🔔</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('h-10');
      expect(button.className).toContain('w-10');
    });

    it('should apply icon-sm size', () => {
      render(<Button size="icon-sm">🔔</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('h-8');
      expect(button.className).toContain('w-8');
    });

    it('should apply icon-lg size', () => {
      render(<Button size="icon-lg">🔔</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('h-12');
      expect(button.className).toContain('w-12');
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have disabled styles when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button.className).toContain('disabled:opacity-50');
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');

      expect(button.className).toContain('custom-class');
      // Should still have base styles
      expect(button.className).toContain('inline-flex');
    });
  });

  describe('accessibility', () => {
    it('should have accessible name', () => {
      render(<Button aria-label="Close dialog">X</Button>);

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('should support aria-pressed for toggle buttons', () => {
      render(<Button aria-pressed="true">Toggle</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });
  });
});

describe('LinkButton component', () => {
  it('should render as anchor element', () => {
    render(<LinkButton href="/test">Link</LinkButton>);

    expect(screen.getByRole('link', { name: 'Link' })).toBeInTheDocument();
  });

  it('should have href attribute', () => {
    render(<LinkButton href="/test">Link</LinkButton>);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
  });

  it('should apply button styles', () => {
    render(<LinkButton href="/test">Link</LinkButton>);
    const link = screen.getByRole('link');

    expect(link.className).toContain('inline-flex');
    expect(link.className).toContain('bg-primary');
  });

  it('should apply variant', () => {
    render(
      <LinkButton href="/test" variant="secondary">
        Link
      </LinkButton>,
    );
    const link = screen.getByRole('link');

    expect(link.className).toContain('bg-secondary');
  });

  it('should apply size', () => {
    render(
      <LinkButton href="/test" size="lg">
        Link
      </LinkButton>,
    );
    const link = screen.getByRole('link');

    expect(link.className).toContain('h-12');
  });

  it('should forward ref', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <LinkButton href="/test" ref={ref}>
        Link
      </LinkButton>,
    );

    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('should support target attribute', () => {
    render(
      <LinkButton href="/test" target="_blank">
        External
      </LinkButton>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });
});

describe('buttonVariants', () => {
  it('should export buttonVariants function', () => {
    expect(typeof buttonVariants).toBe('function');
  });

  it('should generate class string', () => {
    const classes = buttonVariants({ variant: 'default', size: 'default' });

    expect(typeof classes).toBe('string');
    expect(classes).toContain('inline-flex');
  });
});
