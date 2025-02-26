import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  content: string | undefined;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}
      components={{
        h1: ({ ...props }) => (
          <h1
            className="text-3xl sm:text-2xl font-bold text-lime-500"
            {...props}
          />
        ),
        h2: ({ ...props }) => (
          <h2
            className="text-2xl sm:text-xl font-semibold text-blue-500"
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <h3 className="text-xl font-semibold text-cyan-500" {...props} />
        ),
        h4: ({ ...props }) => (
          <h4 className="text-xl font-semibold text-fuchsia-500" {...props} />
        ),
        h5: ({ ...props }) => (
          <h5 className="text-xl font-semibold text-rose-500" {...props} />
        ),
        h6: ({ ...props }) => (
          <h6 className="text-xl font-semibold text-slate-500" {...props} />
        ),
        p: ({ ...props }) => (
          <p className="text-base leading-relaxed" {...props} />
        ),
        strong: ({ ...props }) => <strong className="font-bold" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc ml-5" {...props} />,
        ol: ({ ...props }) => <ol className="list-decimal ml-5" {...props} />,
        li: ({ ...props }) => <li className="mb-2" {...props} />,
        span: ({ ...props }) => <span {...props} />,
        code: ({ className, children, ...props }) => (
          <code
            className={`bg-gray-800 text-green-300 px-1 rounded ${className}`}
            {...props}
          >
            {children}
          </code>
        ),
        pre: ({ ...props }) => (
          <pre
            className="text-gray-100 p-3 rounded-lg overflow-x-auto"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
