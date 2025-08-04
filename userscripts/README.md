# SeHuaTang Forum Searcher Pro v2.2

## 🌸 色花堂番号发送器 v1.2.0 ✅ **项目完成**

### 全自动跨域番号传递系统
一个完整的用户脚本解决方案，实现番号的自动检测、跨域传递和无缝搜索。

#### 📊 项目状态

**✅ 已完成功能：**
- [x] 智能番号检测和识别
- [x] 美观的用户界面设计
- [x] 跨域数据传递机制
- [x] 全自动搜索流程
- [x] 30秒全局冷却机制（v1.2.0新增）
- [x] 跨页面状态同步
- [x] 错误处理和恢复
- [x] 调试工具和故障排除
- [x] 完整的文档和测试

**🎯 项目成果：**
- **发送器脚本**：`sehuatang_sender.user.js` (v1.2.0) - 新增30秒全局冷却功能
- **接收端脚本**：`sehuatang_searcher.user.js` (已优化)
- **简化版脚本**：`sehuatang_sender_simple.user.js` (测试用)
- **测试页面**：`test_page.html`
- **故障排除指南**：`TROUBLESHOOTING.md`
- **更新日志**：`CHANGELOG.md`

#### 🚀 核心功能

1. **智能番号检测**：自动识别网页上的各种番号格式
   - 普通番号：ABC-123, SSIS-001, PRED-456, FNS-039
   - FC2番号：FC2-1234567, FC2PPV-2345678
   - 无码番号：HEYDOUGA-4017-123, 1pondo-123456_001
   - 特殊番号：T28-123, CARIB-123456-789

2. **美观的发送按钮**：在检测到的番号旁显示"🌸色花堂"按钮
   - 粉色渐变背景，符合色花堂主题
   - 光泽扫过效果和弹跳动画
   - 发送状态实时显示（发送中→已发送/失败）
   - 防重复点击保护

3. **跨域数据传递**：突破浏览器安全限制，实现可靠的数据传递
   - **主要方案**：URL hash + Base64编码（不受重定向影响）
   - **备用方案**：GM_setValue/GM_getValue（Tampermonkey跨域共享）
   - 5分钟数据有效期，自动过期清理

4. **全自动搜索**：点击按钮后完全自动化
   - 自动跳转到色花堂搜索页面
   - 无弹窗，自动开始搜索
   - 自动提取标题和磁力链接
   - 自动提交到后端API

5. **🆕 全局冷却机制**：防止频繁请求，保护服务器资源
   - **30秒冷却期**：点击任意按钮后启动30秒全局冷却
   - **按钮禁用**：冷却期间所有"🌸色花堂"按钮变灰且无法点击
   - **跨页面同步**：多个标签页/窗口间的冷却状态完全同步
   - **友好提示**：冷却期间点击按钮会显示剩余时间提示
   - **持久化存储**：关闭浏览器重新打开后冷却状态依然有效
   - **自动恢复**：30秒后所有按钮自动恢复正常状态

#### 🛠️ 安装和使用

1. **安装发送端脚本**：`sehuatang_sender.user.js`
   - 在包含番号的网页上自动检测并显示发送按钮
   - 支持动态内容加载的页面
   - 兼容主流番号网站

2. **更新接收端脚本**：`sehuatang_searcher.user.js`
   - 自动接收跨域传入的番号并开始搜索
   - 移除手动输入弹窗，实现完全自动化
   - 保持原有功能完整性

3. **使用流程**：
   ```
   访问包含番号的网页 → 点击"🌸色花堂"按钮 → 自动跳转 → 自动搜索 → 自动提取 → 自动提交 → 30秒冷却期
   ```

4. **🆕 冷却机制说明**：
   - 成功发送后，所有页面的按钮进入30秒冷却期
   - 冷却期间按钮显示"🕐冷却中"且无法点击
   - 点击冷却中的按钮会提示剩余时间
   - 30秒后所有按钮自动恢复正常状态

#### 🎨 用户体验优化
- **视觉反馈**：按钮hover效果、状态动画、Toast提示系统
- **交互增强**：右键菜单、复制功能、调试工具
- **🆕 冷却管理**：简洁的按钮禁用状态，不干扰页面浏览
- **智能提示**：冷却期间点击显示剩余时间，避免用户困惑
- **错误处理**：智能错误分类、用户友好提示、自动恢复
- **性能优化**：防抖机制、内存管理、过期数据清理

#### 🔧 技术特性
- **跨域通信**：URL hash + GM API双重保障
- **数据安全**：Base64编码、时间戳验证、自动清理
- **🆕 冷却同步**：localStorage + Storage事件实现跨页面状态同步
- **状态管理**：智能定时器管理，防止内存泄漏
- **错误恢复**：多重备用方案、完善的异常处理
- **兼容性**：支持Chrome、Firefox、Edge等主流浏览器

