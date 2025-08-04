# AvExtract - AV电影管理系统

一个完整的AV电影管理解决方案，包含后端API服务和智能用户脚本系统。

## 🌟 系统概述

本项目由两个主要组件构成：
1. **后端API服务** - 基于 Fastify 和 Drizzle ORM 的高性能API
2. **用户脚本系统** - 智能番号检测和自动化数据收集工具

## 🚀 核心功能

### 后端API功能
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

### 用户脚本功能
- 🌸 **智能番号检测** - 自动识别网页上的各种番号格式
- 🖼️ **自动下载封面图片** - 点击发送时自动下载封面到本地
- 🕐 **30秒全局冷却机制** - 防止频繁请求，保护服务器资源
- 🔄 **跨页面状态同步** - 多标签页间的冷却状态完全同步
- 🎯 **静默API提交** - 自动提取数据并提交到后端API
- 🎨 **美观的用户界面** - 粉色渐变按钮，符合色花堂主题

## 🛠️ 技术栈

### 后端技术
- **框架**: Fastify
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **语言**: TypeScript
- **包管理器**: pnpm

### 用户脚本技术
- **运行环境**: Tampermonkey/Greasemonkey
- **跨域通信**: localStorage + URL hash
- **文件下载**: GM_xmlhttpRequest + Blob API
- **状态同步**: Storage Events
- **UI框架**: 原生CSS3动画

## 📋 环境要求

### 后端环境
- Node.js >= 18
- PostgreSQL >= 12
- pnpm

### 用户脚本环境
- Chrome/Firefox/Edge 浏览器
- Tampermonkey 扩展
- 支持localStorage的浏览器环境

## 🚀 快速开始

### 后端API部署

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

### 用户脚本安装

1. **安装Tampermonkey扩展**
   - Chrome: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

2. **安装用户脚本**
   ```bash
   # 安装发送器脚本（用于番号检测和发送）
   # 在Tampermonkey中导入 userscripts/sehuatang_sender.user.js

   # 安装搜索器脚本（用于色花堂自动搜索）
   # 在Tampermonkey中导入 userscripts/sehuatang_searcher.user.js
   ```

3. **配置API端点**
   ```javascript
   // 在浏览器控制台中执行
   SeHuaTangConfig.setApiEndpoint('http://localhost:3226/movies');
   ```

## 📚 API 端点

### 基础信息

- `GET /` - API 信息
- `GET /health` - 健康检查

### 电影管理

- `POST /movies` - 创建新电影
- `GET /movies` - 获取所有电影（支持分页）
- `GET /movies/:code` - 根据番号获取电影
- `PUT /movies/:code` - 更新电影信息
- `DELETE /movies/:code` - 删除电影
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

## 🌸 用户脚本功能详解

### 色花堂番号发送器 v1.3.5

#### 核心功能
- **智能番号检测**: 自动识别网页上的各种番号格式
  - 普通番号: `ABC-123`, `SSIS-001`, `PRED-456`
  - FC2番号: `FC2-1234567`, `FC2PPV-2345678`
  - 无码番号: `HEYDOUGA-4017-123`, `1pondo-123456_001`
  - 特殊番号: `T28-123`, `CARIB-123456-789`

- **🖼️ 自动下载封面图片**:
  - 点击发送按钮时自动下载页面封面图片
  - 图片保存格式: `番号.扩展名` (如: `PRED-785.jpg`)
  - 支持多种图片格式 (jpg, png, webp等)
  - 静默下载，无需用户确认

- **🕐 30秒全局冷却机制**:
  - 防止频繁请求，保护服务器资源
  - 冷却期间所有按钮变灰且无法点击
  - 跨页面状态同步，多标签页间完全同步
  - 友好的剩余时间提示

#### 使用方法
1. 访问包含番号的网页（如javbus.com）
2. 脚本自动检测番号并显示 `🌸色花堂` 按钮
3. 点击按钮自动执行：
   - 下载封面图片到本地
   - 跳转到色花堂搜索页面
   - 自动开始搜索流程
   - 启动30秒冷却期

#### 右键菜单功能
- 复制番号到剪贴板
- 单独下载封面图片
- 查看存储状态
- 清理存储数据

### 色花堂搜索器 v2.2

#### 智能功能
- **自动搜索**: 接收发送器传递的番号，自动开始搜索
- **数据提取**: 自动提取标题和磁力链接
- **标题清理**: 移除 `[自提征用]`、`[无码破解]` 等标记
- **静默API提交**: 自动提交数据到后端API，无弹窗干扰
- **智能冷却期管理**: 区分不同页面类型，差异化冷却策略

