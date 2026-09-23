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

建议面试前把 filter-table.vue 的 props 清单和 risk-detail-grid.vue 的 loadDataMethod 累积逻辑再背一遍，这是两个最容易被追问深入的实现细节。

◆ 基于当前代码和 git 历史（06c9a1b 曾引入后端动态下拉，c87bc95 又改回输入+固定选项），两种方案对比如下：

两种方案的定位

┌──────────────┬────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────┐
│              │          方案A：手动输入搜索（filter_type: 'input'）           │ 方案B：后端字段下拉（filter_type: 'select' + 动态 filter_options） │
├──────────────┼────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│ 选项来源     │ 无，用户自由输入                                               │ 需 API 返回选项（如 getDictList），或静态写死                      │
├──────────────┼────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│ 匹配语义     │ 模糊 like 匹配，字段是标识符/名称时自然                        │ 精确枚举匹配，值必须是枚举内的合法值                               │
├──────────────┼────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│ 校验需求     │ 必须：特殊字符/长度/整数/范围校验（column-header.vue:204-286） │ 基本无需校验，选项即合法值                                         │
├──────────────┼────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│ 交互成本     │ 用户要打字，且可能拼错/格式错                                  │ 点选即可，零输入错误                                               │
├──────────────┼────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│ 后端接口要求 │ 列表接口支持模糊查询参数                                       │ 额外要一个"字段枚举值"接口，且枚举值与列表接口取值必须严格一致     │
└──────────────┴────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────┘

实现层面差异（这是关键）

方案B（后端动态下拉）比方案A 多出 4 个隐性成本，项目里都踩过：

1. 异步加载时机：选项不能在组件初始化时拉，要在打开弹层时才请求（getSelections 挂在 watch(filterVisible) 上，column-header.vue:191-198），否则白请求。
2. el-table header slot 缓存问题：el-table 会缓存表头，动态注入的选项不刷新，被迫加 tableKey 属性强制整表重渲染（06c9a1b 为此专门加的）。
3. 失败兜底：选项接口挂掉或字段无枚举值时，下拉直接为空，用户无法筛选；input 方案没有这个故障面。
4. 列配置耦合：每个动态列都要在 getSelections 里加一个 name === 'xxx' 分支（原版 column-header.vue:335-343），通用性变差。

方案A 则只需在列配置里声明 filter_type: 'input'（可配 validate: false 跳过特殊字符校验、input_length 限长），零额外请求、零缓存问题。

这个项目最终的选择（risk-constants.js）

neName/neType/neId/riskName/riskType  →  input（neType 等 validate:false）
riskLevel                              →  select + 静态 filter_options（固定 低/中/高）
solution                               →  无筛选

选型依据（对应 c87bc95 的改动理由）：

- 字段值域是"自由文本/标识符"（网元ID、风险名称）→ input：没有稳定枚举，下拉选项无从谈起；后端本来就是模糊查询，用户直接输更快。
- 字段值域是"固定有限枚举"（风险等级 3 档）→ select 但选项静态写死：枚举值确定不变，没必要为它多一次 API 请求和 tableKey 重渲染机制，静态 RISK_LEVEL_OPTIONS 即可。
- 后端动态下拉只在"枚举值本身会变且与列表强相关"时才有价值——当前场景没有这种字段，所以 filter_options 的 API 注入能力（06c9a1b 加的）保留但不再被风险页使用。

一句话总结：两者本质是"自由文本模糊匹配" vs "受控枚举精确匹配"的取舍；输入方案更通用、实现成本低，下拉方案交互更稳但要求字段有稳定枚举且多一层选项数据源。当前代码是按"字段值域形态"混合配置的：自由文本走 input，固定枚举走静态 select，后端动态枚举这条路被验证成本过高后放弃。

✻ Worked for 4m 2s

※ recap: 目标是让风险检查页支持手动输入搜索而非后端下拉筛选，当前已确认采用输入方案并保留静态等级下拉，下一步按此方案调整列配置和筛选逻辑。 (disable recaps in /config)

▐                                                                                                                                                                                                                                                                                                                     
▐  自由文本模糊匹配怎么做的                                                                                                                                                                                                                                                                                           
▐  2026-09-23 15:24:21                                                                                                                                                                                                                                                                                                
▐

Searched for 1 pattern, read 1 file

◆ 自由文本模糊匹配的完整链路如下——前端全程不做匹配，只负责"收文本 → 校验 → 透传给接口"，真正的 LIKE 匹配在后端服务里：

链路逐段拆解

1. 用户输入 + 提交（column-header.vue）

