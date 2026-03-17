"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { type JSX, lazy, Suspense } from "react";

const ImageComponent = lazy(() => import("./ImageComponent"));

export interface ImagePayload {
  src: string;
  altText: string;
  width?: number | "inherit";
  height?: number | "inherit";
  maxWidth?: number;
  key?: NodeKey;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width: number | "inherit";
    height: number | "inherit";
    maxWidth: number;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | "inherit";
  __height: number | "inherit";
  __maxWidth: number;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__maxWidth,
      node.__key,
    );
  }

  static importJSON(serialized: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serialized.src,
      altText: serialized.altText,
      width: serialized.width,
      height: serialized.height,
      maxWidth: serialized.maxWidth,
    });
  }

  static importDOM(): DOMConversionMap {
    return {
      img: () => ({
        conversion: (node) => {
          const img = node as HTMLImageElement;
          return {
            node: $createImageNode({
              src: img.src,
              altText: img.alt,
              width: img.width || "inherit",
              height: img.height || "inherit",
            }),
          };
        },
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    width: number | "inherit" = "inherit",
    height: number | "inherit" = "inherit",
    maxWidth: number = 800,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__maxWidth = maxWidth;
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      maxWidth: this.__maxWidth,
    };
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement("img");
    img.src = this.__src;
    img.alt = this.__altText;
    if (typeof this.__width === "number") img.width = this.__width;
    if (typeof this.__height === "number") img.height = this.__height;
    return { element: img };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const className = config.theme.image;
    if (className) span.className = className;
    return span;
  }

  updateDOM(): false {
    return false;
  }

  setWidthAndHeight(width: number | "inherit", height: number | "inherit"): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  getSrc(): string { return this.__src; }
  getAltText(): string { return this.__altText; }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          maxWidth={this.__maxWidth}
          nodeKey={this.getKey()}
        />
      </Suspense>
    );
  }
}

export function $createImageNode(payload: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(
      payload.src,
      payload.altText,
      payload.width,
      payload.height,
      payload.maxWidth,
      payload.key,
    ),
  );
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
