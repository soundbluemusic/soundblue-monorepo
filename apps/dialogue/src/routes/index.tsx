import { Title, Meta } from "@solidjs/meta";
import { Chat } from "~/components";

export default function Home() {
  return (
    <>
      <Title>Dialogue - Conversational Learning Tool</Title>
      <Meta
        name="description"
        content="A conversational learning tool that works 100% offline"
      />
      <Chat />
    </>
  );
}
