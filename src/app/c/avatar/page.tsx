"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AvatarPage() {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<string>("not_created");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push("/login");
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/c/avatar").then(r => r.json()).then(d => {
        if (d.success && d.avatar) setStatus(d.avatar.status);
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/submit", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setStatus("reviewing");
      } else {
        alert(data.error || "提交失败");
      }
    } catch {}
    setSubmitting(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || sending) return;
    const msg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setSending(true);

    try {
      const res = await fetch("/api/conversations/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          userId: user?.id,
          accessCodeId: null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "⚠️ " + data.error }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ 网络错误，请重试" }]);
    }
    setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI分身</h1>
        <p className="text-sm text-gray-500 mt-1">基于你的经历生成AI分身，可模拟面试对话</p>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
              status === "approved" ? "bg-green-50" : status === "reviewing" ? "bg-yellow-50" : "bg-gray-50"
            }`}>
              🤖
            </div>
            <div>
              <div className="font-semibold text-gray-900">AI分身状态</div>
              <div className="text-sm text-gray-500">
                {status === "not_created" && "未创建 — 请先录入经历后提交审核"}
                {status === "reviewing" && "审核中 — AI正在审核你的信息"}
                {status === "approved" && "已通过 — AI分身可被面试官访问"}
                {status === "rejected" && "未通过 — 请修改后重新提交"}
                {status === "training" && "训练中 — AI分身正在生成"}
              </div>
            </div>
          </div>
          {status !== "approved" && status !== "reviewing" && (
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold ${
                submitting ? "bg-blue-300" : "bg-[#1a73e8] hover:bg-[#1557b0]"
              }`}
            >
              {submitting ? "提交中..." : "提交审核"}
            </button>
          )}
          {status === "approved" && (
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">✓ 已通过</span>
          )}
        </div>
      </div>

      {/* Chat Preview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">AI分身对话调试</span>
          <span className="text-xs text-gray-400">模拟面试官视角</span>
        </div>

        {status === "not_created" ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500 text-sm">请先录入工作经历，然后提交审核</p>
            <p className="text-gray-400 text-xs mt-1">通过审核后，你可以在这里模拟面试官与AI分身对话</p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
                  在下方输入问题，模拟面试官与你的AI分身对话
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">AI</div>
                  )}
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-xl text-sm ${
                    m.role === "user"
                      ? "bg-[#1a73e8] text-white rounded-tr-none"
                      : "bg-gray-50 text-gray-700 rounded-tl-none"
                  }`}>
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-xs text-[#1a73e8] font-bold">我</div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t border-gray-100 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                placeholder="输入面试官可能问的问题..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !input.trim()}
                className={`px-5 py-2.5 rounded-xl text-white text-sm font-medium ${
                  sending || !input.trim() ? "bg-blue-300" : "bg-[#1a73e8] hover:bg-[#1557b0]"
                }`}
              >
                发送
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
