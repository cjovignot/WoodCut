import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Settings, FileText, Zap } from "lucide-react";

const Layout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Projects" },
    { path: "/optimizer", icon: Zap, label: "Optimizer" },
    { path: "/export", icon: FileText, label: "Export" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen w-screen sm:w-[99vw] bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="shadow-sm bg-sky-900 dark:bg-gray-800 sm:hidden">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0">
                <h1 className="font-[Roboto] !text-2xl font-bold text-white dark:text-wood-400">
                  WoodCut Optimizer
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-screen !max-w-screen sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-sky-900 dark:bg-gray-800 md:hidden">
        <div className="flex justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center py-2 px-3 text-xs ${
                  isActive
                    ? "!text-sky-100 dark:text-wood-100"
                    : "!text-indigo-200 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-sky-900 dark:bg-gray-800">
          <div className="flex items-center flex-shrink-0 px-3">
            <h1 className="!text-2xl font-bold text-white dark:text-wood-400">
              WoodCut Optimizer
            </h1>
          </div>
          <div className="flex flex-col flex-grow mt-8">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`group hover:!bg-sky-100 hover:!text-sky-900 flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "!text-sky-100 dark:text-wood-100"
                        : "!text-indigo-200 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="flex-shrink-0 w-6 h-6 mr-3" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Adjust main content for desktop sidebar */}
      <style>{`
        @media (min-width: 768px) {
          main {
            margin-left: 16rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
