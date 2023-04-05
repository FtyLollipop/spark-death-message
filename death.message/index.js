let config = new JsonConfigFile('plugins/sparkbridge/death.message/config/config.json')
let entityData = (new JsonConfigFile(`plugins/sparkbridge/death.message/config/entity${config.get('edition')}.json`)).get("entity")
let messageData = (new JsonConfigFile(`plugins/sparkbridge/death.message/config/message${config.get('edition')}.json`)).get("message")
let mapData = (new JsonConfigFile('plugins/sparkbridge/death.message/config/map.json')).get("map")

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
    if(!mob.isPlayer()) { return false }
    msg = message[map.exception?.[source?.type]?.[cause]]
    if(!msg) {
        msg = message[map[cause]] || `%s死了 %插件消息数据需要更新 source:${args[0]} cause:${cause}%`
    }
    args.push(mob.name)
    console.log(source)
    if(source) {
        args.push(entity[source?.type] || source.name)
    }
    return stringFormat(msg, args)
}

module.exports = {onStart, info}