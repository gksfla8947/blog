import VisitorCounter from "./VisitorCounter";

interface SidebarProps {
  categories: { name: string; count: number }[];
  totalPosts: number;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export default function Sidebar({
  categories,
  totalPosts,
  activeCategory,
  onCategoryChange,
}: SidebarProps) {
  return (
    <aside className="sidebar space-y-5">
      {/* Profile Card */}
      <div className="sidebar-card">
        <div className="flex flex-col items-center text-center">
          <img
            src="/profile.svg"
            alt="profile"
            className="w-24 h-24 rounded-full object-cover ring-2 ring-[var(--accent)]/20 mb-3"
          />
          <h3 className="font-bold text-lg text-[var(--foreground)]">강건너물구경</h3>
          <div className="w-8 h-0.5 bg-[var(--accent)]/20 rounded-full my-3" />
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            배운것들 정리합니다
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="sidebar-card">
        <h4 className="sidebar-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
          </svg>
          Categories
        </h4>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategoryChange("All")}
              className={`sidebar-category-item ${activeCategory === "All" ? "active" : ""}`}
            >
              <span>All</span>
              <span className="sidebar-count">{totalPosts}</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.name}>
              <button
                onClick={() => onCategoryChange(cat.name)}
                className={`sidebar-category-item ${activeCategory === cat.name ? "active" : ""}`}
              >
                <span>{cat.name}</span>
                <span className="sidebar-count">{cat.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Visitor Counter */}
      <VisitorCounter />
    </aside>
  );
}
