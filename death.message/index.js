const config = new JsonConfigFile('plugins/sparkbridge/death.message/config.json')
const entityData = (new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/resources/entity.json')).get(config.get('edition'))
const messageData = (new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/resources/message.json')).get(config.get('edition'))
const mapData = (new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/resources/map.json')).get("map")
const emoji = new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/resources/emoji.json')
const defaultEntityEmoji = emoji.get("defaultEntity")
const entityEmoji = emoji.get("entity")
const deathMessageEmoji = emoji.get("deathMessage")

const handlerConfigs = {
    enabledEntity: config.get('enabledEntity'),
    enableMobCustomName: config.get('enableMobCustomName'),
    enableItemCustomName: config.get('enableItemCustomName'),
    enableEmoji: config.get('enableEmoji'),
    emojiSeparator: config.get('emojiSeparator')
}

function onStart(adapter) {
    const groups = config.get('groups')
    logger.setConsole(config.get('isLogPrt'))
    logger.setFile(config.get('isLogFile') ? 'logs/death.message.log' : null)
    mc.listen('onMobHurt', (mob, source, damage, cause) => {
        hurtEventHandler(mob, source, cause, handlerConfigs)
    })
    mc.listen('onMobDie', (mob, source, cause) => {
        const msg = deathEventHandler(mob, source, cause, entityData, messageData, mapData, handlerConfigs)
        if (!msg) { return }
        logger.info(msg[2])
        groups.forEach(g => adapter.sendGroupMsg(g, msg.join('')))
    })
}

function info() {
    return {
        name: 'death.message',
        desc: '死亡消息转发到群聊',
        author: 'FtyLollipop',
        version: [0, 3, 0]
    }
}

// 若需移植请完整复制以下部分

let lastDamageCause = {}

function stringFormat(str, args) {
    const regex = /%s/
    const _r = (p, c) => p.replace(regex, c)
    return args.reduce(_r, str)
}

function isTamed(mob) {
    return mob.getNbt(mob.uniqueId)?.getTag('IsTamed').toString() === '1' ? true : false
}

function deathEventHandler(mob, source, cause, entity, message, map, config) {
    if (mc.runcmdEx('gamerule showdeathmessages').output.match(/true|false/).toString() === 'false') { return }
    const enabledEntity = config?.enabledEntity ?? {
        "minecraft:cat": true,
        "minecraft:donkey": true,
        "minecraft:horse": true,
        "minecraft:mule": true,
        "minecraft:player": true,
        "minecraft:wolf": true
    }
    const enableMobCustomName = config?.enableMobCustomName ?? true
    const enableEmoji = config?.enableEmoji ?? false
    const emojiSeparator = config?.emojiSeparator ?? '  '
    function getCustomName(mob) {
        return enableMobCustomName ? mob.getNbt().getTag('CustomName')?.toString() : null
    }

    let msg = null
    let args = []
    let emoji = ['', '', '']

    if (!enabledEntity[mob.type] || (!mob.isPlayer() && !isTamed(mob))) { return null }

    if (enableMobCustomName) {
        args.push(getCustomName(mob) ?? entity?.[mob.type] ?? mob.name)
    } else {
        args.push(entity?.[mob.type] ?? mob.type)
    }
    emoji[2] = entityEmoji[mob.type] ?? defaultEntityEmoji

    if (source) {
        if (enableMobCustomName) {
            args.push(getCustomName(source) ?? entity?.[source.type] ?? source.name)
        } else {
            args.push(entity?.[source.type] ?? getCustomName(source) ? source.type : source.name)
        }
        emoji[0] = entityEmoji[source.type] ?? defaultEntityEmoji
        emoji[1] = deathMessageEmoji.exception?.[source.type]?.[cause]
    }

    if (cause === 1 && lastDamageCause[mob.uniqueId]?.['position']) {
        let pos = lastDamageCause[mob.uniqueId]?.['position']
        delete lastDamageCause[mob.uniqueId]
        for (let x = -1; x <= 1; x++) {
            for (let y = -2; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const block = mc.getBlock(pos.x + x, pos.y + y, pos.z + z, pos.dimid)?.type
                    if (block === 'minecraft:cactus') {
                        msg = message[map[cause]]
                        emoji[1] = deathMessageEmoji[cause]
                        break
                    } else if (block === 'minecraft:sweet_berry_bush') {
                        msg = message.exception?.['minecraft:sweet_berry_bush']?.[cause] ?? message[map[cause]]
                        emoji[1] = deathMessageEmoji.exception?.['minecraft:sweet_berry_bush']?.[cause] ?? deathMessageEmoji[cause]
                        break
                    }
                }
            }
        }
    } else if (cause === 2 && lastDamageCause[mob.uniqueId]?.['itemName']) {
        msg = message['death.attack.player.item']
        args.push(lastDamageCause[mob.uniqueId]?.['itemName'])
        delete lastDamageCause[mob.uniqueId]
    } else {
        msg = message?.[map.exception?.[source?.type]?.[cause]] ?? null
    }

    if (!msg) {
        msg = message?.[map?.[cause]] ?? `${message['death.attack.generic']} %插件消息数据需要更新 source:${args[0]} cause:${cause}%`
    }
    if (!emoji[1]) {
        emoji[1] = deathMessageEmoji[cause] ?? deathMessageEmoji['0']
    }

    return [enableEmoji ? emoji.join('') : '', enableEmoji ? emojiSeparator : '', stringFormat(msg, args)]
}

function hurtEventHandler(mob, source, cause, config) {
    const enabledEntity = config?.enabledEntity ?? {
        "minecraft:cat": true,
        "minecraft:donkey": true,
        "minecraft:horse": true,
        "minecraft:mule": true,
        "minecraft:player": true,
        "minecraft:wolf": true
    }
    const enableItemCustomName = config?.enableItemCustomName ?? true

    if (!enabledEntity[mob.type] || (!mob.isPlayer() && !isTamed(mob))) { return }
    delete lastDamageCause[mob.uniqueId]
    if (source?.isPlayer() && cause === 2) {
        const item = mc.getPlayer(source.uniqueId).getHand()
        const itemNameNbt = item?.getNbt()?.getTag('tag')?.getTag('display')?.getTag('Name')
        if (itemNameNbt) {
            lastDamageCause[mob.uniqueId] = { 'itemName': enableItemCustomName ? itemNameNbt.toString() : mc.newItem(item.type, 1).name }
        }
    } else if (cause === 1) {
        let pos = mob.blockPos
        lastDamageCause[mob.uniqueId] = { 'position': { x: pos.x, y: pos.y, z: pos.z, dimid: pos.dimid } }
    }
}

// 若需移植请完整复制以上部分

module.exports = { onStart, info }