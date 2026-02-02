---
# 简历重构设计说明

## 🎯 核心目标

为 VC 融资背书的个人简历，展示"极客特质"和"硬件创始人潜力"。

---

## 📐 数据结构设计

### 新增字段

```yaml
awards:          # 竞赛与荣誉
  - title:       # 荣誉名称
    description: # 详细描述
    duration:    # 时间

mentors:         # 导师与核心成员
  - name:        # 姓名
    title:       # 角色
    affiliation: # 机构
    description: # 成就列表
    link:        # 链接
```

### 设计原则

- **零破坏性**：不修改现有字段结构
- **最小化**：仅增加必要的两个字段
- **可扩展**：支持多条记录，未来可轻松添加更多荣誉或团队成员

---

## 🎨 内容策略

### 1. 张元龙教授背书

**为什么这样处理？**

- **定位**：作为"导师/核心团队成员"突出标注，而非简单的"指导老师"
- **信用传递**：通过顶级论文（Cell、Nature 系列）和荣誉（国家级青年人才、清华优秀博士后 Top 10/3500）建立学术声望
- **融资逻辑**：VC 看重"团队质量"，顶尖科学家的背书直接转化为项目的可信度

**具体实现：**

```yaml
mentors:
  - name: 张元龙
    title: 导师 / 核心团队成员
    affiliation: 清华大学生命科学学院助理教授 | ...
    description:
      - "2025年国家级青年人才奖励计划"
      - "2024年清华大学优秀博士后 (Top 10/3500)"
      - "代表作：Cell (2024) 第一作者, Nature Biomedical Engineering (2024) 第一作者..."
```

### 2. Genesis 项目叙述

**为什么这样处理？**

- **前瞻性 > 比赛结果**：强调"Agent 原生应用"的技术眼光，而非三等奖
- **极客特质**：紧跟 Moltbook 等 Agent-native 风潮，体现对技术趋势的敏感度
- **诚实面对遗憾**：承认"因不像传统 App 未获更高奖项"，但这恰恰证明了前瞻性

**具体实现：**

```yaml
projects:
  - name: ~/Genesis - Agent原生应用
    description:
      - "前瞻性探索Agent原生应用范式，紧跟Moltbook等Agent-native应用风潮"
      - "虽因「不像传统App」未获更高奖项，但技术实现体现了对下一代应用形态的前瞻性判断"
```

### 3. 光学脑机接口科研

**为什么这样处理？**

- **跨学科能力**：光学 + 神经科学 + 硬件，展现技术广度
- **技术深度**：双光子成像、CEBRA 神经表示学习、实时信号处理，体现技术深度
- **工程能力**：从理论到系统实现（双光子显微成像 → 机械臂控制）

**具体实现：**

```yaml
projects:
  - name: 光学脑机接口控制系统
    description:
      - "设计基于海马体目标态解码的脑机接口系统，通过双光子钙成像获取大规模神经元群体活动"
      - "构建「强表示、轻读出」解码架构：使用CEBRA将高维神经活动映射至低维流形..."
```

### 4. 小忆 AI 眼镜 (MineContext Glass)

**为什么这样处理？**

- **硬件能力**：Electron 桌面应用开发，展现全栈能力
- **技术敏感度**：参赛北大光华创新创业大赛，说明项目获得市场认可
- **工程细节**：具体技术栈（Electron, React 18.3.1, TypeScript, Vite, FastAPI, SQLite, FFmpeg）

**具体实现：**

```yaml
projects:
  - name: 小忆 AI 眼镜 (MineContext Glass)
    description:
      - "基于Electron框架开发本地优先的AI视频日记桌面应用..."
      - "技术栈：Electron, React 18.3.1, TypeScript, Vite, FastAPI, SQLite, FFmpeg"
    contribution: 核心开发者 | 参赛: 北大光华创新创业大赛 (进行中)
```

---

## 🏗️ 布局调整

### 修改内容

在 `_layouts/resume_zh_cn.html` 中添加两个新 sections：

1. **竞赛与荣誉** (`awards`)：位于"项目"和"语言"之间
2. **导师与核心成员** (`mentors`)：位于"竞赛与荣誉"和"语言"之间

### 渲染逻辑

