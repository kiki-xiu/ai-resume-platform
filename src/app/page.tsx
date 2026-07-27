"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "核心功能", href: "#features" },
    { label: "使用流程", href: "#how-it-works" },
    { label: "关于我们", href: "#about" },
  ];

  const features = [
    {
      icon: "🤖",
      title: "AI分身",
      desc: "基于你的全部经历数据生成AI分身，面试官可与它深度对话了解你",
      bg: "bg-blue-50", color: "text-blue-600",
    },
    {
      icon: "🛡️",
      title: "合规认证",
      desc: "身份认证+学历认证，让面试官对你的信息产生信任",
      bg: "bg-yellow-50", color: "text-yellow-600",
    },
    {
      icon: "🔗",
      title: "安全分享",
      desc: "临时访问码+信息隐藏，精准控制谁能看到什么",
      bg: "bg-green-50", color: "text-green-600",
    },
    {
      icon: "💬",
      title: "先聊再面",
      desc: "面试官无需注册，输入ID+访问码即可与你的AI分身对话",
      bg: "bg-red-50", color: "text-red-600",
    },
  ];

  const steps = [
    { step: "01", title: "注册认证", desc: "手机号注册，完成身份认证，建立可信档案" },
    { step: "02", title: "录入经历", desc: "上传简历AI自动解析，或手动完善你的完整履历" },
    { step: "03", title: "生成分享", desc: "生成AI分身，创建访问码，分享给心仪的企业" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-8 h-8 rounded-lg bg-[#1a73e8] flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-lg text-gray-900">AI智能履历</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-[#1a73e8] transition-colors">
                {l.label}
              </a>
            ))}
            <button onClick={() => router.push("/login")}
              className="px-5 py-2 bg-[#1a73e8] text-white text-sm font-semibold rounded-full hover:bg-[#1557b0] transition-all">
              开始使用
            </button>
          </div>
          <button className="md:hidden text-gray-700" onClick={() => setMobileMenu(!mobileMenu)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              {mobileMenu
                ? <path d="M18 6L6 18M6 6l12 12" />
                : <><path d="M4 6h16M4 12h16M4 18h16" /></>
              }
            </svg>
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-3 animate-fade-in">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="block text-sm text-gray-700 py-1" onClick={() => setMobileMenu(false)}>
                {l.label}
              </a>
            ))}
            <button onClick={() => router.push("/login")}
              className="w-full py-2.5 bg-[#1a73e8] text-white text-sm font-semibold rounded-full">
              开始使用
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden">
        <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full bg-yellow-400/5 blur-[80px]" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[80px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full text-sm text-[#1a73e8] font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#1a73e8] animate-pulse" />
            AI驱动的人才展示新方式
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900 mb-5">
            你的<span className="bg-gradient-to-r from-[#1a73e8] to-[#fbbc04] bg-clip-text text-transparent">AI分身</span>
            <br />替你先面试
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
            基于个人经历生成AI分身，面试官可通过ID+临时访问码与你的AI分身对话，
            在正式面试前就深度了解你的能力。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => router.push("/login")}
              className="px-8 py-3.5 bg-[#1a73e8] text-white font-semibold rounded-full hover:bg-[#1557b0] transition-all shadow-lg shadow-blue-500/20 text-base">
              免费创建我的AI分身
            </button>
            <a href="#features"
              className="px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-full border border-gray-300 hover:border-gray-400 transition-all text-base">
              了解更多
            </a>
          </div>

          {/* Demo chat */}
          <div className="mt-16 max-w-2xl mx-auto bg-white rounded-2xl shadow-[0_20px_80px_rgba(26,115,232,0.12)] border border-gray-200 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-gray-400 font-medium">AI分身对话演示</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-sm text-[#1a73e8] font-semibold">面</div>
                <div className="bg-gray-50 rounded-xl rounded-tl-none px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-gray-700">请介绍一下你在字节跳动期间主导的最有影响力的项目。</p>
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-[#1a73e8] rounded-xl rounded-tr-none px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-white leading-relaxed">
                    我在字节跳动担任后端技术负责人期间，主导了抖音直播推荐系统的重构项目，将推荐响应延迟降低了40%，同时支撑了每日2亿+的请求量。
                    <br />
                    <span className="text-yellow-300 text-xs mt-2 block">🟢 经认证信息 · 字节跳动在职认证</span>
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center flex-shrink-0 text-sm text-white font-semibold">AI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">核心功能</h2>
            <p className="text-gray-500 max-w-lg mx-auto">四大核心模块，重新定义你的职业展示方式</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center text-2xl`}>{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">三步开始使用</h2>
            <p className="text-gray-500">简单三步，让你的AI分身开始替你面试</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center relative">
                {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-gray-300" />}
                <div className="w-16 h-16 rounded-full bg-[#1a73e8] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 relative z-10">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#1a73e8] to-[#1557b0] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">准备好让AI替你面试了吗？</h2>
          <p className="text-blue-200 mb-8">数千名求职者正在使用AI智能履历平台获取更多面试机会</p>
          <button onClick={() => router.push("/login")}
            className="px-10 py-4 bg-white text-[#1a73e8] font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl text-lg">
            免费开始使用
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#1a73e8] flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <span className="font-semibold text-gray-800">AI智能履历平台</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700">隐私政策</a>
            <a href="#" className="hover:text-gray-700">服务条款</a>
            <a href="#" className="hover:text-gray-700">帮助中心</a>
          </div>
          <p className="text-xs text-gray-400">© 2026 AI智能履历平台</p>
        </div>
      </footer>
    </div>
  );
}
