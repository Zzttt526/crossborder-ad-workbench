# AdPilot · 跨境广告投流自动化工作台 Demo

面向公司展示的纯前端 MVP，用 Mock 数据演示 Campaign 管理、定时开关、时段效果分析和操作审计。项目不连接真实广告账号，也不会调用真实平台 API。

## 启动

在 PowerShell 中进入项目目录，执行：

```powershell
npm run demo
```

访问 `http://127.0.0.1:4173/`。

`demo` 脚本会将 npm 缓存、Playwright 浏览器、会话数据和临时目录统一指向 `E:\工作台\.cache`；项目的可控产物不写入 C 盘。

## 演示路线

1. Dashboard 查看 6 个核心指标、凌晨低效提醒和下一次自动任务。
2. 在“自动化规则”模拟执行三条固定规则：
   - `美国凌晨低效停投`：执行成功。
   - `Google 低效时段停投`：平台超时并重试 3 次。
   - `人工暂停保护验证`：识别人工暂停后安全跳过。
3. 切换到“广告管理”和“操作日志”，查看跨页状态和执行记录。
4. 点击顶部“重置演示”，即可恢复初始状态。

## 验收

```powershell
npm run verify
```

该命令依次运行 Mock 数据测试、TypeScript/Vite 构建和 Playwright 关键演示流程。浏览器报告与截图位于 `output/playwright/`。