filter_type: 'input' 的列，弹出层渲染 el-input（column-header.vue:66-70），点"筛选"后 submitForm 先过两重校验：

// column-header.vue:204-230
specialCharactersRule  // ne_name/ne_type: /[*|:"'<>?\\/]/，其余: /&<>"':[\]$()+\\/#`*;=^|/
inputLengthRule       // 超 input_length 拦截

校验通过后把原始文本作为列名参数传出：

props.loadDataMethod({[props.column.name]: filterValue})  // column-header.vue:383

2. filter-table 中转（filter-table.vue）

column-header 收到的 loadDataMethod 就是 filter-table 的 loadData（filter-table.vue:39）。loadData 只做两件事：重置到第 1 页、强制 start: 0，然后连同筛选文本一起交给父组件（filter-table.vue:255-266）。

3. 父组件累积筛选参数（risk-detail-grid.vue:131-148）

这是"多列条件同时生效"的关键——参数不是一次覆盖，而是累积进 columnFilterParams：

Object.entries(params).forEach(([key, value]) => {
if (key !== 'start' && key !== 'limit') {
if (Array.isArray(value)) columnFilterParams.value[key] = value.length > 0 ? value[0] : '';
else columnFilterParams.value[key] = value;   // {neName:'xxx', riskName:'yyy'} 一直保留
}
});

4. 组装请求体（risk-detail-grid.vue:103-128）

列配置的 name（如 neName）和接口字段名（如 ne_name）在这里显式映射：

getRiskCheckNeDetails({
ne_type:   filters.neType,     // 模糊
ne_type_exact: base.ne_type_exact,  // 精确（概览卡片点击带过来的）
ne_id:     filters.neId,
risk_name: filters.riskName,
ne_name:   filters.neName,
...
})

5. 接口 POST（api/risk.js:18-24）

原样 JSON body 发到 /adc-service/.../cne_dash_risk_check_ne_details，后端 EdgeCoreNetExpertService 收到 ne_name: 'xxx' 后在 SQL/EF 里做 LIKE '%xxx%' 查询——模糊匹配的语义完全由后端接口决定。

三个值得注意的设计点

- 模糊/精确由参数名契约决定，前端只选不实现：同一表格里 ne_type（模糊）和 ne_type_exact（精确）同时存在，说明后端两种语义都支持，前端靠换参数名切换，列配置里没有任何匹配模式字段。
- 空串 = 不过滤：重置时 resetForm 调 loadDataMethod({[column.name]: ''})（column-header.vue:399），空串累积进 columnFilterParams，后端收到空串自然不产生过滤条件。
- 校验是模糊匹配的安全前置：模糊查询直接拼进 SQL，所以提交前用 validate: false（risk-constants.js:24 的 neType）跳过校验的列，是业务上确认这些字段无注入风险才放的；ne_name 这类保留默认校验。

alarm-grid 走的是同一套路（alarm-grid.vue:162-164 用 Object.assign(filterParams, requestParams) 累积后交给 useDataSource 的 store 请求），区别只是请求封装换成 store 驱动。

✻ Worked for 2m 48s

※ recap: 目标是实现风险检查详情表格的模糊搜索筛选。当前已确认自由文本筛选走前端透传、后端LIKE匹配的链路，下一步按此模式继续完善筛选交互与参数传递。 (disable recaps in /config)

▐                                                                                                                                                                                                                                                                                                                     
▐  前端透传是指什么                                                                                                                                                                                                                                                                                                   
▐  2026-09-23 15:47:08                                                                                                                                                                                                                                                                                                
▐

◆ "透传"在这个场景指：前端收到用户的输入文本后，不做任何匹配/加工/解释，原样把值传给下一层，直到交给后端接口。文本本身对前端是"不透明"的——前端不知道、也不关心它是模糊匹配还是精确匹配，只负责搬运。

代码里透传的每一步

用户输入 "NE001"
│
▼
① column-header.vue:383   props.loadDataMethod({neName: 'NE001'})
│                        // 原样，未修改
▼
② filter-table.vue:255-266 loadData({...param, start:0, limit:size})
│                        // 只是"包一层"补分页参数，param 内容原样
▼
③ risk-detail-grid.vue:131 columnFilterParams.neName = 'NE001'
│                        // 存进累积对象，值未变
▼
④ risk-detail-grid.vue:117 ne_name: filters.neName
│                        // 只改了"键名"（neName→ne_name），值未变
▼
⑤ api/risk.js:18-24        POST body: {..., ne_name: 'NE001', ...}
│
▼
后端服务 → SQL LIKE '%NE001%'

