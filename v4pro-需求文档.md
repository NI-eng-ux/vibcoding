# Vibcoding 页面 — 给 v4pro 的需求文档

> 项目路径：`D:\MyCode\vibcoding`
> 当前问题：视频已修好，还剩数据格式 + 部署问题
>
> 阅读对象：另一个 Claude Code 终端（v4pro）
> 你的角色：总指挥，分配任务给各个工具

---

## 工具特长清单（按特长分配）

| 工具 | 特长 | 适合干什么 |
|------|------|-----------|
| **OpenCode 桌面版（v4pro）** | 可视化界面，适合看代码、改代码 | 改文件、新建文件、看代码结构 |
| **OpenCode 终端版（v4pro）** | 终端操作，适合批量处理 | 跑脚本、批量替换、检查文件 |
| **VS Code（v4pro）** | 编辑器 + 终端 | 预览页面、手动微调、跑 git 命令 |
| **Claude Code 终端（v4pro / 你本人）** | 总指挥，协调全局 | 分配任务、检查进度、收尾 |
| **Claude Code 终端（v4lash）** | 出文档、检查问题 | ✅ 已经出了本需求文档，完成后找他检查 |

---

## 要改的 4 件事

### 任务 1：data.js 改成 data.json + 新建 script.js

**分配给：OpenCode 桌面版（v4pro）**

具体要做的事：

**1a. 改 data.js → data.json**
- 把 `D:\MyCode\vibcoding\data.js` 改名 `data.json`
- 去掉 `const githubProjects = [` 、`const viralWorks = [` 、`const techStats = [` 这些 JS 变量声明
- 改成纯 JSON 格式，用 `{}` 包起来：

```json
{
  "githubProjects": [...],
  "viralWorks": [...],
  "techStats": [...]
}
```

**1b. 新建 script.js**
- 在 `D:\MyCode\vibcoding\script.js` 新建文件
- 用 `fetch('data.json')` 加载数据
- 把原来 index.html 底部 `<script>` 标签里所有的渲染代码（渲染 GitHub 卡片、Viral 卡片、筛选、随手翻一个、统计、快捷键等全部逻辑）搬到 script.js 里

**1c. 改 index.html**
- 删掉第 108 行 `<script src="data.js"></script>`
- 改成 `<script src="script.js"></script>`
- 确保页面还能正常打开

**检查方式：** VS Code 双击 index.html 预览，看看卡片显示正不正常

---

### 任务 2：修飞行模拟器的 watchUrl

**分配给：OpenCode 桌面版（v4pro）**

- 打开 `data.json`
- 找到 "飞行模拟器" 那条数据
- 现在的 `watchUrl` 是 `"https://levels.io"`（这是 Pieter Levels 的个人主页，不是飞行模拟器的视频）
- 改成正确的链接：`"https://x.com/levelsio"`（指向他的 Twitter，里面有飞行模拟器的视频演示）

---

### 任务 3：配 GitHub Actions（可选，但建议做）

**分配给：OpenCode 终端版（v4pro）**

在 `D:\MyCode\vibcoding` 下新建：

**3a. 新建 `.github/workflows/update-data.yml`**

内容：
```yaml
name: Update Vibcoding Data
on:
  schedule:
    - cron: '0 0 */2 * *'
  workflow_dispatch:
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node update-data.js
      - run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add data.json
          git diff --cached --quiet || git commit -m "🤖 自动更新数据 $(date +%Y-%m-%d)"
          git push
```

**3b. 新建 update-data.js**

这个脚本负责：
- 用 GitHub Search API 搜索 "vibe coding" 热门项目
- 生成新的 `data.json`（保留 viral 案例和技术栈）
- 搜索关键词：`"vibe coding"`、`"vibecoding"`、`"AI assisted programming"`
- 按 star 数排序取前 12 个
- 保留原有的 `highlights` 和 `inspiration` 字段逻辑

---

### 任务 4：推送到 GitHub + 开 Pages

**分配给：VS Code 终端（v4pro）**

```bash
cd D:\MyCode\vibcoding
git add .
git commit -m "🎉 vibcoding 页面完成：数据格式优化 + GitHub Actions 自动更新"
git push
```

**然后手动操作：**
浏览器打开 GitHub 仓库 → Settings → Pages → Source 选 `main` 分支 → Save

---

## 完成顺序

```
任务 1（OpenCode桌面版）→ 改 data.json + script.js
        ↓
任务 2（OpenCode桌面版）→ 修 watchUrl
        ↓
任务 3（OpenCode终端版）→ 配 GitHub Actions
        ↓
任务 4（VS Code终端）→ git push + 开 Pages
        ↓
找 v4lash（我）检查 ✅
```

---

## 验收标准

| 检查项 | 标准 |
|-------|------|
| ✅ data.json 存在 | 纯 JSON 格式，没有 JS 变量声明 |
| ✅ script.js 存在 | 用 fetch 加载数据，页面正常显示 |
| ✅ index.html 引用 script.js | 没有 data.js 了 |
| ✅ 飞行模拟器 watchUrl 已修 | 不再是 levels.io 主页 |
| ✅ GitHub Actions 已配 | .github/workflows/ 目录下有 yml |
| ✅ 已推送到 GitHub | 仓库里有最新代码 |
| ✅ GitHub Pages 已开 | 能通过网页访问 |

---

## 最后一步

全部完成后，**切回当前对话**（Claude Code + v4lash），说：

> "检查一下 vibcoding 页面"

我会出一份 🔴🟡🟢 问题清单。
