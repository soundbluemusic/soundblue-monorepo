import { Meta, Title } from '@solidjs/meta';
import { MainLayoutClient } from '~/components';

export default function Home() {
  return (
    <>
      <Title>Dialogue - Conversational Learning Tool</Title>
      <Meta name="description" content="A conversational learning tool that works 100% offline" />
      <MainLayoutClient />
    </>
  );
}
