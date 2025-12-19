import { Meta, Title } from '@solidjs/meta';
import { useNavigate, useParams } from '@solidjs/router';
import { createEffect, onMount } from 'solid-js';
import { MainLayout } from '~/components';
import { chatActions, chatStore } from '~/stores/chat-store';

/**
 * Korean chat route with conversation ID
 * URL: /ko/c/{conversationId}
 */
export default function ChatRouteKo() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  onMount(() => {
    chatActions.hydrate();
  });

  createEffect(() => {
    if (!chatStore.isHydrated) return;

    const conversationId = params.id;
    if (!conversationId) {
      navigate('/ko', { replace: true });
      return;
    }

    const conversation = chatActions.loadConversation(conversationId);

    if (!conversation) {
      navigate('/ko', { replace: true });
    }
  });

  return (
    <>
      <Title>Dialogue - 대화형 학습 도구</Title>
      <Meta name="description" content="100% 오프라인에서 작동하는 대화형 학습 도구" />
      <MainLayout />
    </>
  );
}
