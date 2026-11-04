# 真命天喵小程序

## 项目信息

- 小程序代码根目录：`miniproduct-1/`，使用微信小程序原生开发（`app.json` + `pages/` + `components/`）。
- 关联 iOS 项目：`/Users/jingjun/Desktop/Githup/LaveCat`。在本项目的需求只准参考 iOS 端的实现，不能修改 iOS 端的代码。iOS 项目的 `AGENTS.md` 记录的是列表页样式约定，可作为交互和状态设计的参考；其中 `UITableView`、`DZNEmptyDataSet`、`BaseRefresh`、`BaseFooterRefresh` 等 iOS 专有实现不适用于小程序。
- 本文档把 iOS `AGENTS.md` 中可迁移的内容（列表空态、刷新、分页、失败处理）对应到小程序的现有组件和写法。

## 目录与基础设施

- 页面：`miniproduct-1/pages/`，每个页面由 `.js` / `.json` / `.wxml` / `.wxss` 四个文件组成。
- 公共组件：`miniproduct-1/components/`，列表页主要复用 `topicitem`（内容卡片）和 `emptypage`（空态，注册名通常为 `custom-empty`）。
- 接口地址：`miniproduct-1/config/api.js`。
- 网络请求：`miniproduct-1/config/network.js`，已封装 `wx.request` 为 Promise，并统一处理 `code == 401`（清除登录态并跳转登录页）。页面内不要重复实现 401 处理。
- 颜色与字号：`miniproduct-1/config/colors.js`。新增代码优先引用其中的色值，避免散落硬编码。
- 图片地址拼接、时间格式化等：`miniproduct-1/utils/common.wxs`。

## 列表页面约定

以下约定适用于消息页的点赞/收藏列表、我的收藏、我的发布、浏览历史，以及后续新增的同类列表。新增或修改列表时沿用现有控件和状态字段，不要另做一套加载与失败提示。

### 数据结构

列表页的 `data` 统一使用以下字段：

```js
data: {
  page: 1,          // 当前请求页，从 1 开始
  size: 10,         // 每页数量，与接口保持一致
  items: [],        // 已加载的数据
  isLoadEnd: false, // 是否已无更多数据
  loading: 1,       // 1：首次加载中；2：首屏请求结束（成功或失败）
  emptyItem: { title: '暂无数据', desc: '请点击重试' },
}
```

### 列表与空态

- 列表页使用 `scroll-view` 承载内容，页面结构沿用：

```xml
<view class='backview'>
  <scroll-view scroll-y class='scroll-page'>
    <view wx:if='{{loading == 2 && items.length == 0}}'>
      <custom-empty item='{{emptyItem}}' bind:emptyDidClick='emptyPageClick'></custom-empty>
    </view>
    <view wx:elif='{{loading == 2 && items.length > 0}}'>
      <view wx:for='{{items}}' wx:for-item='item' wx:key='key'>
        <custom-topicitem item='{{item.topicInfo}}'></custom-topicitem>
      </view>
    </view>
  </scroll-view>
</view>
```

- 空态统一使用 `components/emptypage`（`custom-empty`），不要为单个页面另写空态视图。
- `emptyItem` 包含 `title` 和 `desc`。正常空数据文案为「暂无数据 / 请点击重试」，业务页面可按场景改写描述（例如「快去收藏喜欢的宠物吧」「快去发布宠物信息吧」）；请求失败文案使用「网络加载失败 / 请检查网络后重试」。
- 空态整体可点击，通过 `bind:emptyDidClick` 重新请求第一页。
- 首次加载且 `items` 为空时显示 loading（`wx.showLoading({ title: '正在加载' })`）；`loading == 1` 期间不要显示空态。下拉刷新控件正在转动时，不重复弹出空态加载动画。
- 空态配色与 `components/emptypage/emptypage.wxss` 保持一致：标题 `#333333`（`ColorsUntil.content`），描述 `#8b8b8b`（`ColorsUntil.desc`）。
- 已有列表数据时，刷新或下一页失败应保留已有内容，允许继续下拉/上拉重试；不要用阻断式弹窗代替列表失败态。账号受限、登录失效等业务状态单独处理。

### 刷新与分页

- 列表页在页面 `.json` 中开启下拉刷新，并设置合适的触底距离：

```json
{
  "enablePullDownRefresh": true,
  "onReachBottomDistance": 100
}
```

- 下拉刷新由 `onPullDownRefresh` 触发，重新请求第一页；上拉加载由 `onReachBottom` 调用 `onBottom()`，加载下一页。
- 上拉前先判断 `isLoadEnd`，已无更多数据时直接返回，避免重复请求。
- 请求第一页时直接替换 `items` 并设置 `loading: 2`；请求后续页时使用 `items.concat(newItems)` 追加，不要覆盖已有数据。
- 返回条数等于 `size` 时 `page += 1`，否则设置 `isLoadEnd = true`。
- 请求结束后必须调用 `wx.stopPullDownRefresh()`；首次 loading 同时调用 `wx.hideLoading()`。建议在 Promise 的 `catch` / `finally` 中收尾，保证失败时也能结束刷新和加载动画。
- 下一页失败时不要清空 `items`，也不要设置 `isLoadEnd = true`，保持在可重试状态。
- 列表顶部不要再加专用的「重新加载」按钮。

### 参考实现

- 我的收藏：`miniproduct-1/pages/myinfo/collection/collection.js`、`collection.wxml`
- 我的发布：`miniproduct-1/pages/myinfo/publish/publish.js`、`publish.wxml`
- 浏览历史：`miniproduct-1/pages/myinfo/history/history.js`、`history.wxml`
- 消息列表（点赞/收藏/评论）：`miniproduct-1/pages/messageinfo/messageinfo/messageinfo.js`、`messageinfo.wxml`
- 首页列表：`miniproduct-1/pages/homeinfo/homepage/homepage.js`、`homepage.wxml`
- 空态组件：`miniproduct-1/components/emptypage/`
