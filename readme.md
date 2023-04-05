# death.message 死亡消息转发

适用于SparkBridge的死亡消息转发插件

最新支持的Minecraft Bedrock版本：1.19.72.01

## 安装

1. 安装LiteLoaderBDS并安装SparkBridge
2. [下载death.message.zip](https://github.com/FtyLollipop/spark-death-message/releases)
3. 解压`death.message`文件夹到`plugins\nodejs\sparkbridge\plugins`目录中。

## 配置

配置文件为`death.message\config\config.json`

- `groups`：要转发的群组，多个群组用英文逗号隔开，例如`groups: [12345678,12345679]`。

- `edition`：死亡消息内容翻译遵循的版本，`"Java"`为Java版翻译，`"Bedrock"`为基岩版翻译。

## 已知问题

由于LiteLoaderBDS提供的API无法监听实体以外的伤害来源，所以无法区分死于仙人掌的伤害或死于甜浆果丛的伤害，故两者死亡信息统一使用死于仙人掌伤害的`[玩家名]被戳死了`，如有需要，也可以更改`death.message\config\messageJava.json`或`death.message\config\messageBedrock.json`来自定义这条信息的显示内容。

有特殊死亡情况可能未手动覆盖到，请在GitHub提交issue。

## 协议

本插件按照[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hans)协议发布。