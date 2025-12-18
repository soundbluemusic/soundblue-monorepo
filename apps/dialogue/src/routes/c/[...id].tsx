import { Title, Meta } from "@solidjs/meta";
import { useParams, useNavigate } from "@solidjs/router";
import { createEffect, onMount } from "solid-js";
import { MainLayout } from "~/components";
import { chatStore, chatActions } from "~/stores/chat-store";

/**
 * Chat route with conversation ID
 * URL: /c/{conversationId}
 *
 * This route handles loading a specific conversation by ID from the URL.
 * If the conversation doesn't exist in IndexedDB, redirects to home.
 */
export default function ChatRoute() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  onMount(() => {
    // Ensure store is hydrated first
    chatActions.hydrate();
  });

  // Load conversation when params change and store is hydrated
  createEffect(() => {
    if (!chatStore.isHydrated) return;

    const conversationId = params.id;
    if (!conversationId) {
      navigate("/", { replace: true });
      return;
    }

    // Try to load the conversation
    const conversation = chatActions.loadConversation(conversationId);

    // If conversation not found, redirect to home
    if (!conversation) {
      navigate("/", { replace: true });
    }
  });

  return (
    <>
      <Title>Dialogue - Conversational Learning Tool</Title>
      <Meta
        name="description"
        content="A conversational learning tool that works 100% offline"
      />
      <MainLayout />
    </>
  );
}
