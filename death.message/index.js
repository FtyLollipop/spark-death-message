let config = new JsonConfigFile('plugins/sparkbridge/death.message/config.json', '{"groups": [], "edition": "java"}')
let entityData = (new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/resources/entity.json')).get(config.get('edition'))
let messageData = (new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/resources/message.json')).get(config.get('edition'))
let mapData = (new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/resources/map.json')).get("map")

function onStart(adapter){
    let groups = config.get('groups')
    logger.setConsole(config.get('islogprt'))
    logger.setFile(config.get('islogfile') ? 'logs/death.message.log' : null)
    mc.listen('onMobDie', (mob, source, cause) => {
        let msg = deathEventHandler(mob, source, cause, entityData, messageData, mapData)
        if(!msg) return
        logger.info(msg)
        groups.forEach(g => adapter.sendGroupMsg(g, msg))
    })
}

function info(){
    return {
        name : 'death.message',
        desc : '死亡消息转发到群聊',
        author : 'FtyLollipop',
        version : [0,0,4]
    }
}

function stringFormat(str, args) {
    let regex = /%s/
    let _r=(p,c) => p.replace(regex,c)
    return args.reduce(_r, str)
}

function deathEventHandler(mob, source, cause, entity, message, map) {
    let msg = null
    let args = []
    if(!mob.isPlayer()) { return null }
    msg = message?.[map.exception?.[source?.type]?.[cause]] ?? null
    if(!msg) {
        msg = message?.[map?.[cause]] ?? `${message['death.attack.generic']} %插件消息数据需要更新 source:${args[0]} cause:${cause}%`
    }
    args.push(mob.name)
    if(source) {
        args.push(entity?.[source?.type] ?? source?.name)
    }
    return stringFormat(msg, args)
}

module.exports = {onStart, info}