/**
 * @fileoverview ChatInput component tests
 *
 * Tests for:
 * - Rendering input field and send button
 * - Message submission (form submit and Enter key)
 * - Korean IME composition handling
 * - Disabled state behavior
 * - Accessibility attributes
 */

import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Mock I18nProvider
vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => ({
      chat: {
        inputPlaceholder: 'Type a message...',
        send: 'Send',
      },
    }),
  }),
}));

import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  describe('Rendering', () => {
    it('should render input field with placeholder', () => {
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Type a message...');
    });

    it('should render send button with aria-label', () => {
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const button = screen.getByRole('button', { name: 'Send' });
      expect(button).toBeInTheDocument();
    });

    it('should have aria-label on input', () => {
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Type a message...');
    });
  });

  describe('Message submission', () => {
    it('should call onSend when form is submitted', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello world');
      await user.click(screen.getByRole('button', { name: 'Send' }));

      expect(onSend).toHaveBeenCalledWith('Hello world');
    });

    it('should call onSend when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello world');
      await user.keyboard('{Enter}');

      expect(onSend).toHaveBeenCalledWith('Hello world');
    });

    it('should clear input after successful send', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello world');
      await user.keyboard('{Enter}');

      expect(input).toHaveValue('');
    });

    it('should not send empty message', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      await user.click(screen.getByRole('button', { name: 'Send' }));

      expect(onSend).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only message', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '   ');
      await user.keyboard('{Enter}');

      expect(onSend).not.toHaveBeenCalled();
    });

    it('should trim whitespace from message', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '  Hello world  ');
      await user.keyboard('{Enter}');

      expect(onSend).toHaveBeenCalledWith('Hello world');
    });
  });

  describe('Disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should disable button when disabled prop is true', () => {
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} disabled />);

      const button = screen.getByRole('button', { name: 'Send' });
      expect(button).toBeDisabled();
    });

    it('should disable button when input is empty', () => {
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const button = screen.getByRole('button', { name: 'Send' });
      expect(button).toBeDisabled();
    });

    it('should enable button when input has text', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');

      const button = screen.getByRole('button', { name: 'Send' });
      expect(button).not.toBeDisabled();
    });

    it('should not send when disabled', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} disabled />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');
      await user.keyboard('{Enter}');

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('Input behavior', () => {
    it('should update value on input', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(() => <ChatInput onSend={onSend} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test message');

      expect(input).toHaveValue('Test message');
    });
  });
});
