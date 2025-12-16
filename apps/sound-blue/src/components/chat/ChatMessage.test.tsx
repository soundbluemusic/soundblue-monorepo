/**
 * @fileoverview ChatMessage component tests
 *
 * Tests for:
 * - Rendering user messages
 * - Rendering bot messages
 * - Styling differences between user and bot messages
 * - Message content display
 */

import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import type { Message } from './ChatMessage';
import { ChatMessage } from './ChatMessage';

describe('ChatMessage', () => {
  describe('User messages', () => {
    it('should render user message content', () => {
      const message: Message = {
        id: '1',
        type: 'user',
        content: 'Hello, how are you?',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    });

    it('should align user message to the right', () => {
      const message: Message = {
        id: '1',
        type: 'user',
        content: 'User message',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      const listItem = screen.getByRole('listitem');
      expect(listItem.className).toContain('justify-end');
    });

    it('should apply user message styling (accent background)', () => {
      const message: Message = {
        id: '1',
        type: 'user',
        content: 'User message',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      const messageDiv = screen.getByText('User message');
      expect(messageDiv.className).toContain('bg-accent');
      expect(messageDiv.className).toContain('text-white');
    });

    it('should apply rounded-br-md for user messages', () => {
      const message: Message = {
        id: '1',
        type: 'user',
        content: 'User message',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      const messageDiv = screen.getByText('User message');
      expect(messageDiv.className).toContain('rounded-br-md');
    });
  });

  describe('Bot messages', () => {
    it('should render bot message content', () => {
      const message: Message = {
        id: '1',
        type: 'bot',
        content: 'I am the assistant.',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      expect(screen.getByText('I am the assistant.')).toBeInTheDocument();
    });

    it('should align bot message to the left', () => {
      const message: Message = {
        id: '1',
        type: 'bot',
        content: 'Bot message',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      const listItem = screen.getByRole('listitem');
      expect(listItem.className).toContain('justify-start');
    });

    it('should apply bot message styling (surface-alt background)', () => {
      const message: Message = {
        id: '1',
        type: 'bot',
        content: 'Bot message',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      const messageDiv = screen.getByText('Bot message');
      expect(messageDiv.className).toContain('bg-surface-alt');
      expect(messageDiv.className).toContain('text-content');
    });

    it('should apply rounded-bl-md for bot messages', () => {
      const message: Message = {
        id: '1',
        type: 'bot',
        content: 'Bot message',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      const messageDiv = screen.getByText('Bot message');
      expect(messageDiv.className).toContain('rounded-bl-md');
    });
  });

  describe('Message content', () => {
    it('should display special characters correctly', () => {
      const message: Message = {
        id: '1',
        type: 'user',
        content: 'Special chars: !@#$%^&*()',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      expect(screen.getByText('Special chars: !@#$%^&*()')).toBeInTheDocument();
    });

    it('should display Korean text correctly', () => {
      const message: Message = {
        id: '1',
        type: 'user',
        content: '안녕하세요',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      expect(screen.getByText('안녕하세요')).toBeInTheDocument();
    });

    it('should display long message content', () => {
      const longContent = 'A'.repeat(500);
      const message: Message = {
        id: '1',
        type: 'bot',
        content: longContent,
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('should display empty message content', () => {
      const message: Message = {
        id: '1',
        type: 'bot',
        content: '',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      const listItem = screen.getByRole('listitem');
      expect(listItem).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render as list item', () => {
      const message: Message = {
        id: '1',
        type: 'user',
        content: 'Test message',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });

    it('should have max-width constraint for readability', () => {
      const message: Message = {
        id: '1',
        type: 'user',
        content: 'Test message',
        timestamp: Date.now(),
      };

      render(() => <ChatMessage message={message} />);

      const messageDiv = screen.getByText('Test message');
      expect(messageDiv.className).toContain('max-w-[80%]');
    });
  });
});
