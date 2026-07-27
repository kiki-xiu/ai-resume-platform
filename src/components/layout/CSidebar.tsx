"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { label: "总览", path: "/c/dashboard", icon: "📊" },
  { label: "我的名片", path: "/c/card", icon: "🪪" },
  { label: "经历管理", path: "/c/experience", icon: "📋" },
  { label: "AI分身", path: "/c/avatar", icon: "🤖" },
  { label: "分享管理", path: "/c/share", icon: "🔗" },
  { label: "账号设置", path: "/c/settings", icon: "⚙️" },
];

export function CSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 min-h-screen flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-[#1a73e8] flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-bold text-gray-900">AI智能履历</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(item => {
          const active = pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-[#1a73e8]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-[#1a73e8]">
            {user?.name?.[0] || user?.phone?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "用户"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.phone || ""}</p>
          </div>
        </div>
        <button
          onClick={async () => { await logout(); router.push("/"); }}
          className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
