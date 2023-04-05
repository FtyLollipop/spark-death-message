let entityData = (new JsonConfigFile('plugins/sparkbridge/death.message/config/entity.json')).get("entity")
let messageData = (new JsonConfigFile('plugins/sparkbridge/death.message/config/message.json')).get("message")
let mapData = (new JsonConfigFile('plugins/sparkbridge/death.message/config/map.json')).get("map")
let config = new JsonConfigFile('plugins/sparkbridge/death.message/config/config.json')

function onStart(adapter){
    mc.listen('onMobDie', (mob, source, cause) => {
        let msg = deathEventHandler(mob, source, cause, entityData, messageData, mapData)
        if(!msg) return
        config.get("groups").forEach(g => adapter.sendGroupMsg(g, msg))
    })
}

function info(){
    return {
        name : 'death.message',
        desc : '死亡信息转发到群聊',
        author : 'FtyLollipop',
        version : [0,0,1]
    }
}

function stringFormat(str, args) {
    let regex = /%s/
    let _r=(p,c) => p.replace(regex,c)
    return args.reduce(_r, str)
}

function deathEventHandler(mob, source, cause, entity, message, map) {
    let args = []
    let msg = ''
    if(!mob.isPlayer())
        return false
    args.push(mob.name)
    if(source?.isPlayer()) {
        args.push(source.realName)
    } else if(source?.type) {
        args.push(entity[source.type] || source.name)
    }
    msg = message[map[cause]] || `%s死了 %插件消息数据需要更新 source:${args[0]} cause:${cause}%`
    return stringFormat(msg, args)
}

module.exports = {onStart, info}