#### 🏆 技术突破
1. **解决了复杂正则表达式兼容性问题**
2. **实现了可靠的跨域数据传递**
3. **创建了完全自动化的用户体验**
4. **🆕 实现了完美的跨页面冷却同步机制**
5. **建立了完善的错误处理机制**

---

## 🆕 SeHuaTang Searcher Pro v2.2 功能

### 智能冷却期管理
解决了"刚打开搜索主页就提示跳过执行"的问题：

1. **智能页面检测**：区分首页、搜索页面和其他页面
2. **差异化冷却期**：
   - 首页/搜索页面：1秒启动冷却，10秒重复操作冷却
   - 其他页面：2秒启动冷却，30秒重复操作冷却
3. **首次访问优化**：首次访问或长时间未执行时直接允许执行
4. **页面刷新检测**：自动清理过期状态，避免误判
5. **友好提示信息**：显示剩余冷却时间和详细状态

### 增强的调试功能
1. **状态查看**：`SeHuaTangConfig.getStatus()` - 查看详细运行状态
2. **状态清理**：`SeHuaTangConfig.clearState()` - 手动清除状态
3. **智能重置**：自动检测异常状态并重置

### 用户体验优化
1. **禁用剪贴板复制**：不再自动复制磁力链接到剪贴板
2. **简化页面关闭**：搜索页面在点击链接时立即关闭，内容页面处理完后关闭
3. **Apple风格弹窗**：保存失败时显示美观的错误提示弹窗
4. **智能页面管理**：使用更简单可靠的页面关闭逻辑

## 静默API提交
在成功提取到标题和磁力链接后，脚本会自动执行以下操作：

1. **静默处理**：不显示任何弹窗提示或用户通知
2. **标题清理**：自动移除标题中的标记，如：
   - `[自提征用]` 或 `【自提征用】`
   - `[无码破解]` 或 `【无码破解】`
   - `[高清中文字幕]` 或 `【高清中文字幕】`
   - 其他类似的标记模式
3. **数据提交**：向后端API发送HTTP请求，包含：
   - 番号（自动从搜索关键词或页面内容提取）
   - 清理后的标题
   - 磁力链接
   - 时间戳
   - 数据源标识
4. **错误处理**：包含重试机制和超时处理
5. **数据验证**：确保所有必要字段都不为空且格式正确

## 配置选项

### 默认配置
- API端点：`http://localhost:3226/movies`
- 静默模式：已启用（不显示弹窗）
- 剪贴板复制：已禁用（不复制磁力链接）
- 自动关闭页面：已启用（成功后自动关闭）
- 页面关闭模式：智能关闭（搜索页点击时关闭，内容页处理完关闭）
- API超时：10秒
- 重试次数：2次

### 自定义配置
在浏览器控制台中使用以下命令：

```javascript
// 设置API端点
SeHuaTangConfig.setApiEndpoint('http://your-api-server.com/api/submit');

// 查看当前API端点
SeHuaTangConfig.getApiEndpoint();

// 启用/禁用静默模式
SeHuaTangConfig.setSilentMode(true);  // 启用静默模式
SeHuaTangConfig.setSilentMode(false); // 禁用静默模式，显示弹窗

// 查看静默模式状态
SeHuaTangConfig.getSilentMode();

// 查看所有配置
SeHuaTangConfig.showConfig();

// 🆕 查看扩展运行状态（表格形式显示）
SeHuaTangConfig.getStatus();

// 🆕 清除扩展状态（解决冷却期问题）
SeHuaTangConfig.clearState();

// 🆕 启用/禁用成功后自动关闭页面
SeHuaTangConfig.setAutoClose(true);  // 启用自动关闭
SeHuaTangConfig.setAutoClose(false); // 禁用自动关闭

// 🆕 查看自动关闭状态
SeHuaTangConfig.getAutoClose();

// 🆕 设置页面关闭模式
SeHuaTangConfig.setCloseMode('smart');   // 智能关闭（搜索页点击时关闭）
SeHuaTangConfig.setCloseMode('current'); // 仅关闭当前页面
SeHuaTangConfig.setCloseMode('none');    // 不自动关闭

// 🆕 查看页面关闭模式
SeHuaTangConfig.getCloseMode();

// 测试API连接
SeHuaTangConfig.testApi();

// 启用调试模式
SeHuaTangDebug.enable();

// 禁用调试模式
SeHuaTangDebug.disable();
```

## API接口规范

### 请求格式
```json
{
  "fanHao": "SSIS-123",
  "title": "清理后的标题",
  "magnetLink": "magnet:?xt=urn:btih:...",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "source": "sehuatang_searcher"
}
```

### 响应格式
成功响应（HTTP 200）：
```json
{
  "success": true,
  "message": "数据已成功保存",
  "id": "generated-id"
}
```

