# Getting Started with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)
# AV Movies API

一个基于 Fastify 和 Drizzle ORM 构建的 AV 电影管理 API。

## 功能特性

- ✅ RESTful API 设计
- ✅ PostgreSQL 数据库支持
- ✅ Drizzle ORM 数据库操作
- ✅ TypeScript 类型安全
- ✅ CORS 支持
- ✅ 分页查询
- ✅ 搜索功能
- ✅ 错误处理
- ✅ 日志记录
- ✅ 健康检查端点

## 技术栈

- **框架**: Fastify
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **语言**: TypeScript
- **包管理器**: pnpm

## 环境要求

- Node.js >= 18
- PostgreSQL >= 12
- pnpm

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 环境配置

复制 `.env` 文件并根据需要修改数据库连接信息：

```bash
cp .env .env.local
```

默认配置：
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/postgres"
PORT=3226
HOST=0.0.0.0
NODE_ENV=production
LOG_LEVEL=info
```

### 3. 数据库迁移

```bash
# 生成迁移文件（如果schema有变化）
pnpm db:generate

# 执行迁移
pnpm db:migrate
```

### 4. 启动服务

```bash
# 开发模式
pnpm dev

# 生产模式
pnpm build
pnpm start
```

服务将在 `http://localhost:3226` 启动。

## API 端点

### 基础信息

- `GET /` - API 信息
- `GET /health` - 健康检查

### 电影管理

- `POST /movies` - 创建新电影
- `GET /movies` - 获取所有电影（支持分页）
- `GET /movies/:id` - 根据番号获取电影
- `PUT /movies/:id` - 更新电影信息
- `DELETE /movies/:id` - 删除电影
- `GET /movies/search?code=xxx` - 搜索电影

### 请求示例

#### 创建电影

```bash
curl -X POST http://localhost:3226/movies \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ABC-123",
    "title": "示例电影",
    "magnet_link": "magnet:?xt=urn:btih:example"
  }'
```

#### 获取电影列表

```bash
curl "http://localhost:3226/movies?page=1&limit=10"
```

#### 搜索电影

```bash
curl "http://localhost:3226/movies/search?code=ABC"
```

## 数据模型

### Movie

| 字段 | 类型 | 描述 |
|------|------|------|
| code | varchar(50) | 番号（主键） |
| title | text | 标题 |
| magnet_link | text | 磁力链接（可选） |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

## 开发工具

```bash
# 运行测试
pnpm test

# 数据库管理界面
pnpm db:studio

# 类型检查
pnpm build
```

## 项目结构

```
src/
├── db/
│   ├── connection.ts    # 数据库连接
│   ├── schema.ts        # 数据模型定义
│   ├── migrate.ts       # 迁移脚本
│   └── migrations/      # 迁移文件
├── routes/
│   ├── root.ts          # 根路由
│   └── movies.ts        # 电影路由
├── types/
│   └── index.ts         # 类型定义
├── app.ts               # 应用配置
└── server.ts            # 服务器启动
```

## 部署

### 生产环境部署

1. 构建项目：
```bash
pnpm build
```

2. 设置环境变量：
```bash
export NODE_ENV=production
export PORT=3226
export DATABASE_URL="your-production-database-url"
```

3. 运行迁移：
```bash
pnpm db:migrate
```

4. 启动服务：
```bash
pnpm start
```

## 许可证

MIT

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://fastify.dev/docs/latest/).
