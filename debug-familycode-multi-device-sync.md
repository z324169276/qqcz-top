[OPEN]

# Session: familycode-multi-device-sync

## 症状
- 同一个家庭码在手机/电脑端数据不一致；一端有新增/记录，另一端不更新或不同步。

## 目标
- 同一家庭码在不同设备端的数据保持一致（云端为准），并能在合理时间内自动刷新。

## 假设（可证伪）
1. 家庭码已存在于本地 localStorage，但该设备未写入 `family_memberships`，导致 RLS 拒绝读取/写入，页面只能展示本地缓存（因此“有数据但不更新”）。
2. 前端云端拉取在运行，但 `getFamily` 实际返回 null（权限/网络/表结构错误），且错误被吞掉，导致用户无法感知。
3. 云端写入失败（RLS/网络），触发 pendingSync，但 pendingSync 清理或重放异常，导致多端长期分叉。
4. lastModified 字段未按预期更新/比较（字段名/类型/返回值差异），导致轮询误判“无需刷新”。
5. 同一家庭码在不同设备被不同的“成员 ID / PIN / 本地持久化数据”覆盖，且云端整字段覆盖式更新引发并发覆盖。

## 采证计划
- 增加可开关（?debug=1）的运行时诊断面板，采集：auth uid、membership 是否存在、云端拉取/写入结果、lastModified 比较、最后一次同步时间与错误。

## 进展记录
- 2026-05-23：用户已在 Supabase 执行 SQL，返回 Success. No rows returned。

