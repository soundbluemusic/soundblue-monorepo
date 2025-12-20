import { Meta, Title } from '@solidjs/meta';
import { MainLayoutClient } from '~/components';

/**
 * Chat route with conversation ID
 * URL: /c/{conversationId}
 *
 * SSG: Route params and conversation loading are handled client-side
 * inside MainLayoutClient (wrapped with clientOnly).
 */
export default function ChatRoute() {
  return (
    <>
      <Title>Dialogue - Conversational Learning Tool</Title>
      <Meta name="description" content="A conversational learning tool that works 100% offline" />
      <MainLayoutClient />
    </>
  );
}
