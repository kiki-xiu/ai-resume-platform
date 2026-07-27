"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Message {
  role: "visitor" | "ai_avatar";
  content: string;
}

function CandidateProfileInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = searchParams.get("cardId");
  const code = searchParams.get("code");

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai_avatar", content: "你好！我是候选人的AI分身，你可以问我关于他/她的工作经历、技能、项目经验等问题。" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [accessCodeId, setAccessCodeId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [chatEnded, setChatEnded] = useState(false);

  useEffect(() => {
    if (!cardId || !code) {
      router.push("/b/enter");
      return;
    }

    // Verify and fetch profile
    const init = async () => {
      try {
        const verifyRes = await fetch("/api/b/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId, code }),
        });
        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
          setError(verifyData.error || "验证失败");
          setLoading(false);
          return;
        }

        setAccessCodeId(verifyData.accessCodeId);
        setUserId(verifyData.userId);

        const profileRes = await fetch("/api/b/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId }),
        });
        const profileData = await profileRes.json();

        if (profileData.success) {
          setProfile(profileData.profile);
        } else {
          setError("无法加载候选人信息");
        }
      } catch {
        setError("加载失败");
      }
      setLoading(false);
    };

    init();
  }, [cardId, code, router]);

  const handleSendMessage = async () => {
    if (!input.trim() || sending || chatEnded) return;
    const msg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "visitor", content: msg }]);
    setSending(true);

    try {
      const res = await fetch("/api/conversations/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          userId,
          accessCodeId,
          conversationId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: "ai_avatar", content: data.response }]);
        setConversationId(data.conversationId);
      } else {
        setMessages(prev => [...prev, { role: "ai_avatar", content: "⚠️ " + (data.error || "服务暂时不可用") }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai_avatar", content: "⚠️ 网络错误" }]);
    }
    setSending(false);
  };

  const handleEndChat = async () => {
    setChatEnded(true);
    if (conversationId) {
      try {
        const res = await fetch("/api/b/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }),
        });
        const data = await res.json();
        if (data.success) setSummary(data.summary);
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">验证身份中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">访问受限</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button onClick={() => router.push("/b/enter")}
            className="px-6 py-3 bg-[#1a73e8] text-white rounded-xl font-medium text-sm">
            重新验证
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left: Profile Info */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto flex-shrink-0 hidden md:block">
        {profile && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-[#1a73e8] mx-auto mb-3">
                {profile.user.name?.[0] || "?"}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{profile.user.name || "候选人"}</h2>
              <p className="text-sm text-gray-500">{profile.card.position} {profile.card.company ? `· ${profile.card.company}` : ""}</p>
              {profile.user.identity_verified && (
                <span className="inline-block mt-2 px-3 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                  🛡️ 身份已认证
                </span>
              )}
              {profile.card.title && (
                <p className="text-xs text-gray-400 mt-3">{profile.card.title}</p>
              )}
            </div>

            {/* Experiences */}
            <div>
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">经历</h3>
              <div className="space-y-4">
                {profile.experiences.map((exp: any, i: number) => (
                  <div key={i} className="relative pl-4 border-l-2 border-gray-200">
                    <div className={`absolute left-[-5px] top-1 w-2 h-2 rounded-full ${
                      exp.type === "work" ? "bg-blue-400" : "bg-green-400"
                    }`} />
                    <div className="text-sm font-medium text-gray-900">{exp.role}</div>
                    <div className="text-xs text-gray-500">{exp.organization}</div>
                    <div className="text-xs text-gray-400">{exp.start_date} ~ {exp.end_date || "至今"}</div>
                    {exp.skills?.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {exp.skills.map((s: string, j: number) => (
                          <span key={j} className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Chat */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-base font-bold text-[#1a73e8]">
              {profile?.user.name?.[0] || "?"}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{profile?.user.name || "候选人"}</div>
              <div className="text-xs text-gray-400">AI分身对话中</div>
            </div>
          </div>
          {!chatEnded && (
            <button onClick={handleEndChat}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              结束对话
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-3 ${m.role === "visitor" ? "justify-end" : ""}`}>
              {m.role === "ai_avatar" && (
                <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">AI</div>
              )}
              <div className={`max-w-[70%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                m.role === "visitor"
                  ? "bg-[#1a73e8] text-white rounded-tr-none"
                  : "bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm"
              }`}>
                {m.content}
              </div>
              {m.role === "visitor" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs text-gray-600 font-bold">面</div>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-gray-400 text-sm ml-11">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          )}
        </div>

        {/* Chat Summary */}
        {chatEnded && summary && (
          <div className="mx-6 mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <h3 className="text-sm font-semibold text-green-800 mb-2">📋 对话摘要</h3>
            <div className="space-y-2 text-xs text-green-700">
              {summary.core_skills?.length > 0 && (
                <div>
                  <span className="font-medium">核心能力：</span>
                  {summary.core_skills.join("、")}
                </div>
              )}
              {summary.project_highlights?.length > 0 && (
                <div>
                  <span className="font-medium">项目亮点：</span>
                  {summary.project_highlights.join("、")}
                </div>
              )}
              {summary.summary_text && (
                <div>
                  <span className="font-medium">总结：</span>
                  {summary.summary_text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        {!chatEnded ? (
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex gap-3 max-w-4xl">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                placeholder="输入你的问题，了解候选人的经历和能力..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm"
              />
              <button onClick={handleSendMessage} disabled={sending || !input.trim()}
                className={`px-6 py-3 rounded-xl text-white text-sm font-semibold ${
                  sending || !input.trim() ? "bg-blue-300" : "bg-[#1a73e8] hover:bg-[#1557b0]"
                }`}>
                发送
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <button onClick={() => router.push("/b/enter")}
              className="px-6 py-2.5 bg-[#1a73e8] text-white rounded-xl text-sm font-medium">
              验证新的候选人
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateProfile() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    }>
      <CandidateProfileInner />
    </Suspense>
  );
}
