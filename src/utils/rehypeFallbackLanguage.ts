import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

const supportedLanguages = new Set([
  "bash",
  "css",
  "js",
  "jsx",
  "json",
  "markdown",
]);

export function rehypeFallbackLanguage() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (
        node.tagName === "code" &&
        node.properties?.className &&
        Array.isArray(node.properties.className)
      ) {
        const classes = node.properties.className as string[];
        const langClass = classes.find((c) => c.startsWith("language-"));

        if (langClass) {
          const lang = langClass.replace("language-", "");
          if (!supportedLanguages.has(lang)) {
            const index = classes.indexOf(langClass);
            classes[index] = "language-shell";
          }
        }
      }
    });
  };
}
