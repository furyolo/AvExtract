# CLAUDE.md
这个文件为使用Claude Code（claude.ai/code）在这个仓库中工作提供指导。

## 项目概述
基于Fastify的AV电影管理API服务，包含PostgreSQL数据库和用户脚本系统。后端提供RESTful API，前端通过用户脚本实现自动化番号检测和数据收集。

## 核心命令

### 开发命令
```bash
pnpm dev              # 开发模式运行
pnpm build            # 生产构建
pnpm start            # 生产环境运行
pnpm test             # 运行测试
```

### 数据库命令
```bash
pnpm db:generate      # 生成Drizzle迁移文件
pnpm db:migrate       # 执行数据库迁移
pnpm db:studio        # 打开Drizzle Studio
```

## 技术架构

### 后端架构
- **框架**: Fastify + TypeScript
- **数据库**: PostgreSQL + Drizzle ORM
- **配置**: dotenv环境管理
- **文档**: @fastify/swagger自动生成API文档

### 数据模型
`avmovie`表包含：
- `code` (varchar, PK) - 番号
- `title` (text) - 电影标题  
- `magnet_link` (text, nullable) - 磁力链接
- `created_at`, `updated_at` (timestamp) - 时间戳

### API端点
- `GET /` - API信息
- `GET /health` - 健康检查
- `POST /movies` - 创建电影
- `GET /movies` - 分页获取电影列表
- `GET /movies/:code` - 获取指定番号电影
- `PUT /movies/:code` - 更新电影信息
- `DELETE /movies/:code` - 删除电影
- `GET /movies/search?code=` - 搜索电影

### 用户脚本系统
- **sehuatang_sender.user.js** - 番号检测和发送
- **sehuatang_searcher.user.js** - 自动化数据收集
- 特色：30秒冷却机制、自动封面下载、跨页面状态同步

## 环境配置
复制`.env`创建环境变量：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
PORT=3226
HOST=0.0.0.0
LOG_LEVEL=info
NODE_ENV=development
```

## 关键文件位置
- 主应用配置：`src/app.ts:20`
- 服务器启动：`src/server.ts:6`
- 数据模型：`src/db/schema.ts:4`
- 电影路由：`src/routes/movies.ts:4`