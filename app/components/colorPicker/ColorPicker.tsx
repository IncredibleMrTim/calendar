"use client";

import { useState, useRef, useEffect } from "react";
import RCColorPicker, { ColorPickerProps } from "@rc-component/color-picker";
import "@rc-component/color-picker/assets/index.css";

export const ColorPicker = ({ ...props }: ColorPickerProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div
        className="border border-input  w-9 h-9 p-1 rounded-md shadow-xs transition-[color,box-shadow]"
        onClick={() => (!props.disabled ? setShowPicker(true) : undefined)}
      >
        <div
          style={{ backgroundColor: props.value as string }}
          className={`w-full h-full rounded`}
        />
      </div>
      <div
        className={`absolute right-0 ${showPicker ? "flex" : "hidden"} z-10 mt-2`}
        ref={ref}
        aria-disabled={props.disabled}
      >
        <RCColorPicker {...props} />
      </div>
    </div>
  );
};
