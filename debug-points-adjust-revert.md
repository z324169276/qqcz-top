[OPEN]

# Session: points-adjust-revert

## 症状
- 使用“改积分/直接修改总积分”后：历史记录里出现了调整记录，但页面显示的总积分很快又还原为修改前的值。

## 期望
- 修改积分后，总积分保持为新值；并在其他设备端也能同步为新值。

## 假设（可证伪）
1. 直接修改总积分（DirectPointsEditor）只更新 `families.points/history`，没有同步更新 `families.members[].points`；而刷新/轮询时 UI 读取优先级是 `members[].points`，导致回滚。
2. 写云端部分成功：history 写入成功但 points 写入失败（RLS/网络/并发覆盖），因此刷新时 points 被云端旧值覆盖。
3. 写云端成功但随后被另一端旧数据“全量覆盖式 update”回滚（并发覆盖/离线 pendingSync 重放）。
4. refreshFromCloud 的 lastModified 比较或取值字段不一致，导致未拉取最新数据，界面保持旧 points。
5. 当前页面展示的 points 与实际 store points 来源不一致（例如 Header 显示 displayPoints 动画状态与 store 不一致）。

## 采证计划
- 增加仅在 `?debugPoints=1` 开启的诊断面板，记录：
  - 触发来源（DirectPointsEditor / adjustPoints）
  - 写入前后 points、members[currentMember].points
  - refreshFromCloud 取值时的 data.points 与 member.points 以及最终采用值

