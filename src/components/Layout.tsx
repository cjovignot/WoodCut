import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Settings, FileText, Zap } from "lucide-react";
import { Favicon_512, Logo_text_only } from "../assets/SVG_components";

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
        <div className="flex items-center justify-start h-16 mx-2">
          <h1 className="sr-only">WoodCut Optimizer</h1>
          <Favicon_512 width={70} height={70} fill="#FFFFFF" className="mr-6" />
          <Logo_text_only
            width={"auto"}
            height={"auto"}
            fill="#FFFFFF"
            className="mr-2"
          />
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
          <div className="flex items-center justify-start h-16 mx-3">
            <h1 className="sr-only">WoodCut Optimizer</h1>

            <Favicon_512
              width={80}
              height={80}
              fill="#FFFFFF"
              className="mr-2"
            />
            <Logo_text_only width={"auto"} height={"auto"} fill="#FFFFFF" />
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
