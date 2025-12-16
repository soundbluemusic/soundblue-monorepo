import { Title, Meta } from "@solidjs/meta";
import { Chat } from "~/components";

export default function KoreanHome() {
  return (
    <>
      <Title>Dialogue - 대화형 학습 도구</Title>
      <Meta
        name="description"
        content="100% 오프라인에서 작동하는 대화형 학습 도구"
      />
      <Chat />
    </>
  );
}
