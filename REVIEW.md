# 🛡️ Adblock Factory — 系统审查与优化方案

> 审查时间: 2026-06-04 | 审查范围: 全仓库 (61 commits)

---

## 一、系统现状总结

### 架构

```
GitHub Actions (daily UTC 16:00)
  ├── fetch_one() ─── 从上游拉取原始文件 (curl, 多镜像重试)
  ├── normalize_rules() ── awk 规则格式统一
  ├── extract_johnshall_rejects() ── 从 Shadowrocket 配置提取 reject 规则
  ├── sanitize_js() ── perl 正则清洗 + URL 劫持
  ├── prepend_stubs() ── 注入安全桩函数
  ├── build_script() ── 单文件构建入口
  ├── 规则合并去重 ── cat + awk seen[] 去重
  ├── 安全审计 ── grep 高危模式 + node --check 语法验证
  ├── manifest 生成 ── Node.js SHA256 指纹
  └── git commit & push
```

### 数据产出

| 文件 | 行数 | 大小 | 状态 |
|------|------|------|------|
| ads_merged.txt | 621,707 | 25 MB | ✅ 正常 |
| hagezi.txt | 573,311 | 23 MB | ✅ 正常 |
| anti-ad.txt | 107,377 | 3.4 MB | ✅ 正常 |
| limbo.txt | 521 | 18 KB | ⚠️ 偏少 |
| adguard.txt | 0 | 0 B | ❌ 空文件 |
| johnshall.txt | 0 | 0 B | ❌ 空文件 |
| startup.js | 235 | 13 KB | ✅ 正常 |
| app_ads.js | 2 | 38 B | ❌ fallback 空壳 |
| global_ads.js | 2 | 38 B | ❌ fallback 空壳 |
| youtube.js | 2 | 38 B | ❌ fallback 空壳 |

---

## 二、关键问题清单

### 🔴 P0 — 构建失败 / 产出异常

#### 1. 3个脚本全部 fallback 空壳
- `app_ads.js`, `global_ads.js`, `youtube.js` 只有 `/* fallback safe script */ $done({});`
- 原因: `blackmatrix7/ios_rule_script` 和 `Maasea/sgmodule` 的 raw 内容 URL 变更或网络不可达
- 影响: 用户拿到的是无效脚本，等于没有去广告

#### 2. adguard.txt 和 johnshall.txt 为空文件
- adguard: `AdguardTeam/AdGuardSDNSFilter` 的 filter.txt URL 可能返回了 HTML (被重定向)
- johnshall: `Johnshall/Shadowrocket-ADBlock-Rules-Forever` 的 release 路径可能变更
- 两个规则集在 manifest 中 bytes=0

#### 3. 规则格式不一致
- ads_merged.txt 中混有带 `,reject` 和不带 action 后缀的规则
- Hagezi 源转换后保留了裸域名 (无 action)，而 anti-ad 全部带 `,reject`
- 下游客户端对格式要求不一致: Surge 需要显式 action，Quantumult X 可选

### 🟡 P1 — 架构/安全问题

#### 4. sanitize_js() 正则存在绕过风险
- 只匹配 `$httpClient.(get|post|...)` 但 `$httpClient["get"]` 或 `$httpClient .get` 不被拦截
- `eval` 只匹配 `eval(` 但 `eval .call(` 或 `["eval"]("` 可绕过
- `Function(` 不匹配 `Function .constructor(`
- 建议: 增加更宽松的模式匹配，或使用 AST 分析

#### 5. 规则去重不彻底
- `awk 'NF && !seen[$0]++'` 是精确行匹配
- `DOMAIN-SUFFIX,example.com,reject` 和 `DOMAIN-SUFFIX,example.com` 被视为不同行
- 同一域名不同 action 后缀导致重复屏蔽

