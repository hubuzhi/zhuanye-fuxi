# 专业知识复习自检 · AI 驱动的在线刷题系统

一个面向计算机专业学生的刷题自检工具：选择学科与难度后自动生成练习题，
可查看分步解析与完整答案，并对错题进行记录和统计。

## 技术栈

| 层次 | 技术 |
| --- | --- |
| 前端 | 原生 JavaScript（单页应用）+ HTML5 + CSS3 |
| 后端 | Node.js + Express 5 |
| 网络请求 | axios |
| 配置管理 | dotenv |
| AI 能力 | DeepSeek 大模型 API（deepseek-chat） |

## 核心功能

1. **AI 动态出题**：针对非计算机类学科，调用 DeepSeek API 按知识点与难度生成 8 道题目，
   通过 prompt 约束模型输出「纯 JSON + 分步解析 + 完整答案」的结构，保证前端可稳定解析。
2. **三层降级策略**：
   - 第一层：内置题库（10 个学科 / 160 道题），计算机类学科直接命中，不走 API；
   - 第二层：内置题库未覆盖的学科，调用 DeepSeek API 生成；
   - 第三层：API 超时或异常时，自动切换到本地备用题库，保证页面不空白。
3. **用户体系**：注册 / 登录接口，手机号格式校验与脱敏显示。
4. **学习辅助**：错题记录、解析展开、做题统计。

## 接口设计

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/register` | 用户注册 |
| POST | `/api/login` | 用户登录 |
| POST | `/api/getQuestion` | 取题（本地题库 / AI 生成 / 备用题库） |

## 目录结构

```
backend/
├── server.js          服务端主程序（接口 + 题库 + AI 调用）
├── test-api.js        接口测试脚本
├── package.json
└── .env.example       环境变量示例（真实 .env 不入库）
软件开发（deepseek）/
├── index.html         单页应用入口
├── script.js          前端逻辑
├── style.css          样式
└── img/               图标资源
```

## 本地运行

```bash
cd backend
npm install

# 配置密钥
copy .env.example .env    # Windows
# 然后编辑 .env，填入自己的 DEEPSEEK_API_KEY

node server.js
# 浏览器打开 http://127.0.0.1:5000
```

> ⚠️ `.env` 已加入 `.gitignore`，API 密钥不会进入仓库。