#### 配置选项
```javascript
// 设置API端点
SeHuaTangConfig.setApiEndpoint('http://localhost:3226/movies');

// 启用/禁用静默模式
SeHuaTangConfig.setSilentMode(true);

// 查看运行状态
SeHuaTangConfig.getStatus();

// 清除状态（解决冷却期问题）
SeHuaTangConfig.clearState();

// 测试API连接
SeHuaTangConfig.testApi();
```

### 工作流程
```
访问番号网页 → 点击🌸色花堂按钮 → 自动下载封面 → 跳转搜索 →
自动提取数据 → 静默提交API → 30秒冷却期 → 完成
```

## 📊 数据模型

### Movie

| 字段        | 类型        | 描述             |
| ----------- | ----------- | ---------------- |
| code        | varchar(50) | 番号（主键）     |
| title       | text        | 标题             |
| magnet_link | text        | 磁力链接（可选） |
| created_at  | timestamp   | 创建时间         |
| updated_at  | timestamp   | 更新时间         |

## 开发工具

```bash
# 运行测试
pnpm test

# 数据库管理界面
pnpm db:studio

# 类型检查
pnpm build
```

## 📁 项目结构

```
AvExtract/
├── src/                           # 后端API源码
│   ├── db/
│   │   ├── connection.ts          # 数据库连接
│   │   ├── schema.ts              # 数据模型定义
│   │   ├── migrate.ts             # 迁移脚本
│   │   └── migrations/            # 迁移文件
│   ├── routes/
│   │   ├── root.ts                # 根路由
│   │   └── movies.ts              # 电影路由
│   ├── types/
│   │   └── index.ts               # 类型定义
│   ├── app.ts                     # 应用配置
│   └── server.ts                  # 服务器启动
├── userscripts/                   # 用户脚本系统
│   ├── sehuatang_sender.user.js   # 番号发送器 v1.3.5
│   ├── sehuatang_searcher.user.js # 搜索器 v2.2
│   ├── README.md                  # 用户脚本详细说明
│   ├── CHANGELOG.md               # 更新日志
│   └── API_INTEGRATION_README.md  # API集成说明
├── dist/                          # 编译输出
├── test/                          # 测试文件
├── package.json                   # 项目配置
├── tsconfig.json                  # TypeScript配置
└── drizzle.config.ts              # Drizzle配置
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

## 🔧 故障排除

### 用户脚本常见问题

#### 问题：发送器按钮显示"🕐冷却中"无法点击
**解决方案**：
- 正常情况：等待30秒后按钮自动恢复
- 查看剩余时间：点击冷却中的按钮会显示剩余秒数
- 强制解除：在控制台执行 `localStorage.removeItem('sehuatang_sender_cooldown_start'); location.reload();`

#### 问题：搜索器提示"跳过执行"
**解决方案**：
```javascript
// 在控制台执行
SeHuaTangConfig.clearState();  // 清除状态
SeHuaTangConfig.getStatus();   // 查看详细信息
```

#### 问题：API提交失败
**解决方案**：
```javascript
// 测试API连接
SeHuaTangConfig.testApi();
// 检查配置
SeHuaTangConfig.showConfig();
// 确认后端服务运行状态
```

#### 问题：封面图片下载失败
**解决方案**：
- 检查Tampermonkey下载权限设置
- 确认页面包含封面图片元素
- 查看控制台错误信息

### 后端API问题

#### 数据库连接失败
- 检查PostgreSQL服务状态
- 确认数据库连接字符串正确
- 验证数据库用户权限

#### 端口占用
```bash
# 检查端口占用
netstat -ano | findstr :3226
# 或使用其他端口
export PORT=3227
```

## 📈 性能优化建议

### 后端优化
- 使用连接池管理数据库连接
- 启用查询缓存
- 配置适当的日志级别

### 用户脚本优化
- 冷却期机制防止频繁请求
- 异步下载不阻塞主流程
- 智能状态同步减少资源消耗

## 🔄 更新日志

### v1.3.5 (2025-08-04)
- 🧹 代码优化和精简
- 📉 减少日志输出，提升性能
- 🔧 优化内存使用和代码结构

### v1.3.0 (2025-08-04)
- 🖼️ 新增自动下载封面图片功能
- 📁 图片保存格式：`番号.扩展名`
- 🎯 支持多种图片格式检测
- 🔄 异步下载，不影响主功能

### v1.2.0 (2025-08-03)
- 🕐 新增30秒全局冷却机制
- 🔄 跨页面状态同步
- 🎨 冷却期间按钮状态优化
- 💡 友好的剩余时间提示

### v2.2.0 (搜索器)
- 🧠 智能冷却期管理
- 🎯 静默API提交功能
- 🍎 Apple风格错误弹窗
- 📊 增强的调试功能

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 支持与反馈

- 📧 邮件: [your-email@example.com]
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-username/AvExtract/issues)
- 📖 详细文档: [userscripts/README.md](userscripts/README.md)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件


