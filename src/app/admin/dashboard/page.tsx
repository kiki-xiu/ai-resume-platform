"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { label: "注册用户", value: stats?.totalUsers || 0, color: "bg-blue-50 text-blue-600 border-blue-200", icon: "👥" },
    { label: "认证用户", value: stats?.verifiedUsers || 0, color: "bg-green-50 text-green-600 border-green-200", icon: "🛡️" },
    { label: "AI分身", value: stats?.aiAvatars || 0, color: "bg-purple-50 text-purple-600 border-purple-200", icon: "🤖" },
    { label: "名片数", value: stats?.cards || 0, color: "bg-yellow-50 text-yellow-600 border-yellow-200", icon: "🪪" },
    { label: "访问码", value: stats?.accessCodes || 0, color: "bg-indigo-50 text-indigo-600 border-indigo-200", icon: "🔑" },
    { label: "对话数", value: stats?.conversations || 0, color: "bg-pink-50 text-pink-600 border-pink-200", icon: "💬" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">数据看板</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`rounded-xl border p-5 ${c.color}`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-sm mt-1 opacity-75">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">系统状态</h2>
        <p className="text-xs text-gray-400">平台运行正常 · 数据实时更新</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          所有服务正常运行
        </div>
      </div>
    </div>
  );
}
