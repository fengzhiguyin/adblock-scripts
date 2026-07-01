# 🛡️ Adblock Factory (B Mode, Multi-Source, Safe)

这是一个基于 GitHub Actions 的高度自动化、强安全性的去广告规则与重写脚本"加工厂"。

本项目每天定时从多个主流开源项目拉取最新的去广告规则和 MITM 脚本，并执行**去重、合并、恶意代码静态清洗、API 屏蔽（Stubbing）**等一系列流程，最终输出安全、纯净、开箱即用的配置文件。

## ✨ 核心特性

1. **B Mode 安全清洗**：绝不盲目信任上游脚本。自动化工作流通过正则表达式扫描并阻断（Stub）脚本中所有高危的动态执行 API（如 `eval()`, `Function()`）和不必要的外部网络请求（如 `$httpClient`, `fetch`, `axios`），将所有外部 URL 劫持至 `https://blocked.invalid`，彻底切断后门风险。
2. **多源聚合与极致去重**：自动抓取 Anti-AD、Hagezi、Limbo 等顶级规则源，经过域名级别的高效全局去重，合并为包含百万级数据的"终极净化版"规则集。
3. **零人工维护**：依托 GitHub Actions，每天 `UTC 16:00` 自动构建、审计并发布。

## 📂 架构

```
GitHub Actions (daily UTC 16:00)
  ├── fetch_one() ──── 多镜像 curl 拉取 (5次重试)
  ├── normalize_rules() ── awk 多格式规则统一
  ├── sanitize_js() ─── perl 深度清洗 + URL 劫持 + 安全桩注入
  ├── build_script() ── 单文件构建入口
  ├── 域名级别去重 ── awk seen[$2] 按域名去重
  ├── 安全审计 ─── grep 高危模式 + node --check 语法验证
  ├── manifest 生成 ── Node.js SHA256 指纹
  └── git commit & push
```

## 📦 产出文件

### 🟢 代理软件可用 (Raw 链接)

**📁 `rules/` (网络请求分流/屏蔽规则)**

| 文件 | 说明 |
|------|------|
| `ads_merged.txt` | 🌟 **核心推荐**。所有源全局去重后的终极合并版 |
| `anti-ad.txt` | Anti-AD 标准版 |
| `hagezi.txt` | Hagezi Pro Plus 版 |
| `limbo.txt` | Adblock4limbo 规则 |
| `johnshall.txt` | Shadowrocket ADBlock Rules Forever |
| `adguard.txt` | AdGuard DNS 过滤版 |

**📁 `scripts/` (MITM 响应重写/去广告脚本)**

| 文件 | 说明 |
|------|------|
| `startup.js` | 各大 App 开屏广告快速跳过与去除 |
| `app_ads.js` | 各大 App 信息流广告、内部广告去除 |
| `youtube.js` | YouTube 视频流去广告 |
| `global_ads.js` | 全局通用广告拦截增强 |

### 🟡 系统审计类 (无需放入代理客户端)

| 文件 | 说明 |
|------|------|
| `build/manifest.json` | 构建数字指纹清单 (SHA256 + 大小 + 时间戳) |
| `reports/script_scan.txt` | 高危代码扫描报告 |
| `reports/rule_scan.txt` | 规则内容审计报告 |

## 🔗 主要链接 (直接复制到配置中使用)

### 🟢 规则集 (Rules)

| 名称 | 链接 |
|------|------|
| 🌟 终极合并去重版 (推荐) | [ads_merged.txt](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/ads_merged.txt) |
| Anti-AD 标准版 | [anti-ad.txt](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/anti-ad.txt) |
| Hagezi Pro Plus 版 | [hagezi.txt](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/hagezi.txt) |
| Adblock4limbo 规则 | [limbo.txt](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/limbo.txt) |
| Johnshall 规则 | [johnshall.txt](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/johnshall.txt) |
| AdGuard DNS 过滤版 | [adguard.txt](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/adguard.txt) |

### 🔵 净化脚本 (Scripts, B Mode 安全清洗)

| 名称 | 链接 |
|------|------|
| 开屏广告去除 (Startup) | [startup.js](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/startup.js) |
| App 内部广告净化 (App Ads) | [app_ads.js](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/app_ads.js) |
| YouTube 视频去广告 (YouTube) | [youtube.js](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/youtube.js) |
| 全局广告拦截增强 (Global Ads) | [global_ads.js](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/global_ads.js) |

### ⚪ 系统清单

| 名称 | 链接 |
|------|------|
| 构建清单 (Manifest) | [manifest.json](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/build/manifest.json) |

## 🚀 客户端配置示例

### Surge

```ini
[Rule]
# 引用合并版去广告规则
RULE-SET, https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/ads_merged.txt, REJECT

[Script]
# 引用经过清洗的安全脚本
去除APP启动广告 = type=http-response,pattern=^https?:\/\/.*\.com\/.*,requires-body=1,max-size=131072,script-path=https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/startup.js
```

## About

小火箭去广告
