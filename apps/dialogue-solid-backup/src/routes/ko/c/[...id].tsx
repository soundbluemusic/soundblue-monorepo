import { Meta, Title } from '@solidjs/meta';
import { MainLayoutClient } from '~/components';

/**
 * Korean chat route with conversation ID
 * URL: /ko/c/{conversationId}
 *
 * SSG: Route params and conversation loading are handled client-side
 * inside MainLayoutClient (wrapped with clientOnly).
 */
export default function ChatRouteKo() {
  return (
    <>
      <Title>Dialogue - 대화형 학습 도구</Title>
      <Meta name="description" content="100% 오프라인에서 작동하는 대화형 학습 도구" />
      <MainLayoutClient />
    </>
  );
}