关键区别在于：每一层对值（'NE001'）做的处理只有——
- ① 的校验（拦截非法字符/超长，是"门卫"不是"加工"）
- ④ 的键名映射（neName → ne_name，改的是字段名不是值）

值本身从前端入口到接口出口一字不改。后端拿到 ne_name: 'NE001' 后是 LIKE 还是等于，前端完全不知道也控制不了——这就是"语义放在后端，前端只做透传"。

反例对比（什么是"不透传"）

如果前端自己匹配，就会是：拿已加载的 tableData 在内存里 row.neName.includes('NE001') 过滤——那是前端本地过滤，数据不经过后端。本项目的 filter-table 刻意不走这条路，因为：

1. 数据在服务端：表格是分页查询的，前端手里只有当前页几十条，本地过滤只能筛当前页，筛不到全量数据。
2. 职责分离：filter-table 是"哑组件"——它不知道 neName 该模糊还是精确、字段对应后端哪个参数，这些语义全部由父组件（risk-detail-grid）和后端契约决定，组件保持可复用。

所以"透传"的本质是：值不过手、语义外包——前端管收和送，匹配规则归后端。

✻ Worked for 1m 44s

※ recap: 目标：修复网元抽屉告警列表的加载异常。当前任务：对比 alarm-grid 与风险表格的透传实现，定位差异。下一步：检查 alarm-grid.vue 的请求链路。 (disable recaps in /config)

▐                                                                                                                                                                                                                                                                                                                     
▐  我简历里写基于element-plus二次封装表格组件,支持表头筛选，在多场景复用，还有什么亮点写进去，面试官可能的问题和回答                                                                                                                                                                                                  
▐  2026-09-23 17:35:00                                                                                                                                                                                                                                                                                                
▐

◆ 基于你这个 filter-table 组件的实际实现，帮你把简历表述升级并整理面试弹药。

简历亮点表述

原始版（太平，面试官扫一眼就过）：                                                                                                                                                                                                                                                                                  
▎ 基于element-plus二次封装表格组件，支持表头筛选，在多场景复用

升级版（动词 + 设计思想 + 量化结果）：

▎ 基于 element-plus 二次封装配置驱动的通用筛选表格组件（filter-table），列配置数组驱动渲染，内置 input/select/date/range 四种筛选控件与校验体系，通过注入式 loadDataMethod 统一编排服务端分页/筛选/排序，提供作用域插槽与主题适配扩展点，在告警卡片、拓扑抽屉、风险详情 4 个场景复用，替代重复的手写分页筛选逻辑。

可以加进去的额外亮点

1. 配置驱动渲染：组件零业务代码，列定义（字段/表头/筛选类型/排序/校验/宽度）全部收敛在常量配置（COLUMNS）里，新页面接入只需传 columnList + loadDataMethod。
2. 控制反转（IoC）的数据加载设计：组件不直接发请求，父组件注入 loadDataMethod(params, loadFinished) 回调，形成"组件编排参数、父组件拉数据、prop 回流数据、回调回流 total"的双向契约，职责清晰可复用。
3. 筛选参数累积机制：多列筛选条件跨请求累积，实现"多条件同时生效"的服务端过滤，重置单列不影响其他条件。
4. 四类筛选控件 + 四级校验：输入/多选/日期区间/数值区间，配特殊字符（防注入）、长度、整数范围、区间大小校验，validate:false 可按列跳过。
5. 开放 vs 内置的平衡：默认内置告警 ID 链接、等级色标、诊断状态圆点等渲染，同时暴露 cell 作用域插槽供完全覆盖——开箱即用又不锁死。
6. 命令式 API：defineExpose 暴露 reload/setLoading/loadFinished，父组件可外部触发刷新。
7. 工程化细节：暗/亮主题 CSS 变量 + 资源切换、跨页连续行号、分页超 100 万起始坐标拦截提示、空数据占位、tableKey 解决 el-table header slot 缓存问题。

▎ 简历上挑 3-4 条最有区分度的写，别全堆。建议必留：配置驱动、IoC 数据加载、四种筛选+校验、4 场景复用。

面试官可能的问题与回答

Q1：el-table 自带筛选（filter-method/column filters），为什么自己封装？

▎ 两点原因。一是 el-table 内置筛选是前端本地过滤，filter-method 是在已加载数据的内存里过滤，而我们的表格是服务端分页，前端只有当前页数据，必须把条件传给后端做全量过滤。二是内置表头筛选 UI 太简单，只有单输入/下拉，支撑不了日期区间、数值区间、自定义选项来源、特殊字符校验这些需求，所以用自定义表头 slot +
popover 重做了表头。

