---
layout: home

hero:
  name: CCG
  text: Claude + Codex + Gemini
  tagline: 多模型协作开发系统 — Claude 编排，Codex 后端，Gemini 前端
  image:
    src: /logo.svg
    alt: CCG
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 命令参考
      link: /guide/commands
    - theme: alt
      text: GitHub
      link: https://github.com/fengshao1227/ccg-workflow

features:
  - icon: 🔀
    title: 零配置模型路由
    details: 前端任务自动走 Gemini，后端任务自动走 Codex，无需手动切换模型。
  - icon: 🔒
    title: 安全设计
    details: 外部模型无写入权限，仅返回 Patch，由 Claude 审核后应用。
  - icon: 🛠️
    title: 28 个斜杠命令
    details: 从规划到执行、Git 工作流到代码审查，通过 /ccg:* 一站式访问。
  - icon: 📐
    title: 规范驱动开发
    details: 集成 OPSX，将模糊需求变成可验证约束，让 AI 没法自由发挥。
  - icon: 👥
    title: Agent Teams 并行
    details: spawn 多个 Builder teammates 并行写代码，适合 3+ 独立模块的任务。
  - icon: 📦
    title: 一键安装
    details: npx ccg-workflow 一行命令，支持 macOS、Linux、Windows 三平台。
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe50 50%, #47caff50 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
