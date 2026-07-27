"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function CandidateDashboard() {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/c/dashboard").then(r => r.json()).then(d => {
        if (d.success) setStats(d);
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const statusCards = [
    {
      label: "身份认证",
      done: user.identity_verified,
      desc: user.identity_verified ? "已认证" : "未认证",
      color: user.identity_verified ? "bg-green-50 text-green-600 border-green-200" : "bg-yellow-50 text-yellow-600 border-yellow-200",
      icon: "🛡️",
    },
    {
      label: "AI分身",
      done: false,
      desc: "未创建",
      color: "bg-gray-50 text-gray-500 border-gray-200",
      icon: "🤖",
    },
    {
      label: "名片状态",
      done: false,
      desc: "未创建",
      color: "bg-gray-50 text-gray-500 border-gray-200",
      icon: "🪪",
    },
    {
      label: "审核状态",
      done: false,
      desc: "未提交",
      color: "bg-gray-50 text-gray-500 border-gray-200",
      icon: "✅",
    },
  ];

  const quickActions = [
    { label: "完善个人名片", desc: "选择模板，填写基础信息", path: "/c/card", emoji: "🪪" },
    { label: "录入工作经历", desc: "添加工作/教育经历", path: "/c/experience", emoji: "📋" },
    { label: "创建AI分身", desc: "基于经历生成AI分身", path: "/c/avatar", emoji: "🤖" },
    { label: "分享给面试官", desc: "生成访问码并分享", path: "/c/share", emoji: "🔗" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">欢迎回来{user.name ? `，${user.name}` : ""}</h1>
        <p className="text-sm text-gray-500 mt-1">管理和完善你的AI智能履历</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((c, i) => (
          <div key={i} className={`rounded-xl border p-4 ${c.color}`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-sm font-medium">{c.label}</div>
            <div className="text-xs mt-0.5 opacity-75">{c.desc}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">快速操作</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {quickActions.map((a, i) => (
            <button
              key={i}
              onClick={() => router.push(a.path)}
              className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-blue-200 hover:shadow-sm transition-all flex items-start gap-4"
            >
              <span className="text-2xl">{a.emoji}</span>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{a.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">最近动态</h2>
        <div className="text-sm text-gray-400 text-center py-8">
          完成身份认证和名片创建后，你的活动记录将显示在这里
        </div>
      </div>
    </div>
  );
}
