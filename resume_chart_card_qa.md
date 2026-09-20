# 面试问答：图表卡片组件

## 核心话术（被问"三个改动什么关系"必答）

> 原本前端用 160 硬上限，是因为 legend 全量渲染 + canvas 一次性绘制都扛不住。我先改虚拟滚动解决 DOM 瓶颈、改 progressive 解决主线程长阻塞，瓶颈消除后就把硬墙松成 500 软警告，把"加不加曲线"的决定权还给用户。三个改动是一条因果链，不是三个孤立优化。

---

## Q1：为什么要用单 ECharts 实例 + 数据快照，而不是双实例？

**答**：NE 视图和 Object 视图共用同一个 `edge-chart-card` 内的 ECharts 实例（`edgeChartCardRef.$refs.enlargeRef`）。切换到 Object 模式时：
1. `popData()` 把当前曲线数据取出暂存到 `tempData`
2. `setSeriesData([])` 清空画布，同时 `setChartStyle` 把 canvas 缩到右侧区域给浮层腾位
3. 切回 NE 模式时 `setData(tempData)` 恢复，并还原样式

**为什么不双实例**：双实例意味着两套 option、两套 resize/tooltip 状态、两个 DOM 容器，切换时还要手动同步时间轴范围。单实例 + 快照让"切换"退化成"存取数据 + 改样式"，状态只有一个源头。

**钩子**：被追问"切换时 canvas 和浮层怎么共存" → 引到 Q2。

---

## Q2：浮层和 ECharts canvas 在同一区域，交互怎么不冲突？

**答**：浮层容器 `.object-chart-container` 设 `pointer-events: none`，空白区域的鼠标事件直接穿透到下层 canvas，hover/tooltip 照常工作；只有工具条 `.object-toolbar`、图例 `.custom-legend` 等真正可交互的子元素用 `pointer-events: all` 重新接住事件。

**关键点**：这是纯 CSS 透传 + 子元素 opt-in，**没有 JS 事件捕获再分发**。不需要 `dispatchEvent`，不需要 `addEventListener` 转发。

**为什么不用 z-index 解决**：z-index 只决定堆叠顺序，不决定事件归属。即使浮层在视觉上盖住 canvas，只要 `pointer-events: auto`，canvas 就收不到事件。`pointer-events: none` 才是从"事件能不能命中"这个层面解决，比堆 z-index 干净。

**钩子**：被问"z-index 用了吗" → 诚实答：toggle 按钮容器内部用了 0/1/2 做局部堆叠（滑块在底、按钮在中、容器本身 z-index:2），但那是组件内部的小层级，不是浮层与 canvas 之间的博弈。

---

## Q3：虚拟滚动怎么实现的？为什么定高？

**答**（对应 `custom-legend.vue`）：
- `ITEM_HEIGHT = 28`（行高 20px + gap 8px）
- `.legend-list-spacer` 撑总高 `filteredList.length * 28`，滚动条真实
- `.legend-list-viewport` 用 `transform: translateY(startIndex * 28)` 平移可视窗口
- `startIndex = floor(scrollTop / 28)`，`visibleCount = ceil(clientHeight/28) + 2`（上下各缓冲 1 行）
- `ResizeObserver` 监听容器尺寸，动态重算 `visibleCount`
- 搜索过滤 (`filteredList`) 与虚拟滚动正交：搜索后总高和 slice 都基于过滤后数组

**为什么定高**：定高虚拟滚动的核心假设是"每项高度恒定"，这样 `startIndex` 和 `offsetY` 才能用纯算术算出，不需要测量 DOM。代码里靠 `white-space: nowrap` + `overflow: hidden` + 固定 `height: 20px` 保证行高恒定。

**为什么用 translateY 不用 top**：`transform` 触发合成层，不进重排；`top` 会触发 layout。

**钩子（弱点，主动准备好）**：
- 缓冲只有 +2 行，快速滚动可能闪白 → 老实答"+2 在实测数据量下够用，更激进缓冲会多渲染节点；要更稳可以改成 2*visibleCount"
- 没做 `scrollToIndex`（搜索命中后自动滚到目标）→ 是可补的点
- 如果未来文案换行，定高假设崩 → 需要上动态行高虚拟滚动

---

## Q4：ECharts progressive 渐进渲染具体怎么配的？