#### 6. 无增量构建 / 无缓存
- 每次全量拉取 + 全量处理，GitHub Actions 15 分钟超时
- 如果某个源拉取慢，整个构建超时失败
- 没有利用 GitHub Cache 或 artifact 缓存中间产物

#### 7. sources/ 目录是死代码
- `sources/global_ads.js` 和 `sources/youtube.js` 是手动维护的静态副本
- 工作流中直接从上游拉取，sources 目录从未被引用
- 增加维护负担，容易与实际产出不一致

### 🟢 P2 — 优化改进

#### 8. README 重复内容
- Raw 链接在 README 中出现两次 (第1-15行 和 第96-123行)
- 应合并为单一来源

#### 9. 缺少版本/changelog
- 只有 manifest.json 有 build timestamp
- 用户无法知道今天和昨天的规则差了多少条
- 建议: 每次构建输出 diff stats

#### 10. 缺少健康检查/监控
- 构建失败只以 exit code 退出，无通知机制
- 如果连续几天 fallback，用户不会知道
- 建议: 构建后发 Telegram/Discord 通知

#### 11. 规则源单一镜像
- 每个源只有一个 URL，没有 fallback
- GitHub raw 有时被墙/限流
- 建议: 增加镜像 URL 或 CDN 备选

#### 12. 缺少域名有效性验证
- 纯静态处理，不验证域名是否仍然活跃
- 百万级规则中可能有大量已失效域名
- 建议: 定期用 DNS 采样验证

---

## 三、优化方案

### Phase 1: 修复构建 (P0)

#### 1.1 修复脚本源 URL
```
当前: blackmatrix7/ios_rule_script/master/script/advertising/advertising.js
问题: 仓库可能更名/删除/分支变更

方案:
- 增加 fallback URL 列表
- 添加 URL 有效性预检 (HTTP HEAD 检查 content-type)
- 如果全部不可达，从 sources/ 目录读取本地备份而非 fallback 空壳
```

#### 1.2 修复规则源 URL
```
adguard: 检查实际 URL 是否返回 200 + text/plain
johnshall: 确认 release 路径是否变更
方案: fetch_one() 已有重试，但需增加 content-type 验证
```

#### 1.3 统一规则格式
```
所有规则输出统一为: DOMAIN-SUFFIX,domain.com,reject
对不带 action 的规则行，自动追加 ,reject
```

### Phase 2: 安全加固 (P1)

#### 2.1 增强 sanitize_js()
```
增加模式:
- \$httpClient\s*\["  (属性访问)
- \beval\s*\.  (eval.call)
- \bFunction\s*\.  (Function.constructor)
- \bimport\s*\(  (动态 import)
- \brequire\s*\(  (Node require)
- \bprocess\.  (Node process 对象)
- \b__proto__  (原型链污染)
- \bwindow\s*\[  (window 属性访问)
```

#### 2.2 域名级别去重
```
不仅按行去重，还要按域名去重:
awk -F, '{if(!seen[$2]++) print}' 
保留最长匹配 (DOMAIN > DOMAIN-SUFFIX > DOMAIN-KEYWORD)
```

### Phase 3: 架构优化 (P2)

#### 3.1 清理死代码
- 删除 `sources/` 目录 (工作流不使用)
- 或改为 fallback 本地备份

#### 3.2 README 去重
- 合并重复的 Raw 链接部分

#### 3.3 增加构建统计
```
每次构建输出:
- 各规则源条目数
- 去重后总数
- 新增/删除数 (与上次 manifest 对比)
- 构建耗时
```

#### 3.4 增加通知机制
- 构建失败时发 Telegram 通知
- 连续 2 天 fallback 时告警

---

## 四、文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `.github/workflows/main.yml` | 修改 | 修复 URL、增强清洗、统一格式、构建统计 |
| `README.md` | 修改 | 去重、清理格式 |
| `sources/` | 删除或改为 fallback | 消除死代码 |
| `REVIEW.md` | 新增 | 本文档 |
