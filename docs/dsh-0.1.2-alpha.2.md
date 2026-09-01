# DSH 双版本兼容候选（未发布）

同一个 `0.2.0-rc.1` 候选包的兼容目标：

| DSH | 官方提交 |
| --- | --- |
| `0.1.1-rc.2` | `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` |
| `0.1.2-alpha.2` | `0a53fb55bea101816fa226bb964ae2bed71c343b` |

不按 DSH 版本分别发包；不要求旧用户先升级管理器。没有自定义精确版本白名单。
DSH 可选 peer 使用版本范围表达声明，不把它当成旧宿主必然执行的安装拦截。
当前没有发布、创建远端标签或改变 npm `latest` / `next`。预发布沿用普通 `next` 通道。

## 本插件变更

导入历史的工具调用 ID 兼容两种 Host 导出；前端事件服务及会话预设读取兼容两种接口；模型切换保持取消和过期结果隔离。真实 Claude 图片识别与 fork 上下文继承按用户要求暂缓，没有标为通过。

## 验收方式与边界

开发类型检查及构建使用准备好的官方 `0.1.2-alpha.2` 源码。构建一次后，将相同 tarball
分别安装到两版官方 DSH 的独立临时 profile，检查 Host 启动、浏览器装配、功能注册及
适用的受控功能；不修改官方源码或日常运行环境。
跨插件结果在 Relay 的 `dsh-lab/dual-compatibility-20260831/` 中记录；插件独立测试命令：

```sh
npm ci --ignore-scripts
# 非管理器插件需要准备好的官方 DSH 源码；管理器使用锁定的 npm 开发依赖。
export DSH_ROOT=/path/to/prepared/official/deepseek-harness
npm run verify
```

两版核心回归不等于所有外部服务、平台或未来 DSH 版本均已验证。
Claude 真实识图/fork 仍暂缓；Codex Default 模式原生提问限制、Workbench 刷新后尺寸不保留
均不在本次兼容修复中关闭。所有公开 npm/GitHub 发布后的完整升级路径也需要发布后再验收。
