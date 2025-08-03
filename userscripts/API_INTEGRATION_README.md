# SeHuaTang Searcher API 集成说明

## 功能概述

SeHuaTang Searcher Pro v2.1 现在支持静默API提交功能，可以在成功提取到标题和磁力链接后，自动将数据提交到后端API。

## 主要特性

### 1. 静默处理
- 默认不显示任何弹窗提示
- 在后台静默提交数据到API
- 只在控制台输出日志信息

### 2. 标题清理
使用正则表达式自动移除标题中的以下标记：
- `[自提征用]` 或 `【自提征用】`
- `[无码破解]` 或 `【无码破解】`
- `[高清中文字幕]` 或 `【高清中文字幕】`
- 其他类似的破解、征用标记

### 3. 数据验证
提交前验证数据完整性：
- 确保番号不为空
- 确保标题不为空
- 确保磁力链接不为空且格式正确

### 4. 错误处理
- 支持重试机制（默认2次重试）
- 请求超时处理（默认10秒）
- 详细的错误日志记录

## API 配置

### 默认配置
```javascript
api: {
    endpoint: 'http://localhost:3226/movies',
    timeout: 10000,
    retryAttempts: 2
}
```

### 数据格式
提交到API的数据格式：
```javascript
{
    code: "番号",           // 从搜索关键词或页面内容提取
    title: "清理后的标题",   // 移除标记后的标题
    magnet_link: "磁力链接" // 完整的磁力链接
}
```

## 使用方法

### 1. 基本使用
脚本会自动运行，无需手动操作。当在内容页面成功提取到标题和磁力链接时，会自动提交到API。

### 2. 配置管理
在浏览器控制台中使用以下命令：

```javascript
// 查看当前配置
SeHuaTangConfig.showConfig()

// 设置API端点
SeHuaTangConfig.setApiEndpoint('http://your-api-server:port/movies')

// 获取当前API端点
SeHuaTangConfig.getApiEndpoint()

// 启用/禁用静默模式
SeHuaTangConfig.setSilentMode(true)  // 启用静默模式
SeHuaTangConfig.setSilentMode(false) // 禁用静默模式

// 测试API连接
SeHuaTangConfig.testApi()
```

### 3. 调试模式
```javascript
// 启用调试模式（显示详细日志）
SeHuaTangDebug.enable()

// 禁用调试模式
SeHuaTangDebug.disable()

// 查看调试状态
SeHuaTangDebug.status()
```

## 番号提取逻辑

脚本会按以下优先级提取番号：
1. 搜索关键词（用户输入的搜索词）
2. URL参数中的关键词
3. 页面标题中的番号模式匹配
4. 页面内容中的番号模式匹配

支持的番号格式：
- 标准格式：`SSIS-123`, `IPX-456`
- 简化格式：`S123`, `I456`
- 数字格式：`123456_001`

## 错误处理

### 常见错误及解决方案

1. **网络连接错误**
   - 检查API服务是否运行
   - 确认端口号是否正确（默认3226）

2. **数据验证失败**
   - 检查番号是否正确提取
   - 确认磁力链接格式是否正确

3. **API响应错误**
   - 检查API服务状态
   - 查看服务器日志

## 注意事项

1. **静默模式**：默认启用，不会显示弹窗
2. **重复提交**：API会检查番号是否已存在，避免重复数据
3. **数据清理**：标题会自动清理标记，保持数据整洁
4. **错误重试**：网络错误会自动重试，提高成功率

## 版本历史

- v2.1: 添加API集成功能，支持静默提交
- v2.0: 基础搜索和提取功能
