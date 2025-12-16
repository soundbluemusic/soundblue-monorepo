import { Title, Meta } from "@solidjs/meta";
import { About } from "~/components/About";

export default function AboutPage() {
  return (
    <>
      <Title>About - Dialogue</Title>
      <Meta name="description" content="About Dialogue - A conversational learning tool" />
      <About />
    </>
  );
}
