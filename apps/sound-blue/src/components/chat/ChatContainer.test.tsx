/**
 * @fileoverview ChatContainer component tests
 *
 * Tests for:
 * - parseMessage function (topic detection)
 * - Message flow (user sends → bot responds)
 * - Topic selection callback
 * - Bilingual keyword detection
 */

import { render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock navigate function
const mockNavigate = vi.fn();

// Mock @solidjs/router
vi.mock('@solidjs/router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock storage utils
vi.mock('~/utils', () => ({
  getStorageItem: vi.fn(() => null),
  setStorageItem: vi.fn(),
  removeStorageItem: vi.fn(),
}));

// Mock I18nProvider
vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => ({
      chat: {
        title: 'Chat Assistant',
        welcome: 'Welcome! How can I help you?',
        inputPlaceholder: 'Type a message...',
        send: 'Send',
        responses: {
          greeting: 'Hello! How can I help you?',
          help: 'You can ask me about Sound Blue, music, license...',
          unknown: "I didn't understand that.",
          time: 'The current time in Seoul is {time}.',
          date: 'Today in Seoul is {date}.',
          topics: {
            about: 'Sound Blue is a South Korean indie artist.',
            music: 'Sound Blue specializes in BGM and soundtracks.',
            license: 'Sound recordings may only be used for creative works.',
            soundRecording: 'Field recordings for creative works.',
            contact: 'You can find Sound Blue on YouTube.',
            builtWith: 'This website is built with SolidJS.',
            navigation: 'Check the Sitemap for all pages.',
          },
        },
      },
    }),
    language: () => 'en',
    localizedPath: (path: string) => path,
  }),
}));

import { ChatContainer } from './ChatContainer';

