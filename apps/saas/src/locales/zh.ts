import type { Messages } from "../lib/i18n";

/**
 * Chinese dictionary — must satisfy the `en` shape. Keys mirror
 * `src/locales/en.ts`; see `src/lib/i18n.ts` for how to add more.
 */
export const zh: Messages = {
  nav: {
    blog: "博客",
    docs: "文档",
    changelog: "更新日志",
    showcase: "案例展示",
    tools: "工具",
    commits: "提交记录",
    pricing: "定价",
    login: "登录",
    getStarted: "开始使用",
    language: "语言",
  },
  home: {
    hero: {
      badge: "Cloudflare 原生 SaaS 模板",
      titleA: "交付你的 SaaS，",
      titleB: "就在边缘网络上。",
      subtitle:
        "注册、订阅、消耗额度——认证、计费、AI 游乐场、文件存储和数据库已经在 Cloudflare Workers 上接好。",
      getStarted: "开始使用",
      viewPricing: "查看定价",
      haveAccount: "已有账号？",
      login: "登录",
      socialProof: "受到在边缘网络上交付产品的开发者信任",
    },
  },
  common: {
    save: "保存",
    cancel: "取消",
    delete: "删除",
    loading: "加载中…",
  },
};
