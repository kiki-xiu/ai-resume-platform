"use client";

import { useState, useEffect } from "react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success) setReviews(data.reviews || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleReview = async (id: number, status: string) => {
    const comment = status === "rejected" ? prompt("请输入驳回原因：") : "";
    if (status === "rejected" && !comment) return;

    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, comment }),
      });
      fetchReviews();
    } catch {}
  };

  const filtered = filter === "all" ? reviews : reviews.filter(r => r.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">审核管理</h1>
        <div className="flex gap-2">
          {[
            { key: "all", label: "全部" },
            { key: "pending", label: "待审核" },
            { key: "approved", label: "已通过" },
            { key: "rejected", label: "已驳回" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                filter === f.key ? "bg-[#1a73e8] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">暂无审核记录</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-3 font-medium">用户</th>
                <th className="px-6 py-3 font-medium">类型</th>
                <th className="px-6 py-3 font-medium">AI结果</th>
                <th className="px-6 py-3 font-medium">风险等级</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium">时间</th>
                <th className="px-6 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{r.users?.name || "未知"}</div>
                    <div className="text-xs text-gray-400">{r.users?.phone || ""}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 capitalize">{r.review_type}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.ai_result === "pass" ? "bg-green-50 text-green-600" :
                      r.ai_result === "flag" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"
                    }`}>
                      {r.ai_result === "pass" ? "通过" : r.ai_result === "flag" ? "标记" : "失败"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.risk_level === "low" ? "bg-green-50 text-green-600" :
                      r.risk_level === "medium" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"
                    }`}>
                      {r.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === "approved" ? "bg-green-50 text-green-600" :
                      r.status === "rejected" ? "bg-red-50 text-red-500" : "bg-yellow-50 text-yellow-600"
                    }`}>
                      {r.status === "approved" ? "已通过" : r.status === "rejected" ? "已驳回" : "待审核"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("zh-CN") : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {r.status === "pending" && r.manual_review_status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleReview(r.id, "approved")}
                          className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs border border-green-200 hover:bg-green-100">
                          通过
                        </button>
                        <button onClick={() => handleReview(r.id, "rejected")}
                          className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs border border-red-200 hover:bg-red-100">
                          驳回
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
