"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface DraftData {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  blocks: unknown[];
  savedAt: number; // timestamp
}

const DEBOUNCE_MS = 2000; // 2초 뒤 자동 저장

function draftKey(id: string) {
  return `draft:${id}`;
}

export function useDraft(id: string) {
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 마운트 시 저장된 임시본 확인
  useEffect(() => {
    const raw = localStorage.getItem(draftKey(id));
    if (raw) {
      try {
        const draft: DraftData = JSON.parse(raw);
        setSavedAt(new Date(draft.savedAt));
        setHasDraft(true);
      } catch {
        localStorage.removeItem(draftKey(id));
      }
    }
  }, [id]);

  // 임시저장 실행
  const save = useCallback(
    (data: Omit<DraftData, "savedAt">) => {
      const draft: DraftData = { ...data, savedAt: Date.now() };
      localStorage.setItem(draftKey(id), JSON.stringify(draft));
      setSavedAt(new Date(draft.savedAt));
      setHasDraft(true);
    },
    [id]
  );

  // 디바운스 자동 저장 트리거
  const scheduleSave = useCallback(
    (data: Omit<DraftData, "savedAt">) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => save(data), DEBOUNCE_MS);
    },
    [save]
  );

  // 임시저장 불러오기
  const load = useCallback((): DraftData | null => {
    const raw = localStorage.getItem(draftKey(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DraftData;
    } catch {
      return null;
    }
  }, [id]);

  // 임시저장 삭제 (출간 완료 후)
  const clear = useCallback(() => {
    localStorage.removeItem(draftKey(id));
    setSavedAt(null);
    setHasDraft(false);
  }, [id]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { save, scheduleSave, load, clear, savedAt, hasDraft };
}