Q2：怎么保证多场景复用？不同页面差异这么大怎么兼容？

▎ 三层机制兜差异：列差异用配置（filter_type、sort、min_width、validate 都是列属性）；渲染差异用 cell 作用域插槽覆盖（风险页覆盖了等级列的样式，告警页用默认渲染）；行为差异用 props 开关 + 注入回调（showOperations 控制操作列显隐、singleSelect 切换单选筛选、viewAlarmDetails
等业务动作全部由父组件传入）。组件本身不含任何业务 if-else。

Q3：筛选、排序、分页怎么和接口联动的？

▎ 组件维护分页状态（current/size/total）和 loading，但不直接发请求。筛选/排序/翻页统一走父组件注入的 loadDataMethod(params, loadFinished)：组件负责编排参数（筛选条件、start/limit、sort/dir），父组件拿到后累积进自己的 filterParams 再调接口，返回的数据通过 :data prop 回流渲染，total 通过 loadFinished
回调回流更新分页。

Q4：服务端排序怎么做的？el-table 的 sortable 不用吗？

▎ 需求是服务端排序，el-table 的 sortable/sort-change 是前端排序。所以用自定义列头组件渲染升降序图标，维护 asc/desc 状态，点击后调用 loadData({sort, dir}) 把排序字段传给接口，同时做了重复点击清除排序的逻辑。

Q5：动态下拉选项（选项来自后端）是怎么处理的？遇到过什么问题？

▎ 列配置支持 filter_options 注入，打开筛选弹层时异步获取选项。当时遇到 el-table header slot 缓存导致动态选项不刷新的问题，用 tableKey 变化强制整表重渲染解决。后来发现风险等级这类固定枚举（低/中/高）为它专门发一次 API 不值得，就改成了静态配置——这也是个取舍：动态枚举才用 API 注入，固定枚举走静态配置。

Q6：遇到过哪些坑？

▎ ① el-table header slot 缓存，动态内容不更新 → tableKey 强制重渲染；② el-popover 默认挂 body 导致层级/定位问题 → teleported:false 关掉；③ 表格有滚动条时滚轮无法滚动 → CSS 修复；④ 分页 start 坐标超 100 万会异常 → 拦截并提示；⑤ 模糊查询拼 SQL，输入框做特殊字符校验防注入，个别确认无风险的字段用 validate:false
跳过。

Q7：这个组件后续还能怎么演进？

▎ 列固定/拖拽/显隐、行多选 + 批量操作、操作列按钮改为配置化透传、筛选条件状态提升支持外部 v-model 预设、Excel 导出、树形数据等。

Q8（挖细节）：筛选参数累积，重置单列不会影响其他条件，怎么实现的？

▎ 父组件里维护 columnFilterParams，每次筛选回调把当前列条件写入，请求时全量携带。重置某列时该列传空串，写入后该字段为空即不过滤，其他列条件保留。

  ---
建议面试前把 filter-table.vue 的 props 清单和 risk-detail-grid.vue 的 loadDataMethod 累积逻辑再背一遍，这是两个最容易被追问深入的实现细节。

✻ Worked for 4m 9s

※ recap: 目标是完善简历中 filter-table 表格组件的亮点描述与面试问答。当前已完成亮点整理和常见问题回答。下一步可继续补充组件 props 设计细节或追问深挖点。 (disable recaps in /config)

▐                                                                                                                                                                                                                                                                                                                     
▐  建议面试前把 filter-table.vue 的 props 清单和 risk-detail-grid.vue 的 loadDataMethod 累积逻辑再背一遍，这是两个最容易被追问深入的实现细节。                                                                                                                                                                        
▐  2026-09-23 17:45:40                                                                                                                                                                                                                                                                                                
▐

◆ 好，给你把这两块整理成可直接背诵的速查卡。

一、filter-table.vue 完整 props 清单