**答**（对应 `chart-card.vue:181-196`）：
```js
const PROGRESSIVE_THRESHOLD = 200;
if (seriesCount > PROGRESSIVE_THRESHOLD) {
  newSeriesData.forEach((s) => {
    s.progressive = 400;            // 每批渲染 400 个数据点
    s.progressiveThreshold = 200;   // 单条曲线超 200 点才启用
  });
  echartsInstance.setOption({series: [], animation: false}, {replaceMerge: ['series']});
}
```

**三个参数的含义**：
- `progressive: 400` —— 每帧渲染 400 个数据点，分帧提交，主线程能喘气
- `progressiveThreshold: 200` —— 单条曲线点数 < 200 时不走渐进（小数据开 progressive 反有调度开销）
- 外层 `seriesCount > 200` —— 曲线总数门槛，曲线少时全量渲染更快

**为什么先 `setOption({series:[]}, {replaceMerge})`**：
- `replaceMerge: ['series']` 保证旧 series 按 index 合并替换而非追加，避免残留旧曲线
- `animation: false` 避免"清空→灌数据"之间产生闪烁动画
- 这一步是**为了正确性**，不是为了性能，别混为一谈

**钩子**：被问"progressive=400 怎么定的" → 经验值，按 16ms 帧预算和单点绘制成本实测，400 能稳 60fps，再大开始掉帧。

---

## Q5：为什么把 160 硬上限改成 500 软警告？

**答**：这是策略转向，不是单纯调数字。

**旧方案（已删除）的问题**：
1. 未勾选项 `:disabled` 直接灰掉，用户点不动
2. 全选时 `maxAllowed = floor(160/neCount)`，只勾前 N 个，超了报 error
3. `selectedNe` 变化时 `while (currentCurveCount > 160) 从后往前自动反勾选` —— **前端替用户做减法**

**问题本质**：160 这个数字是"渲染能力不足"的妥协，不是业务上限。前端在替用户决定"你不需要看这么多"。

**新方案**：
- 全选就全选，不拦截
- 仅当 `currentCurveCount > 500` 且 `!hasShownPerfWarning` 时弹一次 `warning`（不是 error），之后静默
- `clearAll()` 时重置 `hasShownPerfWarning`

**为什么能松绑**：因为虚拟滚动解决了 legend DOM 瓶颈、progressive 解决了 canvas 主线程瓶颈，渲染侧能扛住更大数据量了，硬墙就失去了存在理由。

**钩子（弱点，主动准备好）**：
- "只警告一次会不会用户忘了" → 重复打扰更差，一次提示后用户已知风险
- "500 怎么定的" → progressive 渲染实测的舒适区间上限，留余量
- "极端情况几千条 progressive 也扛不住" → 那种场景该后端分页/聚合，不是前端无限扛

---

## Q6：defineExpose 暴露的方法协议是怎么设计的？

**答**：
- `custom-object.vue` 暴露 `reset()`：重置 NE 选择、比例输入、时间范围等内部状态
- `custom-legend.vue` 暴露 `clearAll()` / `emitSelected()`：清空勾选、对外 emit 当前选中态
- 父组件 `chart-card.vue` 在模式切换时通过 ref 调用这些方法，而不是直接改子组件内部 ref

**职责分离原则**：
- 子组件：自己管自己的内部状态，通过 `defineExpose` 开放"可被父组件调用的操作"
- 父组件：只调方法 + 监听 emit，不伸手进子组件内部
- 新增模式时：扩展协议方法即可，不用改父组件的跨层逻辑

**钩子**：被问"为什么不直接 v-model 双向绑定" → 内部状态（如 `ratioInput`、`timeRange`）有自己的校验和副作用，双向绑定会让校验逻辑散到父子两处；方法协议把"怎么改"留在子组件内部，父组件只表达"什么时候改"。

---

## 通用原则（被追问任何细节时）

1. **不造词**：说 `pointer-events` 透传，不说"分层穿透"；说虚拟滚动，不说"窗口化渲染引擎"。
2. **承认弱点**：缓冲 +2、没 scrollToIndex、定高假设，主动说反而加分。
3. **因果链优先**：三个改动是一条链（瓶颈→解决→松绑），不是三个孤立优化。被问任何一个都能串回主链。
4. **区分正确性与性能**：`replaceMerge` 清空是正确性，`progressive` 是性能，别混。
