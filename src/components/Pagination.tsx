"use client";

const PAGE_SIZES = [5, 10, 15, 20] as const;

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // 표시할 페이지 번호 계산 (최대 5개)
  function getPageNumbers(): number[] {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 pt-6">
      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)]">표시</span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="px-2 py-1 text-xs rounded-md border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}개
            </option>
          ))}
        </select>
        <span className="text-xs text-[var(--muted)]">
          / 전체 {totalItems}개
        </span>
      </div>

      {/* Page numbers */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-md text-xs text-[var(--muted)] hover:bg-[var(--card)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                page === currentPage
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-md text-xs text-[var(--muted)] hover:bg-[var(--card)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
