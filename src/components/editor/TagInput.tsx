"use client";

import { useState, useRef, useCallback } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (value: string) => {
      const tag = value.trim();
      if (tag && !tags.includes(tag)) {
        onChange([...tags, tag]);
      }
      setInput("");
    },
    [tags, onChange]
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card)] cursor-text min-h-[42px] focus-within:ring-2 focus-within:ring-[var(--accent)] transition-shadow"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-md bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/25"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
            className="ml-0.5 text-[var(--accent)]/60 hover:text-[var(--accent)] transition-colors text-xs leading-none"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={tags.length === 0 ? "태그를 입력하세요" : ""}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/50"
      />
    </div>
  );
}
