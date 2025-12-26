import type { Message } from '~/stores';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={[styles.message, isUser ? styles.messageUser : styles.messageAssistant]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Avatar */}
      <div
        className={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAssistant]
          .filter(Boolean)
          .join(' ')}
      >
        {isUser ? 'U' : 'D'}
      </div>

      {/* Message content */}
      <div
        className={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]
          .filter(Boolean)
          .join(' ')}
      >
        <p className={styles.content}>{message.content}</p>
      </div>
    </div>
  );
}
