import { Title, Meta } from "@solidjs/meta";
import { About } from "~/components/About";

export default function AboutPageJa() {
  return (
    <>
      <Title>情報 - Dialogue</Title>
      <Meta name="description" content="Dialogueについて - 対話型学習ツール" />
      <About />
    </>
  );
}
