# Repository Guidelines

## 项目结构与模块组织
- `src/` 内含 TypeScript 源码：`server.ts` 为启动入口，`app.ts` 聚合插件，`plugins/` 注册 Fastify 插件，`routes/` 定义业务路由，`db/` 存放持久层逻辑，`types/` 维护公共类型。
- 集成测试位于 `test/**/*.test.ts`，使用 tap 编写；构建产物输出至 `dist/`，浏览器脚本位于 `userscripts/`，便于与主服务解耦。

## 构建、测试与开发命令
- `pnpm install`：同步依赖并锁定版本。
- `pnpm dev`：通过 `tsx` 热重载 `src/server.ts`，适合本地迭代。
- `pnpm build`：运行 `tsc` 输出至 `dist/`，用于上线或配合 `pnpm start`。
- `pnpm db:generate` / `pnpm db:migrate`：调用 drizzle-kit 生成与执行迁移，需确认 `.env` 中数据库配置。
- `pnpm test`：执行 tap 测试套件，可附加 `--reporter=list` 以便排错。

## 代码风格与命名规范
- 统一使用 TypeScript 5.x + ESM，缩进 2 空格，采用单引号；导出主函数以动词短语命名，如 `registerRoutes`。
- 数据库 schema 与迁移文件字段使用 snake_case，TypeScript 类型与类保持 PascalCase，工具函数保持 camelCase。
- 提交前建议运行 `pnpm exec tsc --noEmit`；如安装 drizzle-kit format 插件，请使用 `pnpm exec drizzle-kit format` 统一迁移文件风格。

## 测试指南
- 测试文件命名遵循 `<模块>.test.ts`，覆盖核心路由、异常路径与数据库交互。
- 使用 tap 的 `t.beforeEach` 管理测试夹具，必要时在 `test/helpers` 中抽象复用逻辑。
- 每个新增路由至少包含 1 个成功与 1 个失败用例；涉及外部服务时请通过模拟或事务回滚隔离副作用。

## 提交与 Pull Request 指南
- 沿用约定式提交：`feat:`, `fix:`, `refactor:` 等，可酌情添加 Emoji；正文以简洁中文概述改动意图。
- PR 需包含变更摘要、测试结果（命令输出或截图）、关联 Issue/任务编号；功能改动应同步接口文档或 OpenAPI 说明。
- 响应 Reviewer 时补充本地验证步骤，保持分支与 `main` 同步，避免夹带无关构建产物。

## 安全与配置提示
- `.env` 保存数据库连接，请勿提交；开发环境可使用 `.env.development` 覆盖默认值。
- Fastify 日志级别由 `LOG_LEVEL` 控制，线上请禁用 `pino-pretty`，并在反向代理层终止 TLS。
- 处理用户输入时结合 `fastify-sensible` 错误助手与 Drizzle 参数化查询，预防 SQL 注入风险。
