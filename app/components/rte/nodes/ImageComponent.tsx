"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { $isImageNode } from "./ImageNode";

interface ImageComponentProps {
  src: string;
  altText: string;
  width: number | "inherit";
  height: number | "inherit";
  maxWidth: number;
  nodeKey: NodeKey;
}

export default function ImageComponent({
  src,
  altText,
  width,
  height,
  maxWidth,
  nodeKey,
}: ImageComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const startResize = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  // Delete image on Backspace/Delete when selected
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isSelected && (e.key === "Backspace" || e.key === "Delete")) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          node?.remove();
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor, isSelected, nodeKey]);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const img = imageRef.current;
    if (!img) return;
    setIsResizing(true);
    startResize.current = {
      x: e.clientX,
      y: e.clientY,
      w: img.offsetWidth,
      h: img.offsetHeight,
    };
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!startResize.current) return;
      const dx = e.clientX - startResize.current.x;
      const newW = Math.max(50, Math.min(maxWidth, startResize.current.w + dx));
      const ratio = startResize.current.h / startResize.current.w;
      const newH = Math.round(newW * ratio);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) node.setWidthAndHeight(Math.round(newW), newH);
      });
    };

    const onMouseUp = () => setIsResizing(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [editor, isResizing, maxWidth, nodeKey]);

  return (
    <span
      className="relative inline-block max-w-full"
      onClick={(e) => {
        e.stopPropagation();
        clearSelection();
        setSelected(true);
      }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        style={{
          width: width === "inherit" ? undefined : width,
          height: height === "inherit" ? undefined : height,
          maxWidth: "100%",
        }}
        className={`block ${isSelected ? "outline outline-2 outline-blue-500" : ""}`}
        draggable={false}
      />
      {isSelected && (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
          onMouseDown={onResizeStart}
        />
      )}
    </span>
  );
}
