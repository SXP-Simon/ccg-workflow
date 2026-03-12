---
layout: home

hero:
  name: CCG
  text: 让三个 AI 帮你写代码
  tagline: Claude 当指挥，Codex 写后端，Gemini 写前端。你只管提需求。
  image:
    src: /logo.svg
    alt: CCG
  actions:
    - theme: brand
      text: 三分钟上手
      link: /guide/getting-started
    - theme: alt
      text: 看看有哪些命令
      link: /guide/commands
    - theme: alt
      text: GitHub
      link: https://github.com/fengshao1227/ccg-workflow

features:
  - icon: 🔀
    title: 前端后端自动分流
    details: 你说"改登录页"，任务自动给 Gemini；你说"加个接口"，任务自动给 Codex。不用操心谁干什么。
  - icon: 🔒
    title: Claude 全程把关
    details: Codex 和 Gemini 只能返回 Patch，最终由 Claude 审核才能写入文件。你的代码库永远在控制之中。
  - icon: 📐
    title: 不让 AI 自由发挥
    details: 集成 OPSX 规范驱动，需求先变成约束条件，AI 只能在框框里干活。
  - icon: 👥
    title: 多人干活，一起写
    details: Agent Teams 模式下，多个 Builder 同时写不同模块的代码，完了还有双模型交叉审查。
  - icon: ⚡
    title: 一行装完，开箱即用
    details: npx ccg-workflow，28 个命令直接可用。macOS、Linux、Windows 都行。
  - icon: 🧩
    title: MCP 生态打通
    details: ace-tool、fast-context、Context7 等 MCP 工具一键配置，Codex 和 Gemini 自动同步。
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
