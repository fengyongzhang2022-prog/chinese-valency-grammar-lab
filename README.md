# 汉语配价语法智能实验室

一个单文件 HTML 网站，用配价语法作为主轴，联动格语法、依存语法、话题-述题结构和 θ-角色理论，对中文句子进行可视化分析。

## 文件

- `index.html`：可直接打开的静态网页，也可部署到 GitHub Pages。
- `api/deepseek-grammar.example.mjs`：DeepSeek 服务端代理示例。

## DeepSeek API 说明

不要把 DeepSeek API Key 写进 `index.html`。GitHub Pages 是纯静态托管，浏览器端请求会暴露密钥。

推荐做法：

1. 前端继续调用 `/api/deepseek-grammar`。
2. 用 Vercel、Netlify Functions、Cloudflare Workers 或自己的服务器实现代理。
3. 在服务端环境变量中设置 `DEEPSEEK_API_KEY`。

没有服务端代理时，页面会自动回退到本地规则分析。

## 本地使用

直接双击 `index.html` 即可打开。

## GitHub Pages

推送仓库后，在 GitHub 仓库设置中启用 Pages：

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/root`
