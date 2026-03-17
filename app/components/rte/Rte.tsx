"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
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
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  ListItemNode,
  $isListNode,
} from "@lexical/list";
import {
  LuBold,
  LuImage,
  LuItalic,
  LuList,
  LuListOrdered,
  LuRedo2,
  LuStrikethrough,
  LuUnderline,
  LuUndo2,
} from "react-icons/lu";
import { ImageNode } from "./nodes/ImageNode";
import ImagesPlugin, {
  INSERT_IMAGE_COMMAND,
  compressImage,
} from "./plugins/ImagesPlugin";

interface RteProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  [key: string]: unknown;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function InitialValuePlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (value && !isInitialized.current) {
      editor.update(() => {
        try {
          const editorState = editor.parseEditorState(value);
          editor.setEditorState(editorState);
        } catch {
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(value);
          paragraph.append(textNode);
          root.append(paragraph);
          paragraph.selectEnd();
        }
      });
      isInitialized.current = true;
    }
  }, [editor, value]);

  return null;
}

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

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formatStates, setFormatStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const [listType, setListType] = useState<
    "bullet" | "number" | "check" | null
  >(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setFormatStates({
        bold: selection.hasFormat("bold"),
        italic: selection.hasFormat("italic"),
        underline: selection.hasFormat("underline"),
        strikethrough: selection.hasFormat("strikethrough"),
      });
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      setListType($isListNode(element) ? element.getListType() : null);
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(updateToolbar);
    });
  }, [editor, updateToolbar]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const src = await compressImage(file);
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src, altText: file.name });
      e.target.value = "";
    },
    [editor],
  );

  const formatButtons = [
    { format: "bold", label: <LuBold fontSize={18} />, title: "Bold (Ctrl+B)" },
    {
      format: "italic",
      label: <LuItalic fontSize={18} />,
      title: "Italic (Ctrl+I)",
    },
    {
      format: "underline",
      label: <LuUnderline fontSize={18} />,
      title: "Underline (Ctrl+U)",
    },
    {
      format: "strikethrough",
      label: <LuStrikethrough fontSize={18} />,
      title: "Strikethrough",
    },
  ] as const;

  return (
    <div className="flex border-b border-gray-300 pb-2 mb-2 flex-wrap">
      <ToolbarButton
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        active={false}
        title="Undo (Ctrl+Z)"
      >
        <LuUndo2 fontSize="18" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        active={false}
        title="Redo (Ctrl+Y)"
      >
        <LuRedo2 fontSize="18" />
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

      <div className="w-px bg-gray-300 mx-1" />

      <ToolbarButton
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        active={listType === "bullet"}
        title="Bullet List"
      >
        <LuList fontSize="18" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        active={listType === "number"}
        title="Numbered List"
      >
        <LuListOrdered fontSize="18" />
      </ToolbarButton>

      <div className="w-px bg-gray-300 mx-1" />

      <ToolbarButton
        onClick={() => fileInputRef.current?.click()}
        active={false}
        title="Insert Image"
      >
        <LuImage fontSize="18" />
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}

export const Rte = ({
  value = "",
  onChange,
  disabled = false,
  ...props
}: RteProps) => {
  // Suppress known Lexical flushSync warning — triggered when the editor loses
  // focus during a form submit. This is a Lexical internals issue, not our code.
  useEffect(() => {
    const original = console.error;
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes("flushSync")) return;
      original.apply(console, args);
    };
    return () => {
      console.error = original;
    };
  }, []);

  const initialConfig = {
    namespace: "RteEditor",
    nodes: [ListNode, ListItemNode, ImageNode],
    theme: {
      paragraph: "mb-1",
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
      },
      list: {
        ul: "list-disc ml-4",
        ol: "list-decimal ml-4",
      },
    },
    onError: (error: Error) => console.error(error),
    editable: !disabled,
  };

  const handleChange = (editorState: EditorState) => {
    setTimeout(() => {
      onChange?.(JSON.stringify(editorState.toJSON()));
    }, 0);
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
          contentEditable={
            <ContentEditable
              className="focus:outline-none max-h-128 min-h-128 overflow-y-auto"
              {...props}
            />
          }
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
        <ListPlugin />
        <ImagesPlugin />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        <InitialValuePlugin value={value} />
      </div>
    </LexicalComposer>
  );
};
