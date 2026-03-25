import { createHeadlessEditor } from "@lexical/headless";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot } from "lexical";
import { ListNode, ListItemNode } from "@lexical/list";
import { ImageNode } from "@/components/rte/nodes/ImageNode";

export const lexicalToText = (json: string): string => {
  try {
    const editor = createHeadlessEditor({
      namespace: "text",
      nodes: [ListNode, ListItemNode, ImageNode],
      onError: () => {},
    });
    editor.setEditorState(editor.parseEditorState(json));
    let text = "";
    editor.read(() => {
      text = $getRoot().getTextContent();
    });
    return text;
  } catch {
    return json;
  }
};

export const lexicalToHtml = (json: string): string => {
  try {
    const editor = createHeadlessEditor({
      namespace: "preview",
      nodes: [ListNode, ListItemNode, ImageNode],
      onError: () => {},
    });
    editor.setEditorState(editor.parseEditorState(json));
    let html = "";
    editor.read(() => {
      html = $generateHtmlFromNodes(editor);
    });
    return html;
  } catch {
    return json;
  }
};
