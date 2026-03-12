"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  EditorState,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
} from "lexical";

interface RteProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  [key: string]: unknown;
}

// Simple error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Plugin to set initial value (only once on mount)
function InitialValuePlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (value && !isInitialized.current) {
      editor.update(() => {
        try {
          // Try to parse as JSON (serialized editor state)
          const editorState = editor.parseEditorState(value);
          editor.setEditorState(editorState);
        } catch {
          // If not JSON, treat as plain text
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(value);
          paragraph.append(textNode);
          root.append(paragraph);
          // Move cursor to the end
          paragraph.selectEnd();
        }
      });
      isInitialized.current = true;
    }
  }, [editor, value]);

  return null;
}

// Toolbar Button Component
const ToolbarButton = ({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`px-3 py-1 text-sm font-medium rounded hover:bg-gray-200 transition-colors ${
      active ? "bg-gray-300 text-gray-900" : "bg-white text-gray-700"
    }`}
  >
    {children}
  </button>
);

// Toolbar Plugin
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [formatStates, setFormatStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setFormatStates({
        bold: selection.hasFormat("bold"),
        italic: selection.hasFormat("italic"),
        underline: selection.hasFormat("underline"),
        strikethrough: selection.hasFormat("strikethrough"),
      });
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(updateToolbar);
    });
  }, [editor, updateToolbar]);

  const formatButtons = [
    { format: "bold", label: <strong>B</strong>, title: "Bold (Ctrl+B)" },
    { format: "italic", label: <em>I</em>, title: "Italic (Ctrl+I)" },
    { format: "underline", label: <u>U</u>, title: "Underline (Ctrl+U)" },
    { format: "strikethrough", label: <s>S</s>, title: "Strikethrough" },
  ] as const;

  return (
    <div className="flex gap-1 border-b border-gray-300 pb-2 mb-2 flex-wrap">
      <ToolbarButton
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        active={false}
        title="Undo (Ctrl+Z)"
      >
        ↶
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        active={false}
        title="Redo (Ctrl+Y)"
      >
        ↷
      </ToolbarButton>
      <div className="w-px bg-gray-300 mx-1" />
      {formatButtons.map(({ format, label, title }) => (
        <ToolbarButton
          key={format}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}
          active={formatStates[format]}
          title={title}
        >
          {label}
        </ToolbarButton>
      ))}
    </div>
  );
}

export const Rte = ({ value = "", onChange, disabled = false, ...props }: RteProps) => {
  const initialConfig = {
    namespace: "RteEditor",
    theme: {
      paragraph: "mb-1",
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
      },
    },
    onError: (error: Error) => {
      console.error(error);
    },
    editable: !disabled,
  };

  const handleChange = (editorState: EditorState) => {
    onChange?.(JSON.stringify(editorState.toJSON()));
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={`border border-gray-300 rounded-md p-2 min-h-32 relative ${
          disabled ? "bg-gray-100 opacity-60" : ""
        }`}
      >
        {!disabled && <ToolbarPlugin />}
        <RichTextPlugin
          contentEditable={<ContentEditable className="focus:outline-none min-h-24" {...props} />}
          placeholder={
            disabled ? null : (
              <div className="absolute top-14 left-2 text-gray-400 pointer-events-none">
                Enter text...
              </div>
            )
          }
          ErrorBoundary={ErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        <InitialValuePlugin value={value} />
      </div>
    </LexicalComposer>
  );
};
