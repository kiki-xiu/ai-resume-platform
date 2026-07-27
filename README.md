# AI智能履历平台

面向求职者的AI智能履历平台。基于个人经历生成AI分身，面试官可通过ID+临时访问码与AI分身对话了解求职者。

## 技术栈

- **前端/后端**: Next.js 16 + TypeScript + TailwindCSS v4
- **数据库**: Supabase PostgreSQL
- **AI**: DeepSeek API
- **部署**: Vercel + Supabase

## 快速开始

### 1. 环境要求
- Node.js 20.9+, npm 10+

### 2. 安装依赖
```bash
npm install
```

### 3. 环境变量
创建 `.env.local`（已存在），确认内容正确：
```
NEXT_PUBLIC_SUPABASE_URL=https://xqhwjxgxhujsxrkjqnzp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<你的anon_key>
DEEPSEEK_API_KEY=<你的DeepSeek API Key>
```

### 4. 设置数据库
在 **Supabase SQL Editor** 中运行 `supabase-migration.sql`：
1. 打开 https://supabase.com/dashboard (GitHub登录)
2. 选项目 → SQL Editor → 粘贴并运行迁移脚本

### 5. 启动
```bash
npm run dev
```
访问 http://localhost:3000

### 管理员账号
- 用户名: `admin` | 密码: `admin123`


## 项目结构

```
src/app/
├── page.tsx          # 门户首页
├── login/            # 登录/注册
├── c/                # C端（求职者）
│   ├── dashboard/    # 总览
│   ├── card/         # 名片管理
│   ├── experience/   # 经历管理
│   ├── avatar/       # AI分身+调试对话
│   ├── share/        # 分享管理
│   └── settings/     # 账号设置
├── b/                # B端（面试官）
│   ├── enter/        # 验证入口
│   └── profile/      # 候选人页+AI对话
├── admin/            # 管理端
│   ├── login/        # 管理员登录
│   ├── dashboard/    # 数据看板
│   ├── users/        # 用户管理
│   ├── reviews/      # 审核管理
│   └── config/       # 站点配置
└── api/              # API路由（auth, cards, experience, access-codes, conversations, reviews, admin）
```

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 https://vercel.com 导入仓库
3. 设置环境变量
4. 自动部署

## API安全
DeepSeek API Key 仅在服务器端 `.env.local` 中，通过 API Routes 代理调用，前端不暴露。
