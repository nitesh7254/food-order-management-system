import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

function MainLayout() {

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    function closeSidebar() {
        setMobileSidebarOpen(false);
    }

    function openSidebar() {
        setMobileSidebarOpen(true);
    }

    return (
        <div className="h-screen overflow-hidden bg-slate-100">

            <div className="flex h-screen overflow-hidden">

                {/* Sidebar */}
                <Sidebar
                    mobileOpen={mobileSidebarOpen}
                    onClose={closeSidebar}
                />

                {/* Main Content Area */}
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

                    {/* Navbar */}
                    <Navbar onMenuClick={openSidebar} />

                    {/* Page Content */}
                    <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

                        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">

                            <Outlet />

                        </div>

                    </main>

                    {/* Footer */}
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

export default MainLayout;