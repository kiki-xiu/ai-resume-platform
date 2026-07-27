"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "数据看板", path: "/admin/dashboard", icon: "📊" },
  { label: "用户管理", path: "/admin/users", icon: "👥" },
  { label: "审核管理", path: "/admin/reviews", icon: "✅" },
  { label: "站点配置", path: "/admin/config", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = sessionStorage.getItem("admin_token");
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }
    if (adminToken) {
      setAuthenticated(true);
    } else {
      router.push("/admin/login");
    }
    setLoading(false);
  }, [pathname, router]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  // Login page - render without admin layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!authenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="w-56 bg-gray-900 text-white min-h-screen flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1a73e8] flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <span className="font-bold text-sm">管理后台</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => {
            const active = pathname.startsWith(item.path);
            return (
              <button key={item.path} onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}>
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <button onClick={() => { sessionStorage.removeItem("admin_token"); router.push("/admin/login"); }}
            className="w-full py-2 text-xs text-gray-500 hover:text-red-400 transition-colors">
            退出管理
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
