"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface ExperienceItem {
  id?: number;
  type: "work" | "education";
  organization: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements: string;
  skills: string[];
  visibility: "public" | "hidden" | "cert_only";
}

const emptyExp = (type: "work" | "education"): ExperienceItem => ({
  type, organization: "", role: "", start_date: "", end_date: "",
  description: "", achievements: "", skills: [], visibility: "public",
});

export default function ExperiencePage() {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ExperienceItem>(emptyExp("work"));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push("/login");
  }, [loading, isLoggedIn, router]);

  const fetchExperiences = async () => {
    try {
      const res = await fetch("/api/c/experience");
      const data = await res.json();
      if (data.success) setExperiences(data.experiences || []);
    } catch {}
  };

  useEffect(() => { if (isLoggedIn) fetchExperiences(); }, [isLoggedIn]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/c/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchExperiences();
      }
    } catch {}
    setSaving(false);
  };

  const startEdit = (exp?: ExperienceItem) => {
    setEditing(exp || emptyExp("work"));
    setShowForm(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">经历管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理你的工作和教育经历</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => startEdit(emptyExp("education"))}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            + 教育经历
          </button>
          <button onClick={() => startEdit(emptyExp("work"))}
            className="px-4 py-2 bg-[#1a73e8] text-white rounded-xl text-sm font-medium hover:bg-[#1557b0]">
            + 工作经历
          </button>
        </div>
      </div>

      {/* Experience List */}
      {experiences.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm">还没有录入经历</p>
          <p className="text-gray-400 text-xs mt-1">添加你的工作或教育经历，AI分身将基于这些信息生成</p>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    exp.type === "work" ? "bg-blue-50" : "bg-green-50"
                  }`}>
                    {exp.type === "work" ? "💼" : "🎓"}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{exp.role}</div>
                    <div className="text-sm text-gray-600">{exp.organization}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {exp.start_date} ~ {exp.end_date || "至今"}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-500 mt-2">{exp.description}</p>
                    )}
                    {exp.skills.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {exp.skills.map((s, j) => (
                          <span key={j} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  exp.visibility === "public" ? "bg-green-50 text-green-600" :
                  exp.visibility === "hidden" ? "bg-red-50 text-red-500" : "bg-yellow-50 text-yellow-600"
                }`}>
                  {exp.visibility === "public" ? "公开" : exp.visibility === "hidden" ? "隐藏" : "认证可见"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {editing.type === "work" ? "工作经历" : "教育经历"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3.5">
              {[
                { key: "organization", label: editing.type === "work" ? "公司名称" : "学校名称", ph: editing.type === "work" ? "如：字节跳动" : "如：北京大学" },
                { key: "role", label: editing.type === "work" ? "职位" : "专业", ph: editing.type === "work" ? "如：高级后端工程师" : "如：计算机科学与技术" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input type="text" value={(editing as any)[f.key] || ""}
                    onChange={e => setEditing({ ...editing, [f.key]: e.target.value })}
                    placeholder={f.ph}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "start_date", label: "开始时间", type: "month" },
                  { key: "end_date", label: "结束时间", type: "month" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                    <input type={f.type} value={(editing as any)[f.key] || ""}
                      onChange={e => setEditing({ ...editing, [f.key]: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">工作描述</label>
                <textarea value={editing.description}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  rows={3} placeholder="描述你的工作内容和职责"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">量化成果</label>
                <textarea value={editing.achievements}
                  onChange={e => setEditing({ ...editing, achievements: e.target.value })}
                  rows={2} placeholder="如：提升效率30%，节省成本100万"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">技能标签（逗号分隔）</label>
                <input type="text" value={editing.skills.join(", ")}
                  onChange={e => setEditing({ ...editing, skills: e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean) })}
                  placeholder="如：Python, 机器学习, 项目管理"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">可见性</label>
                <select value={editing.visibility}
                  onChange={e => setEditing({ ...editing, visibility: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm">
                  <option value="public">公开</option>
                  <option value="hidden">隐藏（面试官不可见）</option>
                  <option value="cert_only">仅认证后可见</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">
                取消
              </button>
              <button onClick={handleSave} disabled={saving}
                className={`px-5 py-2.5 rounded-xl text-white text-sm font-medium ${
                  saving ? "bg-blue-300" : "bg-[#1a73e8] hover:bg-[#1557b0]"
                }`}>
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
