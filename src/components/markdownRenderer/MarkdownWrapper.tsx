import MarkdownRenderer from "./MarkdownRenderer";

interface Props {
  content: string;
}

export default function MarkdownWrapper({ content }: Props) {
  return <MarkdownRenderer content={content} />;
}
