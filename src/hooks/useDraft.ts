"use client";

import { useCallback } from "react";

export interface DraftItem {
  id: string;
  title: string;
  slug?: string;
  description: string;
  category: string;
  tags: string[];
  blocks: unknown[];
  savedAt: number;
}

const STORAGE_KEY = "manage:drafts";

// localStorage 헬퍼
function readAll(): DraftItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeAll(drafts: DraftItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

// 전역 유틸 (컴포넌트 밖에서도 사용 가능)
export const draftStorage = {
  list: (): DraftItem[] => readAll().sort((a, b) => b.savedAt - a.savedAt),
  get: (id: string): DraftItem | null => readAll().find((d) => d.id === id) ?? null,
  save: (draft: Omit<DraftItem, "id" | "savedAt"> & { id?: string }): string => {
    const all = readAll();
    const id = draft.id ?? crypto.randomUUID();
    const now = Date.now();
    const existing = all.findIndex((d) => d.id === id);
    const item: DraftItem = { ...draft, id, savedAt: now };
    if (existing >= 0) {
      all[existing] = item;
    } else {
      all.push(item);
    }
    writeAll(all);
    return id;
  },
  delete: (id: string) => {
    writeAll(readAll().filter((d) => d.id !== id));
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  },
};

// 컴포넌트용 훅
export function useDraft() {
  const save = useCallback(
    (draft: Omit<DraftItem, "id" | "savedAt"> & { id?: string }): string => {
      return draftStorage.save(draft);
    },
    []
  );

  const remove = useCallback((id: string) => {
    draftStorage.delete(id);
  }, []);

  return { save, remove };
}
