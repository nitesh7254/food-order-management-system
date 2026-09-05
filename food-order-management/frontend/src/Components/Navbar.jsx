import { useLocation } from "react-router-dom";

function Navbar({ onMenuClick }) {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": {
      title: "Dashboard",
      subtitle: "Overview of your restaurant",
      icon: "▦",
    },

    "/customers": {
      title: "Customers",
      subtitle: "Manage your registered customers",
      icon: "♟",
    },

    "/food-items": {
      title: "Food Items",
      subtitle: "Manage your restaurant menu",
      icon: "🍔",
    },

    "/orders": {
      title: "Orders",
      subtitle: "Track and manage customer orders",
      icon: "🛒",
    },
  };

  const currentPage =
    pageTitles[location.pathname] ||
    pageTitles["/dashboard"];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 lg:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* Page icon */}
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl sm:flex">
            {currentPage.icon}
          </div>

          {/* Page title */}
          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
              {currentPage.title}
            </h2>

            <p className="hidden truncate text-xs font-medium text-slate-400 sm:block">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Status */}
          <div className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-bold text-emerald-700">
              System Online
            </span>
          </div>

          {/* Divider */}
          <div className="hidden h-9 w-px bg-slate-200 sm:block" />

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-950 text-sm font-extrabold text-white shadow-sm">
              A
            </div>

            <div className="hidden min-w-0 md:block">
              <p className="text-sm font-extrabold text-slate-800">
                Admin
              </p>

              <p className="text-xs text-slate-400">
                Administrator
              </p>
            </div>

            <span className="hidden text-slate-400 md:block">
              ▾
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;