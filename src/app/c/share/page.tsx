"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface AccessCodeItem {
  id: number;
  code: string;
  card_id: string;
  max_uses: number | null;
  current_uses: number;
  expires_at: string;
  status: string;
  created_at: string;
}

export default function SharePage() {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [codes, setCodes] = useState<AccessCodeItem[]>([]);
  const [ttlHours, setTtlHours] = useState(168);
  const [maxUses, setMaxUses] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push("/login");
  }, [loading, isLoggedIn, router]);

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/access-codes/list");
      const data = await res.json();
      if (data.success) setCodes(data.codes || []);
    } catch {}
  };

  useEffect(() => { if (isLoggedIn) fetchCodes(); }, [isLoggedIn]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/access-codes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ttlHours, maxUses }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCode(data.code.code);
        fetchCodes();
        setTimeout(() => setNewCode(null), 60000);
      } else {
        alert(data.error || "生成失败");
      }
    } catch {}
    setGenerating(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  const formatDate = (d: string) => new Date(d).toLocaleString("zh-CN");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">分享管理</h1>
        <p className="text-sm text-gray-500 mt-1">生成临时访问码，分享给面试官</p>
      </div>

      {/* Generate Code */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">生成新的访问码</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">有效期</label>
            <select value={ttlHours} onChange={e => setTtlHours(Number(e.target.value))}
              className="px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none">
              <option value={24}>24小时</option>
              <option value={168}>7天</option>
              <option value={720}>30天</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">最大访问次数</label>
            <select value={maxUses} onChange={e => setMaxUses(Number(e.target.value))}
              className="px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none">
              <option value={5}>5次</option>
              <option value={10}>10次</option>
              <option value={50}>50次</option>
              <option value={0}>不限</option>
            </select>
          </div>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold ${
            generating ? "bg-blue-300" : "bg-[#1a73e8] hover:bg-[#1557b0]"
          }`}>
          {generating ? "生成中..." : "生成访问码"}
        </button>

        {/* New code display */}
        {newCode && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="text-xs text-green-600 font-medium mb-1">✓ 新访问码已生成</div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-900 tracking-widest">{newCode}</span>
              <button onClick={() => handleCopy(newCode)}
                className="px-3 py-1.5 bg-white border border-green-200 rounded-lg text-xs text-green-600 hover:bg-green-50">
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">分享此码给面试官，他们可在官网输入</div>
          </div>
        )}
      </div>

      {/* Code List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">访问码列表</h2>
        </div>
        {codes.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">暂无访问码</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {codes.map(c => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">{c.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === "active" ? "bg-green-50 text-green-600" :
                      c.status === "expired" ? "bg-red-50 text-red-500" :
                      c.status === "exhausted" ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-500"
                    }`}>
                      {c.status === "active" ? "有效" : c.status === "expired" ? "已过期" : c.status === "exhausted" ? "已用尽" : "已撤销"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    使用 {c.current_uses}{c.max_uses ? `/${c.max_uses}` : ""} 次 · 过期于 {formatDate(c.expires_at)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(c.code)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                    复制
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 如何分享</h3>
        <p className="text-xs text-blue-700 leading-relaxed">
          1. 生成访问码后，将下面的信息发给面试官：
        </p>
        <div className="mt-2 p-3 bg-white rounded-lg text-xs font-mono text-gray-600">
          请访问 AI智能履历平台 → 输入名片ID + 访问码即可查看我的档案并与我的AI分身对话
        </div>
        <p className="text-xs text-blue-700 mt-2">
          2. 面试官无需注册，打开官网输入ID+访问码即可
        </p>
      </div>
    </div>
  );
}
