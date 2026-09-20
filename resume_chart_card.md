# 简历条目：图表卡片组件（NE/Object 双视图）

> 与 `chart-card.vue` / `custom-object.vue` / `custom-legend.vue` 当前代码核对一致。

## 项目背景（一句话）

核心网维护大屏的 KPI 图表卡片，支持网元视图（NE）与对象突变分析视图（Object）切换，单卡同时承载曲线渲染、图例筛选、时间范围比对、突变面板浮层。

## 三条主推亮点

- **图表架构**：设计实现 NE/Object 双视图切换组件，复用单个 ECharts 实例 + 数据快照（`popData` 暂存 / `setData` 恢复）替代双实例方案，规避多组件竞争同一实例；浮层以 `pointer-events: none` 透传 + 子元素 `pointer-events: all` opt-in，让交互直达底层 canvas，浮层与图表同区域共存而不互斥。

- **组件协作**：父子组件通过 `defineExpose` 约定 `reset()` / `setTimeRange()` / `clearAll()` 方法协议，父组件按"方法调用 + emit 事件"职责分离，避免跨层直接操作 ref 内部状态，新增模式时只需扩展协议方法。

- **渲染性能**：针对数百条曲线场景，为图例实现定高虚拟滚动（`translateY` 窗口化 + `ResizeObserver` 自适应可视行数，DOM 节点恒定 ~20 个）；对 ECharts 启用 `progressive` 渐进渲染（阈值 200 / 批 400）；将原 160 硬上限重构为 500 软警告，由虚拟滚动 + 渐进渲染共同兜底，决策权交还用户。

## 禁用表述（曾踩坑）

| 错误说法 | 为何不能用 |
|---|---|
| 分层穿透 / 事件层统一捕获分发 | 实际是 CSS `pointer-events` 透传，无 JS dispatch |
| 规避 z-index 堆叠博弈 | z-index 只有 0/1/2 且是 toggle-button 局部堆叠 |
| 三处统一限流收敛 Legend 至 160 | 对应的是**已删除**的旧代码，现版本是 500 软警告 |
