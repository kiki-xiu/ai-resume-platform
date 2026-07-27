"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("admin_token", "authenticated");
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "登录失败");
      }
    } catch {
      setError("网络错误");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1a73e8] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-xl font-bold text-white">管理后台</h1>
          <p className="text-gray-400 text-sm mt-1">AI智能履历平台</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">管理员账号</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="输入管理员账号"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="输入密码"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 outline-none text-sm" />
          </div>

          {error && <div className="text-red-400 text-sm bg-red-900/30 rounded-lg px-4 py-2.5 border border-red-800">{error}</div>}

          <button type="submit" disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold text-sm ${
              loading ? "bg-blue-400" : "bg-[#1a73e8] hover:bg-[#1557b0]"
            }`}>
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
