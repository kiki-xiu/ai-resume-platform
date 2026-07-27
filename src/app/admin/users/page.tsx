"use client";

import { useState, useEffect } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleUser = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchUsers();
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative">
            <input type="text" placeholder="搜索用户（手机号/姓名）..."
              className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" />
          </div>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">暂无用户数据</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-3 font-medium">用户</th>
                <th className="px-6 py-3 font-medium">手机号</th>
                <th className="px-6 py-3 font-medium">认证</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium">注册时间</th>
                <th className="px-6 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-[#1a73e8]">
                        {u.name?.[0] || u.phone?.[0] || "?"}
                      </div>
                      <span className="font-medium text-gray-900">{u.name || "未命名"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{u.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.identity_verified ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                    }`}>
                      {u.identity_verified ? "已认证" : "未认证"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.status === "active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                    }`}>
                      {u.status === "active" ? "正常" : "已禁用"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("zh-CN") : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggleUser(u.id, u.status)}
                      className={`text-xs px-3 py-1 rounded-lg border ${
                        u.status === "active"
                          ? "border-red-200 text-red-500 hover:bg-red-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}>
                      {u.status === "active" ? "禁用" : "启用"}
                    </button>
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
