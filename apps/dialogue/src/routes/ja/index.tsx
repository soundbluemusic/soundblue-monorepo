import { Title, Meta } from "@solidjs/meta";
import { Chat } from "~/components";

export default function JapaneseHome() {
  return (
    <>
      <Title>Dialogue - 対話型学習ツール</Title>
      <Meta
        name="description"
        content="100%オフラインで動作する対話型学習ツール"
      />
      <Chat />
    </>
  );
}
