# death.message 死亡消息转发到Q群

适用于SparkBridge的死亡消息转发插件，支持多种可自定义的配置项，您可以：

- 在群内看到基岩版内原汁原味的死亡消息，包括已驯服生物
- 可选使用基岩版或Java版翻译
- 配置哪些实体不转发死亡消息
- 屏蔽自定义实体或物品的名称，防止敏感词汇被意外转发到群内
- 可选启用emoji，使消息更生动，可自行更改文件以自定义emoji列表
- 将游戏规则`showdeathmessages`设为`false`时，死亡消息转发将像游戏内一样暂时停止

最新支持的Minecraft Bedrock版本：1.19.x

理论最高支持的Minecraft Bedrock版本：1.20.x

## 安装

1. 安装LiteLoaderBDS并安装SparkBridge

2. [下载death.message.zip](https://github.com/FtyLollipop/spark-death-message/releases)

3. 解压`death.message`文件夹到`BDS根目录\plugins\nodejs\sparkbridge\plugins`目录中，注意不要嵌套，安装后的目录结构应该如下：

   ```
   plugins\nodejs\sparkbridge\plugins\death.message
   ├── index.js                 // 插件主程序
   ├── config.json              // 配置文件
   └── resources
       ├── emoji.json           // emoji数据
       ├── entity.json          // 实体数据
       ├── message.json         // 死亡消息数据
       └── map.json             // 死亡消息映射数据
   ```
   

## 配置

配置文件为`config.json`，如果需要原汁原味的基岩版死亡消息，则除群号外无需改动任何配置项。

- `groups`：要转发的群号，多个群号用英文逗号隔开，例如`"groups": [12345678,12345679]`。
- `edition`：死亡消息内容**翻译**遵循的版本，`"bedrock"`为基岩版翻译，`"java"`为Java版翻译。Java版翻译建议配合镐老板的[基岩版译名修正包](https://github.com/ff98sha/mclangcn)食用。
- `enabledEntity`：启用死亡消息的实体列表，在对应生物的命名空间ID后设定是否启用。`true`为是，`false`为否。
- `enableMobCustomName`：是否启用自定义生物名称。`true`为是，`false`为否。启用时，如果被驯服的生物死亡，拥有使用命名牌自定义的名称则优先使用名称，否则不使用。
- `enableItemCustomName`：是否启用自定义物品名称。`true`为是，`false`为否。启用时，如果玩家使用了用铁砧重命名后的物品击杀了生物或其他玩家，则优先使用重命名后的名称，否则不使用。
- `enableEmoji`：是否启用emoji，`true`为是，`false`为否。启用时，每一条死亡信息开头都会带上与死亡消息内容有关联的2-3个emoji表情（emoji部分不会输出到控制台和日志文件）。
- `emojiSeparator`：emoji和死亡消息之间的分隔符。
- `isLogPrt`: 死亡消息是否输出到控制台。`true`为是，`false`为否。
- `isLogFile`: 死亡消息是否输出到日志文件。`true`为是，`false`为否。日志文件路径：`BDS根目录\logs\death.message.log`。

## 已知问题

由于LiteLoaderBDS提供的API无法监听实体以外的伤害来源，所以无法很好地区分死于仙人掌的伤害或死于甜浆果丛的伤害。当玩家或生物死于仙人掌伤害或甜浆果丛伤害时，如果死亡点周围一格内同时存在仙人掌和甜浆果丛，死亡消息可能不准确。

有特殊死亡情况可能未手动覆盖到，请在GitHub提交issue。

## 移植指南

⚠️警告：本插件目前尚于测试阶段，可能会频繁更新甚至更改文件夹、配置文件结构，如需稳定版本敬请等待v1.0.0版本。

本插件可以方便地移植到其他群服互通机器人（Javascript，其他语言需要自行修改函数），您只需要：

1. 下载最新的源代码。

2. 导入数据配置文件，注意文件路径。

   示例伪代码：

   ```javascript
   const entityData = 读取文件('entity.json')['bedrock']
   const messageData = 读取文件('message.json')['bedrock']
   const mapData = 读取文件('map.json')['map']
   const defaultEntityEmoji = 读取文件('emoji.json')['defaultEntity']
   const entityEmoji = 读取文件('emoji.json')['entity']
   const deathMessageEmoji = 读取文件('emoji.json')['deathMessage']
   ```

   本插件使用LiteLoaderBDS提供的配置文件API`JsonConfigFile`，您也可以直接复制修改路径后使用。

3. 完整复制`let lastDamageItemName = {}`、`stringFormat`函数、`isTamed`函数、`deathEventHandler`函数和`hurtEventHandler`函数。

4. 在您自己的插件中使用LiteLoaderBDS提供的事件监听API`mc.listen`监听`onMobDie`事件，并在回调函数中调用`hurtEventHandler`函数，用法为：`hurtEventHandler(mob, source, cause, config)`

   - 参数:

     - mob : `Entity`

       `mc.listen`回调函数接收的mob参数

     - source : `Entity`

       `mc.listen`回调函数接收的source参数

     - cause : `Integer`

       `mc.listen`回调函数接收的cause参数

     - config: `Object`

       配置项，可选。用于配置工作方式，默认为：

       ```javascript
       {
           enabledEntity: {  // 启用死亡消息的实体列表，应来自配置文件
           	"minecraft:cat": true,
               "minecraft:donkey": true,
               "minecraft:horse": true,
               "minecraft:mule": true,
               "minecraft:player": true,
               "minecraft:wolf": true
           },
           enableItemCustomName: true,  // 是否启用自定义物品名称，应来自配置文件
       }
       ```

5. 另外监听`onMobDie`事件，并在回调函数中调用`deathEventHandler`函数，用法为：

   `deathEventHandler(mob, source, cause, entity, message, map, config)`

   - 参数:
     - mob : `Entity`
     
       `mc.listen`回调函数接收的mob参数
     
     - source : `Entity`
     
       `mc.listen`回调函数接收的source参数
     
     - cause : `Integer`
     
       `mc.listen`回调函数接收的cause参数
     
     - entity : `Object`
     
       实体翻译数据，应来自文件
     
     - message : `Object`
     
       死亡消息翻译数据，应来自文件
     
     - map : `Object`
     
       死亡消息数据映射数据，应来自文件
     
     - config : `Object`
     
       配置项，可选。用于配置工作方式，默认为：
     
       ```javascript
       {
           enabledEntity: {  // 启用死亡消息的实体列表，应来自配置文件
           	"minecraft:cat": true,
               "minecraft:donkey": true,
               "minecraft:horse": true,
               "minecraft:mule": true,
               "minecraft:player": true,
               "minecraft:wolf": true
           },
           enableMobCustomName: true,  // 是否启用自定义生物名称，应来自配置文件
           enableEmoji: false,  // 是否启用emoji，应来自配置文件
           emojiSeparator: '  '  // emoji和死亡消息之间的分隔符，应来自配置文件
       }
       ```
     
       
   - 返回值: 死亡消息文本数组，结构为`['emoji', '分隔符', '死亡消息']`，若未启用emoji则前两项均为`''`，若死亡的实体不在启用的实体列表里则为`null`
   - 返回值类型: `Array`

6. 若`deathEventHandler`函数的返回值不为`null`，则将返回值使用机器人发送。

   使用示例伪代码：

   ```javascript
   function 插件主函数() {
       mc.listen('onMobHurt', (mob, source, cause) => {
           hurtEventHandler(mob, source, cause, config)
       })
       mc.listen('onMobDie', (mob, source, cause) => {
           let msg = deathEventHandler(mob, source, cause, entity, message, map, config)
           if(msg) 机器人发送消息(msg.join(''))
       })
   }
   ```

## 协议

本插件按照[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hans)协议发布。