describe('ChatContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render chat container with title', () => {
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      expect(screen.getByText('Chat Assistant')).toBeInTheDocument();
    });

    it('should render welcome message on mount', () => {
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      expect(screen.getByText('Welcome! How can I help you?')).toBeInTheDocument();
    });

    it('should render chat input', () => {
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Message sending', () => {
    it('should display user message after sending', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello there');
      await user.keyboard('{Enter}');

      expect(screen.getByText('Hello there')).toBeInTheDocument();
    });

    it('should show typing indicator after user message', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test message');
      await user.keyboard('{Enter}');

      // Typing indicator should appear (bouncing dots)
      const typingDots = document.querySelectorAll('.animate-bounce');
      expect(typingDots.length).toBeGreaterThan(0);
    });

    it('should show bot response after typing delay', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'random message');
      await user.keyboard('{Enter}');

      // Advance past typing delay (300ms)
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("I didn't understand that.")).toBeInTheDocument();
      });
    });
  });

  describe('Topic detection - English', () => {
    it('should detect about keyword', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'who is sound blue');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onTopicSelect).toHaveBeenCalledWith('about');
      });
    });

    it('should detect music keyword', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'what kind of music');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onTopicSelect).toHaveBeenCalledWith('music');
      });
    });

    it('should detect license keyword', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'can i use the sounds');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onTopicSelect).toHaveBeenCalledWith('license');
      });
    });

    it('should detect contact keyword', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'youtube channel');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onTopicSelect).toHaveBeenCalledWith('contact');
      });
    });

    it('should detect builtWith keyword', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'what tech stack');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onTopicSelect).toHaveBeenCalledWith('builtWith');
      });
    });
  });

  describe('Topic detection - Korean redirects to /ko/chat/', () => {
    it('should redirect when 사운드블루 keyword is typed', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '사운드블루 누구야');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ko/chat/');
      });
    });

    it('should redirect when 음악 keyword is typed', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '어떤 음악 만들어');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ko/chat/');
      });
    });

    it('should redirect when 라이선스 keyword is typed', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '라이선스 정보');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ko/chat/');
      });
    });

    it('should redirect when 유튜브 keyword is typed', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '유튜브 채널');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ko/chat/');
      });
    });
  });

  describe('Greeting response', () => {
    it('should respond to hello in English', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
      });
      expect(onTopicSelect).not.toHaveBeenCalled();
    });

    it('should redirect when 안녕 is typed on English page', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '안녕');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ko/chat/');
      });
    });

    it('should respond to hi in English', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'hi');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
      });
      expect(onTopicSelect).not.toHaveBeenCalled();
    });
  });

  describe('Help response', () => {
    it('should respond to help keyword in English and show site navigation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'help');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(
          screen.getByText('You can ask me about Sound Blue, music, license...'),
        ).toBeInTheDocument();
      });
      // Help now triggers onTopicSelect to show site navigation in InfoPanel
      expect(onTopicSelect).toHaveBeenCalledWith('help');
    });

    it('should redirect when 도움말 is typed on English page', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '도움말');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ko/chat/');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on messages list', () => {
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      expect(screen.getByRole('list', { name: 'Chat messages' })).toBeInTheDocument();
    });

    it('should disable input while bot is typing', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      await user.keyboard('{Enter}');

      // Input should be disabled during typing animation
      const sendButton = screen.getByRole('button');
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Time and Date queries', () => {
    it('should respond to "what time" query in English', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'what time is it');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        // Should contain the time response pattern (dynamic time value)
        expect(screen.getByText(/The current time in Seoul is/)).toBeInTheDocument();
      });
      expect(onTopicSelect).not.toHaveBeenCalled();
    });

    it('should respond to "time now" query', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'time now');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/The current time in Seoul is/)).toBeInTheDocument();
      });
      expect(onTopicSelect).not.toHaveBeenCalled();
    });

    it('should respond to "what day" query in English', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'what day is today');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/Today in Seoul is/)).toBeInTheDocument();
      });
      expect(onTopicSelect).not.toHaveBeenCalled();
    });

    it('should respond to "what date" query', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'what date is it');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/Today in Seoul is/)).toBeInTheDocument();
      });
      expect(onTopicSelect).not.toHaveBeenCalled();
    });

    it('should respond to "current time" query', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'current time please');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/The current time in Seoul is/)).toBeInTheDocument();
      });
    });

    it('should respond to "today" query', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'tell me today');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/Today in Seoul is/)).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases and special input', () => {
    it('should not send whitespace-only messages', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '   ');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      // Only welcome message should exist
      const messages = screen.getAllByRole('listitem');
      expect(messages.length).toBe(1);
      expect(onTopicSelect).not.toHaveBeenCalled();
    });

    it('should handle special characters in message', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '!@#$%^&*()');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("I didn't understand that.")).toBeInTheDocument();
      });
      expect(onTopicSelect).not.toHaveBeenCalled();
    });

    it('should handle mixed case keywords', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'SOUND BLUE');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onTopicSelect).toHaveBeenCalledWith('about');
      });
    });

    it('should handle keyword with surrounding text', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'tell me the copyright info');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onTopicSelect).toHaveBeenCalledWith('license');
      });
    });

    it('should handle very long message', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      const longMessage = `${'a'.repeat(500)} sound blue ${'b'.repeat(500)}`;
      await user.type(input, longMessage);
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onTopicSelect).toHaveBeenCalledWith('about');
      });
    });

    it('should handle multiple topic keywords - first match wins', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      // about keywords are checked first in TOPIC_KEYWORDS order
      await user.type(input, 'sound blue music license');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onTopicSelect).toHaveBeenCalledWith('about');
      });
    });
  });

  describe('Korean input redirect', () => {
    it('should redirect to /ko/chat/ when Korean is typed on English page', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '안녕하세요');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ko/chat/');
      });
    });

    it('should save chat state before redirecting', async () => {
      const { setStorageItem } = await import('~/utils');
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '라이선스 정보');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(setStorageItem).toHaveBeenCalledWith(
          'sb-chat-state',
          expect.objectContaining({
            pendingMessage: '라이선스 정보',
          }),
        );
      });
    });

    it('should not redirect for English text on English page', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'hello there');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should NOT redirect for mixed Korean/English below 70% threshold', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      // "tell me about 음악" = ~17% Korean (2/12 chars), should NOT redirect
      await user.type(input, 'tell me about 음악');
      await user.keyboard('{Enter}');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should redirect when Korean ratio is 70% or higher', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onTopicSelect = vi.fn();
      render(() => <ChatContainer onTopicSelect={onTopicSelect} />);

      const input = screen.getByRole('textbox');
      // "안녕하세요hi" = 71% Korean (5/7 chars), should redirect
      await user.type(input, '안녕하세요hi');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ko/chat/');
      });
    });
  });
});
