# 田婧作品集网站

这是一个方便长期维护的静态作品集项目，适合直接托管到 GitHub，并且后续继续修改网页内容或替换作品集图片。

## 项目结构

`index.html`
网站页面骨架。

`styles.css`
整站视觉样式，包含版式、色彩、动效和弹窗样式。

`script.js`
页面渲染逻辑、弹窗预览、滚动显现等交互。

`content/site-data.js`
网站主要内容数据。
以后如果要修改项目标题、简介、标签、页码映射，优先改这个文件。

`assets/`
站点公共素材，例如纸张肌理和人物图。

`web-renders/`
网页实际使用的压缩作品页图片。
以后替换作品页时，通常改这里。

`renders/`
原始高清渲染图。
这个目录默认不上传 GitHub，作为本地源文件保留。

`serve.js`
本地预览服务。

`tools/render-pdf-pages.ps1`
把 PDF 页面批量导出为 PNG。

`tools/compress-renders.ps1`
把 `renders/` 下的 PNG 批量压缩成网页用 JPG。

## 本地预览

如果本机有 Node.js：

```bash
npm start
```

或者：

```bash
node serve.js
```

打开：

`http://127.0.0.1:4173`

## 后续怎么改

### 1. 改网页文字和项目说明

优先改：

`content/site-data.js`

### 2. 改作品展示图

替换：

`web-renders/`

如果你是从新的 PDF 重新生成：

1. 准备新的 PDF 文件路径
2. 运行 `tools/render-pdf-pages.ps1`
3. 再运行 `tools/compress-renders.ps1`
4. 如有页码变化，再同步修改 `content/site-data.js`

### 3. 改整体视觉

改：

`styles.css`

### 4. 改页面结构

改：

`index.html` 和 `script.js`

## PDF 转图脚本

导出 PDF 页面：

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\render-pdf-pages.ps1 -PdfPath "你的PDF路径.pdf"
```

压缩为网页图片：

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\compress-renders.ps1
```

## GitHub 维护方式

上传到 GitHub 后，后续你通常不需要自己去 GitHub 网页里手动改。

更常见的方式是：

1. 你直接在对话里告诉我想改什么
2. 我在本地项目里帮你改好
3. 我再帮你提交并推送到 GitHub

也就是说，只要这个项目还在当前工作区，或者你把仓库拉回这个环境里，我可以继续直接帮你维护。
