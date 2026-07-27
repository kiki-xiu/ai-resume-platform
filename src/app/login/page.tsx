"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!phone || !password) {
      setError("请填写手机号和密码");
      setLoading(false);
      return;
    }
    if (phone.replace(/\D/g, "").length < 11) {
      setError("请输入正确的手机号");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("密码至少6位");
      setLoading(false);
      return;
    }

    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = tab === "register" ? { phone, password, name } : { phone, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "操作失败");
        setLoading(false);
        return;
      }

      router.push("/c/dashboard");
    } catch (err: any) {
      setError("网络错误，请重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 rounded-xl bg-[#1a73e8] flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">AI智能履历</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">你的AI分身，替你先面试</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="请输入你的姓名"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a73e8] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">手机号</label>
              <div className="flex items-center border border-gray-200 rounded-xl focus-within:border-[#1a73e8] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="pl-4 text-gray-500 text-sm">+86</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="请输入手机号"
                  className="w-full px-3 py-3 outline-none bg-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={tab === "register" ? "设置密码（至少6位）" : "请输入密码"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a73e8] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2.5 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all ${
                loading ? "bg-blue-300" : "bg-[#1a73e8] hover:bg-[#1557b0] shadow-lg shadow-blue-200"
              }`}
            >
              {loading ? "处理中..." : tab === "login" ? "登录" : "注册并创建"}
            </button>

            {tab === "login" && (
              <p className="text-center text-xs text-gray-400 mt-4">
                还没有账号？
                <button type="button" onClick={() => { setTab("register"); setError(""); }} className="text-[#1a73e8] font-medium ml-1">
                  立即注册
                </button>
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          注册即表示同意 <a href="#" className="text-[#1a73e8]">服务条款</a> 和 <a href="#" className="text-[#1a73e8]">隐私政策</a>
        </p>
      </div>
    </div>
  );
}
