"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user, loading, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push("/login");
  }, [loading, isLoggedIn, router]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">账号设置</h1>
        <p className="text-sm text-gray-500 mt-1">管理你的账号信息</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">基本信息</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <div className="text-sm text-gray-500">姓名</div>
              <div className="text-sm font-medium text-gray-900">{user.name || "未设置"}</div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <div className="text-sm text-gray-500">手机号</div>
              <div className="text-sm font-medium text-gray-900">{user.phone}</div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">已验证</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm text-gray-500">身份认证</div>
              <div className="text-sm font-medium text-gray-900">
                {user.identity_verified ? "已认证" : "未认证"}
              </div>
            </div>
            {!user.identity_verified && (
              <button className="px-4 py-1.5 bg-[#1a73e8] text-white text-xs rounded-lg hover:bg-[#1557b0]">
                去认证
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-sm font-semibold text-red-700 mb-2">危险操作</h2>
        <p className="text-xs text-gray-500 mb-4">退出登录或注销账号</p>
        <div className="flex gap-3">
          <button
            onClick={async () => { await logout(); router.push("/"); }}
            className="px-5 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