┌────────────────────────┬───────────────────────┬──────────────────────────────────────────────────────────────────────────────────┬─────────────────────────────┐                                                                                                                                                 
│         props          │      类型/默认值      │                                       作用                                       │           追问点            │                                                                                                                                                 
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤                                                                                                                                                 
│ data                   │ Array                 │ 表格数据，父组件回流                                                             │ 组件不自己存数据            │                                                                                                                                                 
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤                                                                                                                                                 
│ columnList             │ Array                 │ 列配置数组（核心）                                                               │ 配置驱动，字段见下          │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ loadDataMethod         │ Function              │ 数据加载契约 (params, loadFinished)                                              │ 最核心，见 Q3               │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ maxTableHeight         │ String                │ 表格最大高度                                                                     │ 配合容器自适应              │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ viewAlarmDetails       │ Function              │ 告警 ID 点击跳详情                                                               │ 业务动作注入                │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ viewDiagnosisReport    │ Function              │ 查看诊断报告                                                                     │ 同上                        │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ handleTriggerDiagnosis │ Function              │ 手动触发诊断                                                                     │ 同上                        │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ size                   │ Number, 默认 5        │ 默认每页条数                                                                     │ —                           │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ mdafSwitchOn           │ Boolean, 默认 false   │ 诊断能力开关：控制 diagnosis_status 列显隐（visibleColumnList 过滤）+ 操作列图标 │ 列级显隐用配置              │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ singleSelect           │ Boolean, 默认 false   │ 筛选单选模式：选中即提交并关弹层                                                 │ 透传给 column-header        │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ showOperations         │ Boolean, 默认 true    │ 操作列显隐（拓扑/诊断图标）                                                      │ 告警场景默认开，抽屉/风险关 │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ tableKey               │ String/Number/Boolean │ el-table :key，变化强制重渲染                                                    │ header slot 缓存问题        │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ pageSizes              │ Array, 默认 [5..50]   │ 分页大小选项                                                                     │ —                           │
├────────────────────────┼───────────────────────┼──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
│ paginationLayout       │ String                │ 分页布局                                                                         │ —                           │
└────────────────────────┴───────────────────────┴──────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────┘

defineExpose（面试常问"父组件怎么刷新表格"）：reload（= loadData，重置到第 1 页）、setLoading、loadFinished。

列配置字段（columnList 每项）：name（数据字段，同时是 el-table prop）、i18n_name（表头翻译 key）、filter_type（input/select/date/range/''）、sort、min_width、filter_options（select 静态/动态选项）、input_length、validate:false（跳过特殊字符校验）。

二、risk-detail-grid.vue 的 loadDataMethod 累积逻辑

const loadDataMethod = async (params, loadFinished) => {
// ① 累积筛选参数（跨请求保留）
Object.entries(params).forEach(([key, value]) => {
if (key !== 'start' && key !== 'limit') {          // 控制参数不进累积
if (Array.isArray(value)) {
columnFilterParams.value[key] = value.length > 0 ? value[0] : '';
} else {
columnFilterParams.value[key] = value;         // {neName:'xx', riskName:'yy'} 一直保留
}
}
});

    const start = params.start ?? 0;
    const limit = params.limit ?? 10;
    const result = await loadDetails(start, limit);      // ② 全量条件 → 接口
    loadFinished(result);                                // ③ 回调回流 {total}
};

背诵要点（三层逻辑）：

1. 参数从哪来：filter-table 调 loadDataMethod({columnName: filterValue, start, limit})——筛选/排序/翻页统一入口，组件只编排参数。
2. 累积规则：start/limit 是分页控制参数，剔除；其余按列名存进 columnFilterParams。所以先筛 ne_name 再筛 risk_name，两个条件同时保留 → 多条件 AND 语义。loadDetails 里全量携带（risk-detail-grid.vue:108-119）。
3. 值处理：数组值（date 区间/range 区间/多选）取 value[0]，空数组存空串。空串 = 不过滤（重置单列就是存 ''，其他列不受影响）。
4. 回流：loadDetails 里 tableData.value = response.results（数据走 :data prop 回流渲染），loadFinished({total}) 走回调回流分页 total + 关闭 loading。

对比记忆：alarm-grid 是同一模式（alarm-grid.vue:162-164 Object.assign(filterParams.value, requestParams) 累积），区别只是用 useDataSource store 驱动请求。

追问应对（每题一句话锚点）

- "为什么累积"：服务端分页 + 多条件过滤，条件必须跨请求保留，否则筛了 A 列再筛 B 列 A 条件就丢了。
- "重置怎么只清一列"：resetForm 传 {[column]: ''}，写入空串覆盖该列，后端空串不过滤。
- "数组为什么取 [0]"：风险页全是 input/singleSelect，数组分支是通用兜底；date 区间这类在 risk 场景没用到。
- "数据流闭环"：loadDataMethod 出参 → 接口 → :data 进、loadFinished 回 total，双向回流。

建议把 filter-table.vue:142-183（props）、:330-334（defineExpose）、risk-detail-grid.vue:131-148（累积）这三段在编辑器里再看一遍原文，面试时能说出行号级细节，可信度直接拉满。
