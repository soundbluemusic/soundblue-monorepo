import { Meta, Title } from '@solidjs/meta';
import { About } from '~/components/About';

export default function AboutPageKo() {
  return (
    <>
      <Title>정보 - Dialogue</Title>
      <Meta name="description" content="Dialogue 정보 - 대화형 학습 도구" />
      <About />
    </>
  );
}
