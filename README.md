主要链接直接复制到配置中使用：
### 🟢 规则集链接 (Rules)
这些链接用于屏蔽域名和 IP，推荐优先使用“终极合并版”。
 * **🌟 终极合并去重版（推荐）：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/ads_merged.txt
 * **Anti-AD 标准版：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/anti-ad.txt
 * **Hagezi Pro Plus 版：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/hagezi.txt
 * **Adblock4limbo 规则：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/limbo.txt
 * **Johnshall 规则：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/johnshall.txt
 * **AdGuard DNS 过滤版：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/adguard.txt
### 🔵 净化脚本链接 (Scripts)
这些是已经过 **B Mode 安全清洗**，阻断了所有外部请求和动态执行的安全脚本。
 * **开屏广告去除（Startup）：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/startup.js
 * **App 内部广告净化（App Ads）：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/app_ads.js
 * **YouTube 视频去广告（YouTube）：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/youtube.js
 * **全局广告拦截增强（Global Ads）：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/global_ads.js
### ⚪ 系统清单文件
用于校验版本和文件指纹。
 * **构建清单 (Manifest)：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/build/manifest.json


# adblock-scripts
# 🛡️ Adblock Factory (B Mode, Multi-Source, Safe)

这是一个基于 GitHub Actions 的高度自动化、强安全性的去广告规则与重写脚本“加工厂”。

本项目每天定时从多个主流开源项目拉取最新的去广告规则和 MITM 脚本，并执行**去重、合并、恶意代码静态清洗、API 屏蔽（Stubbing）**等一系列流程，最终输出安全、纯净、开箱即用的配置文件。

---

## ✨ 核心特性

1. **B Mode 安全清洗**：绝不盲目信任上游脚本。自动化工作流会通过正则表达式扫描并阻断（Stub）脚本中所有高危的动态执行 API（如 `eval()`, `Function()`）和不必要的外部网络请求（如 `$httpClient`, `fetch`, `axios`），将所有外部 URL 劫持至 `https://blocked.invalid`，彻底切断后门风险。
2. **多源聚合与极致去重**：自动抓取 Anti-AD、Hagezi、Limbo 等顶级规则源，经过 O(N) 级别的高效全局去重，合并为包含百万级数据的“终极净化版”规则集。
3. **零人工维护**：依托 GitHub Actions，每天 `UTC 16:00` 自动构建、审计并发布。

---

## 📂 架构与文件说明

本项目生成的文件分为两类：**🟢 可直接放入代理软件的实用类**，以及 **🟡 用于安全扫描的系统审计类**。

### 🟢 代理软件可用文件 (Raw 链接)

这些文件是你配置 Surge、Quantumult X、Loon、Clash 等客户端时可以直接引用的内容：

* **📁 `rules/` (网络请求分流/屏蔽规则)**
    * **`ads_merged.txt`**：**🌟 核心推荐**。包含本仓库所有可用源经过全局去重后的终极合并版规则。
    * `anti-ad.txt`：转换并标准化的 Anti-AD 规则。
    * `hagezi.txt`：转换并标准化的 Hagezi Pro Plus 规则。
    * `limbo.txt`, `johnshall.txt`, `adguard.txt`：其他辅助过滤规则。

* **📁 `scripts/` (MITM 响应重写/去广告脚本)**
    * *注意：以下脚本均已通过 B Mode 安全过滤，移除了所有外部联网和动态执行能力。*
    * `app_ads.js`：各大常用 App 的信息流广告、内部广告去除。
    * `startup.js`：各大 App 的开屏广告快速跳过与去除。
    * `youtube.js`：YouTube 视频流去广告。
    * `global_ads.js`：全局通用广告拦截增强。

### 🟡 系统审计类文件 (无需关注)

这些文件由系统生成，用于记录版本和安全日志，**不需要放入任何代理客户端中**。

* **📁 `build/`**
    * `manifest.json`：每次构建的数字指纹清单。记录了所有产出文件的 SHA256 哈希值、文件大小和生成时间戳，用于版本对比。
* **📁 `reports/` (存在于 Actions Artifacts 中)**
    * `rule_scan.txt` & `script_scan.txt`：高危代码扫描报告。如果某天上游仓库混入了恶意代码，工作流会自动失败，并在此报告中指出具体风险代码位置。

---

## 🚀 客户端配置示例 (如何使用)

获取文件的直链（Raw URL）：点击本仓库中的文件（例如 `rules/ads_merged.txt`），点击右上角的 `Raw` 按钮，复制浏览器地址栏的链接。

### Surge 配置示例
```ini
[Rule]
# 引用合并版去广告规则
RULE-SET, [https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/ads_merged.txt](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/ads_merged.txt), REJECT

[Script]
# 引用经过清洗的安全脚本
去除APP启动广告 = type=http-response,pattern=^https?:\/\/.*\.com\/.*,requires-body=1,max-size=131072,script-path=[https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/startup.js](https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/startup.js)

直接复制到配置中使用：
### 🟢 规则集链接 (Rules)
这些链接用于屏蔽域名和 IP，推荐优先使用“终极合并版”。
 * **🌟 终极合并去重版（推荐）：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/ads_merged.txt
 * **Anti-AD 标准版：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/anti-ad.txt
 * **Hagezi Pro Plus 版：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/hagezi.txt
 * **Adblock4limbo 规则：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/limbo.txt
 * **Johnshall 规则：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/johnshall.txt
 * **AdGuard DNS 过滤版：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/rules/adguard.txt
### 🔵 净化脚本链接 (Scripts)
这些是已经过 **B Mode 安全清洗**，阻断了所有外部请求和动态执行的安全脚本。
 * **开屏广告去除（Startup）：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/startup.js
 * **App 内部广告净化（App Ads）：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/app_ads.js
 * **YouTube 视频去广告（YouTube）：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/youtube.js
 * **全局广告拦截增强（Global Ads）：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/scripts/global_ads.js
### ⚪ 系统清单文件
用于校验版本和文件指纹。
 * **构建清单 (Manifest)：**
   https://raw.githubusercontent.com/fengzhiguyin/adblock-scripts/main/build/manifest.json

