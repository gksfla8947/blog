"use client";

import { useState } from "react";

interface PublishModalProps {
  title: string;
  slug: string;
  description: string;
  published: boolean;
  onSlugChange: (slug: string) => void;
  onDescriptionChange: (desc: string) => void;
  onPublishedChange: (pub: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  saving: boolean;
  isEdit?: boolean;
}

export default function PublishModal({
  title,
  slug,
  description,
  published,
  onSlugChange,
  onDescriptionChange,
  onPublishedChange,
  onConfirm,
  onCancel,
  saving,
  isEdit,
}: PublishModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in">
        <div className="flex flex-col md:flex-row">
          {/* Left: Preview */}
          <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-[var(--card-border)]">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-5">
              포스트 미리보기
            </h3>

            {/* Thumbnail placeholder */}
            <div className="aspect-video rounded-lg bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-center mb-5">
              <div className="text-center text-[var(--muted)]/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-2 opacity-40">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            </div>

            {/* Title preview */}
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3 line-clamp-2">
              {title || "제목 없음"}
            </h2>

            {/* Description */}
            <div>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="당신의 포스트를 짧게 소개해보세요."
                maxLength={150}
                rows={3}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--muted)]/50"
              />
              <div className="text-right text-xs text-[var(--muted)] mt-1">
                {description.length}/150
              </div>
            </div>
          </div>

          {/* Right: Settings */}
          <div className="flex-1 p-8 flex flex-col">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-5">
              공개 설정
            </h3>

            {/* Public / Private toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => onPublishedChange(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  published
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--foreground)]/20"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                전체 공개
              </button>
              <button
                type="button"
                onClick={() => onPublishedChange(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  !published
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--foreground)]/20"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                비공개
              </button>
            </div>

            {/* URL setting */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                URL 설정
              </label>
              <div className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--background)] overflow-hidden">
                <span className="px-3 text-sm text-[var(--muted)] whitespace-nowrap border-r border-[var(--card-border)] py-2.5 bg-[var(--card)]">
                  /posts/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => onSlugChange(e.target.value)}
                  disabled={isEdit}
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent text-[var(--foreground)] outline-none disabled:text-[var(--muted)] disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "저장 중..." : "출간하기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
