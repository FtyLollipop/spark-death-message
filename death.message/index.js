const config = new JsonConfigFile('plugins/sparkbridge/death.message/config.json', '{"groups": [], "edition": "java"}')
const entityData = (new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/resources/entity.json')).get(config.get('edition'))
const messageData = (new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/resources/message.json')).get(config.get('edition'))
const mapData = (new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/resources/map.json')).get("map")

function onStart(adapter){
    const groups = config.get('groups')
    logger.setConsole(config.get('islogprt'))
    logger.setFile(config.get('islogfile') ? 'logs/death.message.log' : null)
    mc.listen('onMobHurt', hurtEventHandler)
    mc.listen('onMobDie', (mob, source, cause) => {
        const msg = deathEventHandler(mob, source, cause, entityData, messageData, mapData)
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
        version : [0,1,0]
    }
}

let lastDamageItemName = {}

function stringFormat(str, args) {
    const regex = /%s/
    const _r=(p,c) => p.replace(regex,c)
    return args.reduce(_r, str)
}

function deathEventHandler(mob, source, cause, entity, message, map) {
    let msg = null
    let args = []
    if(!mob.isPlayer()) { return null }
    const pos = mc.getPlayer(mob.name).lastDeathPos
    if(cause === 1) {
        for(let x = -1; x <= 1; x++) {
            for(let y = -2; y <= 1; y++) {
                for(let z = -1; z <= 1; z++) {
                    const block = mc.getBlock(pos.x + x, pos.y + y, pos.z + z, pos.dimid)?.type
                    if(block === 'minecraft:cactus') {
                        msg = message['death.attack.cactus']
                        break
                    } else if (block === 'minecraft:sweet_berry_bush') {
                        msg = message['death.attack.sweetBerry']
                        break
                    }
                }
            }
        }
    } else {
        msg = message?.[map.exception?.[source?.type]?.[cause]] ?? null
    }
    args.push(mob.name)
    if(source) {
        args.push(entity?.[source?.type] ?? source?.name)
    }
    if(lastDamageItemName[mob.name]){
        msg = message['death.attack.player.item']
        args.push(lastDamageItemName[mob.name])
    }
    if(!msg) {
        msg = message?.[map?.[cause]] ?? `${message['death.attack.generic']} %插件消息数据需要更新 source:${args[0]} cause:${cause}%`
    }
    return stringFormat(msg, args)
}

function hurtEventHandler(mob, source, damage, cause) {
    if(!mob.isPlayer()) { return }
    if(!source?.isPlayer() || cause !== 2) {
        delete lastDamageItemName[mob.name]
        return
    }
    const item = mc.getPlayer(source.name).getHand()
    const itemNameNbt = item?.getNbt()?.getTag('tag')?.getTag('display')?.getTag('Name')
    if(itemNameNbt) {
        lastDamageItemName[mob.name] = itemNameNbt.toString()
    } else {
        delete lastDamageItemName[mob.name]
    }
}

module.exports = {onStart, info}