```liquid
<section id="awards">
  {% for award in site.data.resume_zhcn.awards %}
    <div class="block">
      <div class="block-title">{{ award.title }}</div>
      <div class="block-subtitle">{{ award.duration }}</div>
      <div class="block-content">{{ award.description }}</div>
    </div>
  {% endfor %}
</section>

<section id="mentors">
  {% for mentor in site.data.resume_zhcn.mentors %}
    <div class="block">
      <div class="block-title">{{ mentor.name }}</div>
      <div class="block-subtitle">{{ mentor.title }}</div>
      <div class="block-content">
        {{ mentor.affiliation }}<br><br>
        <ul>
          {% for item in mentor.description %}
            <li>{{ item }}</li>
          {% endfor %}
        </ul>
        {% if mentor.link %}
          <a href="{{ mentor.link }}" target="_blank">查看详情</a>
        {% endif %}
      </div>
    </div>
  {% endfor %}
</section>
```

### 设计亮点

- **一致性**：复用现有的 `.block`、`.block-title`、`.block-subtitle` 样式类
- **最小改动**：无需修改 CSS，Liquid 模板直接渲染
- **可扩展性**：未来可轻松添加更多奖项或团队成员

---

## 🔧 如何使用

### 本地预览

```bash
# 启动 Jekyll 开发服务器
bundle exec jekyll serve

# 访问中文简历
open http://localhost:4000/resume_zh-CN.html
```

### 导出 PDF

1. 在浏览器中打开 `resume_zh-CN.html`
2. 按 `Cmd + P` (macOS) 或 `Ctrl + P` (Windows)
3. 选择"另存为 PDF"
4. 确保勾选"背景图形"以保留样式

---

## 🎯 To VC 的核心信号

| 信号 | 体现方式 |
|------|----------|
| **技术广度** | 硬件设计 + AI/ML + 全栈开发 + 神经科学 |
| **技术深度** | 双光子成像、CEBRA、强化学习、实时系统 |
| **前瞻性** | Agent 原生应用、AI 视频日记、脑机接口 |
| **学术背书** | 张元龙教授（Cell/Nature 论文） |
| **工程能力** | 从理论到系统实现的完整项目 |
| **市场敏感度** | 参赛北大光华创新创业大赛 |
| **极客特质** | 技术栈细节明确、诚实面对比赛遗憾 |

---

## 📊 对比：修改前 vs 修改后

| 维度 | 修改前 | 修改后 |
|------|--------|--------|
| **数据结构** | 6 个字段 | 8 个字段 (+awards, +mentors) |
| **项目数量** | 4 个 | 7 个 |
| **技术深度** | 通用描述 | 具体技术栈 + 实现细节 |
| **学术背书** | 无 | 张元龙教授完整履历 |
| **竞赛荣誉** | 分散在项目中 | 独立 section，一目了然 |
| **导师信息** | 仅在项目中提及 | 独立 section，突出显示 |

---

## 🚀 后续优化建议

### 1. 添加项目演示链接

如果有 GitHub 仓库或 Demo 视频，可在 `projects` 中添加 `link` 字段：

```yaml
projects:
  - name: 小忆 AI 眼镜
    link: https://github.com/qiuyi111/minecontext-glass
```

### 2. 添加技能熟练度

可将 `skills` 从字符串改为列表，支持熟练度标注：

```yaml
skills:
  - title: 硬件与机械设计
    items:
      - name: SolidWorks
        proficiency: 精通
      - name: 双光子显微成像系统
        proficiency: 熟练
```

### 3. 添加项目影响力

如果有用户数据、奖项证书、媒体报道，可在 `projects` 中添加 `impact` 字段：

```yaml
projects:
  - name: AI音乐剧专辑《李白》
    impact: "全平台播放量 10,000+，被多家 AI 社区推荐"
```

---

## 📝 总结

这次重构遵循了"好品味"原则：

1. **消除特殊情况**：无需 if/else 分支，直接扩展数据结构
2. **简洁执念**：仅增加两个字段，最小化改动
3. **实用主义**：解决真实问题（VC 融资背书），无过度工程化
4. **零破坏性**：不修改现有字段，完全向后兼容

简历现在清晰地传递了核心信号：**这是一个技术功底扎实、跨学科能力强、具备前瞻性眼光的硬件开发者，背后有顶尖科学家背书，是值得投资的项目核心成员。**
