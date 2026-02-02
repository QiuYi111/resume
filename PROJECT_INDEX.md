---
---

# Project Index: jekyll-minimal-resume

**Generated**: 2026-02-02
**Type**: Jekyll Theme - Personal Resume
**Language**: Ruby/Liquid/HTML/CSS/SASS

---

## 核心架构

```
数据源(_data/*.yml) → 布局模板(_layouts/*.html) → 静态站点(_site/)
```

**本质**: YAML数据驱动 + Liquid模板渲染的静态简历生成器

---

## 目录结构

```
.
├── _data/               # 核心数据源(仅YAML)
│   ├── resume.yml       # 英文简历数据
│   └── resume_zhcn.yml  # 中文简历数据
├── _layouts/            # 页面模板(Liquid)
│   ├── resume.html      # 英文简历布局
│   ├── resume_zh_cn.html # 中文简历布局
│   └── default.html     # 基础布局
├── _includes/           # 可复用组件
│   ├── head.html        # HTML head/CSS
│   └── foot.html        # 结束标签/脚本
├── _sass/               # SASS样式源
├── assets/css/          # 编译后的CSS
├── _config*.yml         # Jekyll配置(3套)
├── index.html           # 入口页面
├── resume.html          # 英文版
└── resume_zh-CN.html    # 中文版
```

---

## 入口文件

| 文件 | 用途 | 关键配置 |
|------|------|----------|
| `index.html` | 主页 | `layout: resume` |
| `resume.html` | 英文简历 | `layout: resume` |
| `resume_zh-CN.html` | 中文简历 | `layout: resume_zh_cn` |
| `_data/resume.yml` | 简历数据(英) | name/jobtitle/contact/education/skills/projects |
| `_data/resume_zhcn.yml` | 简历数据(中) | 同上结构，中文内容 |

---

## 数据结构 (resume.yml)

```yaml
name: string
jobtitle: string
contact: [{icon, text, link?}]
education: [{university, duration, location, major}]
skills: [{title, items}]
experience: [{title, duration, company, description}]
projects: [{name, duration, contribution, description}]
languages: [{name, proficiency}]
```

**所有权**: 数据 → `_data/*.yml` (唯一真相源)
**流向**: YAML → Liquid模板 → 静态HTML

---

## 配置系统

| 配置文件 | 场景 |
|----------|------|
| `_config.yml` | 标准Jekyll主题模式 |
| `_config_gem.yml` | Gem包开发模式 |
| `_config_colorful.yml` | 多色彩主题测试 |

**关键参数**:
- `baseurl`: 部署路径 (如 `/resume/`)
- `theme`: `jekyll-theme-minimal-resume`
- `color`: gray/red/blue/green/... (14种)

---

## 样式系统

**依赖**: [Open Color](https://yeun.github.io/open-color/) + [Nord](https://www.nordtheme.com/)

**支持色彩**: gray, red, pink, grape, violet, indigo, blue, cyan, teal, green, lime, yellow, orange, nord

**打印优化**: CSS `@media print` 内置

---

## 扩展机制

**添加新section** (3步):

1. `_data/resume.yml` 添加数据
2. `_layouts/resume.html` 添加 `<section>` 块
3. 用Liquid循环渲染: `{% for item in site.data.resume.X %}`

---

## 快速命令

```bash
# 标准模式
bundle exec jekyll serve

# Gem开发模式
rake sg

# 多色彩测试
rake sc

# 构建
bundle exec jekyll build
```

---

## 依赖关系

| 依赖 | 版本 | 用途 |
|------|------|------|
| jekyll | - | 静态站点生成器 |
| jekyll-theme-minimal-resume | gem | 主题包(本仓库) |
| FontAwesome | (嵌入) | 图标库(`fa-*` class) |

---

## 特殊说明

- **PDF导出**: 浏览器打印 → 另存为PDF (CSS已优化)
- **Hexo版本**: `/port-hexo/` 目录包含移植版
- **部署**: GitHub Pages兼容 (标准Jekyll)
- **国际化**: 双模板系统 (`resume.html` + `resume_zh-CN.html`)

---

## 当前用户数据

- 姓名: 邱璟祎
- 学校: 清华大学 (机械工程实验班)
- 交换: 荷兰代尔夫特理工大学
- 项目: SRT外骨骼、强化学习交易模型、LSTM股价预测、AI音乐剧《李白》
- 技能: SolidWorks/AutoCAD/C++/Python/Matlab/Stable Diffusion/Suno/ChatGPT
- 语言: 普通话(母语)、英语(托福100+)

---

## 文件修改热区

**常用编辑**:
- `_data/resume_zhcn.yml` - 更新简历内容
- `_sass/*.scss` - 调整样式
- `_layouts/resume_zh_cn.html` - 修改中文布局
- `_config.yml` - 修改部署配置

**无需改动**: `_site/` (构建产物)、`.sass-cache/` (缓存)
