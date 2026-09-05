import { NavLink } from "react-router-dom";

function Sidebar({ mobileOpen = false, onClose }) {
  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      name: "Customers",
      path: "/customers",
      icon: "♟",
    },
    {
      name: "Food Items",
      path: "/food-items",
      icon: "🍔",
    },
    {
      name: "Orders",
      path: "/orders",
      icon: "🛒",
    },
  ];

  function handleNavigation() {
    if (onClose) {
      onClose();
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-xl text-white shadow-lg shadow-orange-200">
              🍴
            </div>

            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                Food Order
              </h1>

              <p className="text-xs font-medium text-slate-400">
                Management System
              </p>
            </div>
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                      : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 h-7 w-1 rounded-r-full bg-white" />
                    )}

                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? "bg-white/15"
                          : "bg-slate-100 group-hover:bg-white"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span className="flex-1">
                      {item.name}
                    </span>

                    {isActive && (
                      <span className="text-xs text-white/80">
                        ●
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Management */}
          <div className="mt-9">
            <p className="mb-3 px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
              Management
            </p>

            <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                ⚡
              </div>

              <p className="text-sm font-extrabold text-slate-800">
                Quick Management
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Manage customers, food items and
                orders easily.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom user section */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-extrabold text-white">
              A
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-slate-800">
                Administrator
              </p>

              <p className="truncate text-xs text-slate-400">
                Food Order Admin
              </p>
            </div>

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;