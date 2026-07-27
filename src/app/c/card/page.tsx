"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const templates = [
  { id: 1, name: "经典商务", color: "#1a73e8", bg: "bg-blue-500", tag: "通用" },
  { id: 2, name: "互联网极客", color: "#00695c", bg: "bg-teal-600", tag: "IT" },
  { id: 3, name: "学术风范", color: "#1565c0", bg: "bg-blue-700", tag: "教育" },
  { id: 4, name: "金融精英", color: "#1b5e20", bg: "bg-green-800", tag: "金融" },
  { id: 5, name: "创意设计", color: "#e91e63", bg: "bg-pink-500", tag: "设计" },
  { id: 6, name: "数字前沿", color: "#283593", bg: "bg-indigo-800", tag: "IT" },
];

export default function CardPage() {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [card, setCard] = useState({
    title: "",
    position: "",
    company: "",
    contact_email: "",
    contact_phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push("/login");
  }, [loading, isLoggedIn, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/c/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...card, template_id: selectedTemplate }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">我的名片</h1>
        <p className="text-sm text-gray-500 mt-1">选择模板并填写你的基本信息</p>
      </div>

      {/* Template Selection */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">选择名片模板</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`rounded-xl p-4 text-center transition-all border-2 ${
                selectedTemplate === t.id ? "border-blue-500 shadow-md" : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <div className={`${t.bg} w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center text-white text-lg font-bold`}>
                {t.name[0]}
              </div>
              <div className="text-xs font-medium text-gray-700">{t.name}</div>
              <div className="text-[10px] text-gray-400">{t.tag}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">名片信息</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: "title", label: "一句话简介", placeholder: "如：5年后端开发经验" },
            { key: "position", label: "当前职位", placeholder: "如：高级后端工程师" },
            { key: "company", label: "公司/学校", placeholder: "如：字节跳动" },
            { key: "contact_email", label: "联系邮箱", placeholder: "your@email.com" },
            { key: "contact_phone", label: "联系电话", placeholder: "手机号（可选）" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input
                type="text"
                value={(card as any)[f.key]}
                onChange={e => setCard({ ...card, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm"
              />
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <div className="text-xs text-gray-500 mb-2">预览</div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm">
              {user.name?.[0] || "?"}
            </div>
            <div>
              <div className="font-bold text-gray-900">{user.name || "你的姓名"}</div>
              <div className="text-sm text-gray-600">{card.position || "当前职位"} {card.company ? `· ${card.company}` : ""}</div>
              <div className="text-xs text-gray-400 mt-0.5">{card.title || "一句话简介"}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all ${
              saving ? "bg-blue-300" : "bg-[#1a73e8] hover:bg-[#1557b0]"
            }`}
          >
            {saving ? "保存中..." : saved ? "✓ 已保存" : "保存名片"}
          </button>
        </div>
      </div>
    </div>
  );
}
