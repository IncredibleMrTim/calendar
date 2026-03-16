import { createHeadlessEditor } from "@lexical/headless";
import { $generateHtmlFromNodes } from "@lexical/html";

export const lexicalToHtml = (json: string): string => {
  try {
    const editor = createHeadlessEditor({
      namespace: "preview",
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
