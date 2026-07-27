"use client";

export default function AdminConfig() {
  const configs = [
    { key: "site_name", label: "网站名称", value: "AI智能履历平台", type: "text" },
    { key: "site_announcement", label: "网站公告", value: "", type: "text" },
    { key: "site_contact_email", label: "联系邮箱", value: "", type: "email" },
    { key: "default_access_code_ttl_hours", label: "默认访问码有效期(小时)", value: "168", type: "number" },
    { key: "max_access_code_uses", label: "默认访问码次数", value: "10", type: "number" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">站点配置</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <div className="space-y-5">
          {configs.map(c => (
            <div key={c.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{c.label}</label>
              <input type={c.type} defaultValue={c.value}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
          <span className="text-sm text-blue-700">💡 配置修改后实时生效</span>
        </div>

        <div className="flex justify-end mt-6">
          <button className="px-6 py-2.5 bg-[#1a73e8] text-white rounded-xl text-sm font-semibold hover:bg-[#1557b0]">
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}
