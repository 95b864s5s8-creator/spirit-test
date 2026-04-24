# spirit-test 设计文档

> 测了吗 — 五行人格测试项目所有设计文档。新人必读。

---

## 快速导航

| 文档 | 内容 | 状态 |
|------|------|------|
| [问卷设计/复习问卷.md](问卷设计/review-questions.md) | 完整测试问卷（20题） | ✅ 最新 |
| [问卷结果/复习结果.md](问卷结果/review-results.md) | 测试结果展示逻辑 | ✅ 最新 |
| [问卷结果/结果页设计-v4.md](问卷结果/result-page-v4.md) | 结果页 UI 规格说明 | ✅ 最新 |
| [治愈文案/MBTI治愈文案.md](治愈文案/cure-mbti-copywriting.md) | 20种叠加态治愈文案 | ✅ 最新 |
| [治愈文案/五行治法-v2.md](治愈文案/cure-element-v2.md) | 五行治法体系 | ✅ 最新 |
| [守护神/神明药方-v2.md](守护神/deity-prescription-v2.md) | 21位守护神完整文案 | ✅ 最新 |
| [守护神/守护神矩阵算法.md](守护神/deity-matrix-algorithm.md) | 算法逻辑说明 | ✅ 最新 |
| [守护神/神明扩展记录.md](守护神/deity-expansion.md) | 杨戬/城隍/钟馗新增记录 | ✅ 最新 |
| [定价/定价文案.md](定价/compensation-copywriting.md) | 定价体系文案 | ✅ 最新 |
| [定价/定价矩阵.md](定价/compensation-matrix.md) | 价格结构 | ✅ 最新 |
| [知识框架/总览.md](知识框架/knowledge-framework.md) | 项目整体知识框架 | ✅ 最新 |
| [包装设计-v3.md](包装设计-v3.md) | 物料包装设计 | ✅ 最新 |

---

## 版本说明

所有带 `.旧.md` / `.旧.html` 后缀的文件为旧版，仅供存档参考，不建议阅读。

| 旧文件 | 对应新版 |
|--------|---------|
| `问卷设计/review-questions-v5.旧.md` | `问卷设计/review-questions.md` |
| `问卷设计/review-questions-v4.旧.md` | `问卷设计/review-questions.md` |
| `守护神/deity-prescription.旧.md` | `守护神/deity-prescription-v2.md` |
| `问卷结果/result-blueprint.旧.html` | `问卷结果/result-page-v4.md` |

---

## 核心概念速查

- **20种叠加态**：MBTI 16型 × 五行 = 80种组合 → 去重 = 20种真实叠加态
- **21位守护神**：五行各4位 + 1位妈祖备选（Apr 24 新增杨戬/城隍/钟馗）
- **业务流程**：Day0付款 → Day21开光寄出 → Day24客户收货
- **品牌**：小满伽兰（文创）、川流有息（高端）

---

## 开发相关

- 引擎代码：`engine/` 目录
- 测试脚本：`_dev/`
- 静态数据：`_data/`
- 旧版UI归档：`_archive/`

---

*最后更新：2026-04-24*
