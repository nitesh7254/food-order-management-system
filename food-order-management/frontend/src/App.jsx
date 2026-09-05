import { useState } from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import FoodItems from "./pages/FoodItems";
import Orders from "./pages/Orders";

function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  function closeSidebar() {
    setMobileSidebarOpen(false);
  }

  function openSidebar() {
    setMobileSidebarOpen(true);
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-100">

      <div className="flex h-screen overflow-hidden">

        {/* =========================
            SIDEBAR
        ========================== */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={closeSidebar}
        />

        {/* =========================
            MAIN APPLICATION
        ========================== */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* =========================
              NAVBAR
          ========================== */}
          <Navbar onMenuClick={openSidebar} />

          {/* =========================
              SCROLLABLE CONTENT AREA
          ========================== */}
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

            <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">

              <Routes>

                {/* =========================
                    DEFAULT ROUTE
                ========================== */}
                <Route
                  path="/"
                  element={
                    <Navigate
                      to="/dashboard"
                      replace
                    />
                  }
                />

                {/* =========================
                    DASHBOARD
                ========================== */}
                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />

                {/* =========================
                    CUSTOMERS
                ========================== */}
                <Route
                  path="/customers"
                  element={<Customers />}
                />

                {/* =========================
                    FOOD ITEMS
                ========================== */}
                <Route
                  path="/food-items"
                  element={<FoodItems />}
                />

                {/* =========================
                    ORDERS
                ========================== */}
                <Route
                  path="/orders"
                  element={<Orders />}
                />

                {/* =========================
                    INVALID ROUTE
                ========================== */}
                <Route
                  path="*"
                  element={
                    <Navigate
                      to="/dashboard"
                      replace
                    />
                  }
                />

              </Routes>

            </div>

          </main>

          {/* =========================
              FOOTER
          ========================== */}
          <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">

            <div className="flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">

              <p>
                © 2026 Food Order Management System
              </p>

              <p>
                Restaurant Administration Panel
              </p>

            </div>

          </footer>

        </div>

      </div>

    </div>
  );
}

export default App;