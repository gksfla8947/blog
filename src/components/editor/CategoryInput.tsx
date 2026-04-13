"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  existingCategories: string[];
}

export default function CategoryInput({
  value,
  onChange,
  existingCategories,
}: CategoryInputProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // value prop 변경 시 input 동기화
  useEffect(() => {
    setInput(value);
  }, [value]);

  const filtered = existingCategories.filter(
    (c) => c.toLowerCase().includes(input.toLowerCase()) && c !== input
  );

  const showNew = input.trim() && !existingCategories.includes(input.trim());

  function select(cat: string) {
    onChange(cat);
    setInput(cat);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) {
        select(input.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider shrink-0">
          카테고리
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="카테고리 입력"
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent w-48"
        />
      </div>

      {/* Dropdown */}
      {open && (filtered.length > 0 || showNew) && (
        <div className="absolute left-[72px] top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
          {/* 기존 카테고리 목록 */}
          {filtered.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => select(cat)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cat}
            </button>
          ))}

          {/* 새 카테고리 추가 */}
          {showNew && (
            <>
              {filtered.length > 0 && (
                <div className="border-t border-gray-100" />
              )}
              <button
                type="button"
                onClick={() => select(input.trim())}
                className="w-full text-left px-3 py-2 text-sm text-[var(--accent)] hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <span className="text-xs">+</span>
                &ldquo;{input.trim()}&rdquo; 새로 추가
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
