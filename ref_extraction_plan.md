---
# Ref 文件夹完整信息提取计划

## 📋 REQUIRE.md 要求回顾

> "REF 内有非常丰富的信息，分布在项目文件、latex以及 pdf 里，我建议你全部了解和整合每一个文件内容。"

## 🗂️ Ref 文件夹结构分析

### 1. CV 相关 (✅ 已处理)
- `ref/CV 中文/main.tex` - 已提取实习经历

### 2. 光学脑机接口开题报告 (🔄 需深入分析)
**位置**: `ref/光学脑机接口控制开题报告/`

**关键文件**:
- `introduction.tex` - 研究背景和动机
- `Methods.tex` - 技术方法详细描述
- `design.tex` - 系统设计
- `bci.tex` - BCI 相关细节
- `data/chap01-04.tex` - 各章节内容
- `data/abstract.tex` - 摘要
- `data/appendix-*.tex` - 附录材料

**待提取信息**:
- [ ] 更技术化的项目描述细节
- [ ] 具体的技术参数和指标
- [ ] 研究方法和实验设计
- [ ] 创新点和贡献

### 3. MineContext-Glass 项目 (🔄 需深入分析)
**位置**: `ref/MineContext-Glass/`

**子项目结构**:
- `mobile-app/` - 移动应用 (React)
- `desktop-glass/` - 桌面应用 (Electron)
- `figma-plugin/` - Figma 插件
- `auc_python/` - Python 后端

**关键文件**:
- `app.md` - 项目概览
- `API.md` - API 文档
- `PHASE1_COMPLETION_REPORT.md` - 阶段完成报告
- `VIBE_DIAGNOSIS.md` - 技术诊断
- `desktop-glass/README.md`
- `mobile-app/package.json` - 技术栈版本

**待提取信息**:
- [ ] 更详细的技术实现细节
- [ ] 项目里程碑和完成度
- [ ] 具体解决的技术问题
- [ ] 技术栈版本号

### 4. Genesis 项目 (❓ 需确认是否存在)
**待搜索**: ref 文件夹中是否有 Genesis 相关的文档

### 5. 其他可能的信息
- [ ] 竞赛详细信息 (智理杯、北大光华)
- [ ] 奖学金证明或描述
- [ ] 技能清单的详细版本
- [ ] 其他项目经历

---

## 📝 执行计划

### 阶段 1: 光学脑机接口深入分析
1. 阅读 `introduction.tex` - 提取研究背景
2. 阅读 `Methods.tex` - 提取技术方法
3. 阅读 `design.tex` 和 `bci.tex` - 提取系统设计细节
4. 阅读 `abstract.tex` - 提取核心贡献
5. **输出**: 更新 resume_zhcn.yml 中的光学脑机接口项目描述

### 阶段 2: MineContext-Glass 深入分析
1. 阅读 `app.md` - 项目整体描述
2. 阅读 `PHASE1_COMPLETION_REPORT.md` - 完成情况
3. 阅读 `VIBE_DIAGNOSIS.md` - 技术挑战
4. 检查技术栈版本号
5. **输出**: 更新 resume_zhcn.yml 中的小忆 AI 眼镜项目描述

### 阶段 3: 搜索其他遗漏信息
1. 搜索 Genesis 相关文档
2. 搜索竞赛相关文档
3. 搜索奖学金相关文档
4. **输出**: 补充任何遗漏的信息

### 阶段 4: 验证和更新
1. 对比当前 resume_zhcn.yml 与提取的所有信息
2. 识别任何技术细节的补充
3. 识别任何量化指标的添加
4. **输出**: 最终的完整简历更新

---

## ✅ 当前进度

- [x] 实习经历提取 (来自 CV 中文)
- [ ] 光学脑机接口详细技术信息
- [ ] MineContext-Glass 详细实现信息
- [ ] 其他项目/竞赛/奖学金细节
- [ ] 最终验证和整合

---

**创建时间**: 2026-02-02
**状态**: 🔄 待执行
