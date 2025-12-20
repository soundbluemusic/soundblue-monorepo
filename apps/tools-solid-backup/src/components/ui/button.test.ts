import { describe, expect, it } from 'vitest';
import { buttonVariants } from './button';

describe('buttonVariants', () => {
  describe('default variants', () => {
    it('should return default styles without arguments', () => {
      const classes = buttonVariants();
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('justify-center');
      expect(classes).toContain('rounded-xl');
    });

    it('should apply default variant and size', () => {
      const classes = buttonVariants();
      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-primary-foreground');
      expect(classes).toContain('h-11');
      expect(classes).toContain('px-6');
    });
  });

  describe('variant styles', () => {
    it('should apply default variant styles', () => {
      const classes = buttonVariants({ variant: 'default' });
      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-primary-foreground');
    });

    it('should apply destructive variant styles', () => {
      const classes = buttonVariants({ variant: 'destructive' });
      expect(classes).toContain('bg-destructive');
      expect(classes).toContain('text-destructive-foreground');
    });

    it('should apply outline variant styles', () => {
      const classes = buttonVariants({ variant: 'outline' });
      expect(classes).toContain('border');
      expect(classes).toContain('bg-transparent');
    });

    it('should apply secondary variant styles', () => {
      const classes = buttonVariants({ variant: 'secondary' });
      expect(classes).toContain('bg-secondary');
      expect(classes).toContain('text-secondary-foreground');
    });

    it('should apply ghost variant styles', () => {
      const classes = buttonVariants({ variant: 'ghost' });
      expect(classes).toContain('text-foreground');
      expect(classes).toContain('hover:bg-secondary/80');
    });

    it('should apply link variant styles', () => {
      const classes = buttonVariants({ variant: 'link' });
      expect(classes).toContain('text-primary');
      expect(classes).toContain('underline-offset-4');
    });

    it('should apply glass variant styles', () => {
      const classes = buttonVariants({ variant: 'glass' });
      expect(classes).toContain('backdrop-blur-xl');
      expect(classes).toContain('border-white/20');
    });
  });

  describe('size styles', () => {
    it('should apply default size', () => {
      const classes = buttonVariants({ size: 'default' });
      expect(classes).toContain('h-11');
      expect(classes).toContain('px-6');
    });

    it('should apply small size', () => {
      const classes = buttonVariants({ size: 'sm' });
      expect(classes).toContain('h-9');
      expect(classes).toContain('px-4');
      expect(classes).toContain('text-xs');
    });

    it('should apply large size', () => {
      const classes = buttonVariants({ size: 'lg' });
      expect(classes).toContain('h-12');
      expect(classes).toContain('px-8');
    });

    it('should apply xl size', () => {
      const classes = buttonVariants({ size: 'xl' });
      expect(classes).toContain('h-14');
      expect(classes).toContain('px-10');
    });

    it('should apply icon size', () => {
      const classes = buttonVariants({ size: 'icon' });
      expect(classes).toContain('h-10');
      expect(classes).toContain('w-10');
    });

    it('should apply icon-sm size', () => {
      const classes = buttonVariants({ size: 'icon-sm' });
      expect(classes).toContain('h-8');
      expect(classes).toContain('w-8');
    });

    it('should apply icon-lg size', () => {
      const classes = buttonVariants({ size: 'icon-lg' });
      expect(classes).toContain('h-12');
      expect(classes).toContain('w-12');
    });
  });

  describe('combined variants', () => {
    it('should combine variant and size correctly', () => {
      const classes = buttonVariants({ variant: 'destructive', size: 'lg' });
      expect(classes).toContain('bg-destructive');
      expect(classes).toContain('h-12');
    });

    it('should allow custom className override', () => {
      const classes = buttonVariants({ className: 'custom-class' });
      expect(classes).toContain('custom-class');
    });
  });

  describe('base styles', () => {
    it('should include focus styles', () => {
      const classes = buttonVariants();
      expect(classes).toContain('focus-visible:outline-none');
      expect(classes).toContain('focus-visible:ring-2');
    });

    it('should include disabled styles', () => {
      const classes = buttonVariants();
      expect(classes).toContain('disabled:pointer-events-none');
      expect(classes).toContain('disabled:opacity-50');
    });

    it('should include active press effect', () => {
      const classes = buttonVariants();
      expect(classes).toContain('active:scale-[0.98]');
    });

    it('should include transition styles', () => {
      const classes = buttonVariants();
      expect(classes).toContain('transition-all');
      expect(classes).toContain('duration-200');
    });
  });
});