错误响应（HTTP 4xx/5xx）：
```json
{
  "success": false,
  "error": "错误描述"
}
```

## 番号提取规则

脚本会按以下优先级提取番号：
1. 搜索关键词
2. URL参数（keyword, query, srchtxt）
3. 页面标题中的番号模式
4. 页面内容中的番号模式

支持的番号格式：
- 标准格式：SSIS-123, IPX-456, STARS-789
- 简化格式：S123, I456
- 数字格式：123456_001

## 错误处理

### 网络错误
- 自动重试机制（默认2次）
- 指数退避策略
- 超时保护（默认10秒）

### 数据验证错误
- 番号为空
- 标题为空
- 磁力链接为空或格式无效

### 页面状态错误
- 页面正在卸载
- 已完成过提取
- 静默模式下跳过错误弹窗

## 使用说明

1. 安装Tampermonkey扩展
2. 导入用户脚本
3. 访问SeHuaTang论坛
4. 脚本会自动执行搜索和提取操作
5. 提取成功后会静默提交到配置的API端点

## 注意事项

- 确保后端API服务正在运行
- 检查API端点配置是否正确
- 在调试模式下可以查看详细的执行日志
- 静默模式下不会显示任何弹窗，所有操作都在后台进行

## 🔧 故障排除

### 问题：刚打开搜索主页就提示"跳过执行"

**原因**：扩展的冷却期机制防止重复执行

**解决方案**：
1. **立即解决**：在控制台执行 `SeHuaTangConfig.clearState()`
2. **查看状态**：执行 `SeHuaTangConfig.getStatus()` 了解详细信息
3. **等待冷却**：首页/搜索页面通常只需等待1-10秒

### 问题：扩展长时间不工作

**解决方案**：
1. 检查扩展状态：`SeHuaTangConfig.getStatus()`
2. 清除状态：`SeHuaTangConfig.clearState()`
3. 刷新页面重新初始化
4. 启用调试模式：`SeHuaTangDebug.enable()`

### 问题：API提交失败

**解决方案**：
1. 测试API连接：`SeHuaTangConfig.testApi()`
2. 检查API配置：`SeHuaTangConfig.showConfig()`
3. 确认后端服务运行状态
4. 查看浏览器网络面板的错误信息

**现象**：会显示Apple风格的错误弹窗，提示"保存失败"

### 问题：不希望自动关闭页面

**解决方案**：
```javascript
SeHuaTangConfig.setAutoClose(false);  // 完全禁用自动关闭
// 或者
SeHuaTangConfig.setCloseMode('none'); // 设置关闭模式为不关闭
```

### 问题：只想关闭当前页面，不关闭搜索页面

**解决方案**：
```javascript
SeHuaTangConfig.setCloseMode('current'); // 仅关闭当前页面
```

### 问题：希望智能关闭多个页面

**解决方案**：
```javascript
SeHuaTangConfig.setCloseMode('smart'); // 智能关闭模式（默认）
```

**说明**：智能模式会在搜索页面点击链接时立即关闭搜索页面，内容页面处理完成后关闭内容页面。

### 🆕 问题：发送器按钮显示"🕐冷却中"无法点击

**原因**：发送器的30秒全局冷却机制正在生效

**解决方案**：
1. **正常情况**：等待30秒后按钮自动恢复
2. **查看剩余时间**：点击冷却中的按钮会显示剩余秒数
3. **强制解除**：在控制台执行以下命令（仅用于调试）：
   ```javascript
   localStorage.removeItem('sehuatang_sender_cooldown_start');
   localStorage.removeItem('sehuatang_sender_cooldown');
   location.reload(); // 刷新页面
   ```

### 🆕 问题：多个页面的按钮状态不同步

**原因**：跨页面同步机制可能出现异常

**解决方案**：
1. **刷新所有相关页面**：让所有页面重新检查冷却状态
2. **手动同步**：在任意页面的控制台执行：
   ```javascript
   // 清除冷却状态
   localStorage.removeItem('sehuatang_sender_cooldown_start');
   localStorage.removeItem('sehuatang_sender_cooldown');
   // 刷新当前页面
   location.reload();
   ```
3. **检查浏览器设置**：确保localStorage功能正常

### 问题：希望恢复剪贴板复制功能

**说明**：v2.2版本默认禁用了剪贴板复制，如需恢复：
```javascript
// 注意：需要修改扩展源码中的 copyToClipboard 配置
// 或联系开发者添加控制台命令
```

### 调试技巧

```javascript
// 完整的调试流程
SeHuaTangConfig.getStatus();        // 查看当前状态
SeHuaTangDebug.enable();           // 启用详细日志
SeHuaTangConfig.clearState();      // 清除状态
SeHuaTangConfig.getAutoClose();    // 检查自动关闭状态
SeHuaTangConfig.getCloseMode();    // 检查页面关闭模式
// 然后刷新页面测试
```
