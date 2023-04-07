# death.message 死亡消息转发到Q群

适用于SparkBridge的死亡消息转发插件

最新支持的Minecraft Bedrock版本：1.19.72.01

## 安装

1. 安装LiteLoaderBDS并安装SparkBridge

2. [下载death.message.zip](https://github.com/FtyLollipop/spark-death-message/releases)

3. 解压`death.message`文件夹到`BDS根目录\plugins\nodejs\sparkbridge\plugins`目录中，注意不要嵌套，安装后的目录结构应该如下：

   ```
   plugins\nodejs\sparkbridge\plugins\death.message
   ├── index.js                 // 插件主程序
   ├── config.json              // 插件主程序
   └── resources
       ├── entity.json          // 实体数据
       ├── message.json         // 死亡消息数据
       └── map.json             // 死亡消息映射数据
   ```
   
   

## 配置

配置文件为`config.json`

- `groups`：要转发的群号，多个群号用英文逗号隔开，例如`"groups": [12345678,12345679]`。
- `edition`：死亡消息内容**翻译**遵循的版本，`"java"`为Java版翻译，`"bedrock"`为基岩版翻译。
- `islogprt`: 死亡消息是否输出到控制台。`true`为是，`false`为否。
- `islogfile`: 死亡消息是否输出到日志文件。`true`为是，`false`为否。日志文件路径：`BDS根目录\logs\death.message.log`。

## 已知问题

由于LiteLoaderBDS提供的API无法监听实体以外的伤害来源，所以无法区分死于仙人掌的伤害或死于甜浆果丛的伤害，故两者死亡信息统一使用死于仙人掌伤害的`[玩家名]被戳死了`，如有需要，也可以更改`death.message\resources\message.json`来自定义这条信息的显示内容。

有特殊死亡情况可能未手动覆盖到，请在GitHub提交issue。

## 移植指南

⚠️警告：本插件目前尚于测试阶段，可能会频繁更新甚至更改文件夹、配置文件结构，如需稳定版本敬请等待v1.0.0版本。

本插件可以方便地移植到其他群服互通机器人（Javascript，其他语言需要自行修改函数），您只需要：

1. 下载最新的源代码。

2. 导入数据配置文件，注意文件路径。

   示例伪代码：

   ```javascript
   let entityData = 读取文件('entity.json')['java']
   let messageData = 读取文件('message.json')['java']
   let mapData = 读取文件('map.json')['map']
   ```

   本插件使用LiteLoaderBDS提供的配置文件API`JsonConfigFile`，您也可以直接复制修改路径后使用。

3. 复制`stringFormat`函数和`deathEventHandler`函数。

4. 在您自己的插件中使用LiteLoaderBDS提供的事件监听API`mc.listen`监听`onMobDie`事件，并在回调函数中调用`deathEventHandler`函数，用法为：

   `deathEventHandler(mob, source, cause, entity, message, map)`

   - 参数:
     - mob : `mc.listen`回调函数接收的mob参数
     - source : `mc.listen`回调函数接收的source参数
     - cause : `mc.listen`回调函数接收的cause参数
     - entity : 实体翻译数据json，应来自文件
     - message : 死亡消息翻译数据json，应来自文件
     - map : 死亡消息数据映射json，应来自文件
   - 返回值: 死亡消息文本，若死亡的实体不是玩家则为`null`
   - 返回值类型: `String`

5. 若`deathEventHandler`函数的返回值不为`null`，则将返回值使用机器人发送。

   使用示例伪代码：

   ```javascript
   function 机器人主函数() {
       mc.listen('onMobDie', (mob, source, cause) => {
           let msg = deathEventHandler(mob, source, cause, entityData, messageData, mapData)
           if(msg) 机器人发送消息(msg)
       })
   }
   ```

## 协议

本插件按照[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hans)协议发布。
