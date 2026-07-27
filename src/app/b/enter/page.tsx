"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InterviewerEntry() {
  const router = useRouter();
  const [cardId, setCardId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!cardId || !code) {
      setError("请输入名片ID和访问码");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/b/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, code }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/b/profile?cardId=${cardId}&code=${code}`);
      } else {
        setError(data.error || "访问码无效或已过期");
      }
    } catch {
      setError("验证失败，请重试");
    }
    setLoading(false);
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
          <p className="text-gray-500 text-sm mt-2">面试官入口 · 输入候选人分享的信息</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">验证身份</h2>
          <p className="text-sm text-gray-500 mb-6">请输入候选人分享给你的名片ID和临时访问码</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">名片ID</label>
              <input
                type="text"
                value={cardId}
                onChange={e => setCardId(e.target.value)}
                placeholder="输入候选人提供的名片ID"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a73e8] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">临时访问码</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6位数字访问码"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a73e8] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-center text-2xl tracking-[0.5em] font-bold"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2.5 border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all ${
                loading ? "bg-blue-300" : "bg-[#1a73e8] hover:bg-[#1557b0] shadow-lg shadow-blue-200"
              }`}
            >
              {loading ? "验证中..." : "验证并进入"}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">💡 还没有访问码？</h4>
            <p className="text-xs text-gray-500">联系候选人，请他们在平台上生成访问码分享给你。面试官无需注册账号。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
