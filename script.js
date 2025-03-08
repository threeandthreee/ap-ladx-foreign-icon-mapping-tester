document.addEventListener("DOMContentLoaded", function(event) {
    let mapping = TRUE_MAPPING
    let cache = {}
    let elementIds = [
    "game",
    "item",
    "singleMatch",
    "datapackage",
    "datapackageMatch",
    "currentMapping",
    "errorText"
    ]
    let elements = {}
    for(const id of elementIds)
    elements[id] = document.getElementById(id)

    updateCache = function() {
    let newCache = {}
    for(const item of mapping.ITEMS){
        newCache[item] = item
        for(const word of item.split('_'))
        if(!mapping.BLOCKED_ASSOCIATIONS.includes(word) && isNaN(word))
            newCache[word] = item
    }
    newCache = {...newCache, ...mapping.SYNONYMS}
    pluralizations = {}
    for(const key in newCache)
        pluralizations[key+"S"] = newCache[key]
    newCache = {...pluralizations, ...newCache}
    cache = newCache
    }

    match = function(item, game){
    uppered = item.toUpperCase()
    phrases = {
        ...mapping.PHRASES,
        ...(mapping.GAME_SPECIFIC_PHRASES[game] || {})
    }
    for(const phrase in phrases)
        if(uppered.includes(phrase.toUpperCase()))
        return phrases[phrase]
    pattern = /(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|(?<=[a-zA-Z])(?=\d)/
    possibles = item.replace(pattern, " ").toUpperCase()
    for(const ch of "[]()_")
        possibles = possibles.replace(ch, " ")
    possibles = possibles.split(" ")
    for(const name of possibles)
        if(name in cache)
        return cache[name]
    return "TRADING_ITEM_LETTER"
    }

    checkSingle = function(){
    try{
        elements.singleMatch.value = match(elements.item.value, elements.game.value)
        elements.errorText.innerText = ""
    } catch {
        elements.errorText.innerText = "Something went wrong"
    }
    }

    checkDatapackage = function(){
    try{
        let datapackage = elements.datapackage.value.trim()
        if(datapackage[datapackage.length-1] == ',')
        datapackage = datapackage.slice(0,-1)
        datapackage = JSON.parse('{' + datapackage + '}')
        let game = Object.keys(datapackage)[0]
        let output = ""
        let longest = 0
        for(const name in datapackage[game].item_name_to_id)
        if(name.length > longest)
            longest = name.length
        for(const name in datapackage[game].item_name_to_id)
        output += (name + ':').padEnd(longest+1) + ' ' + match(name, game) + '\n'
        elements.datapackageMatch.value = output
        elements.errorText.innerText = ""
    } catch {
        elements.errorText.innerText = "Something went wrong"
    }
    }

    update = function(){
    try{
        mapping = JSON.parse(elements.currentMapping.value)
    } catch {
        elements.errorText.innerText = "Your mapping is bad JSON"
        return
    }
    try{
        updateCache()
    } catch {
        elements.errorText.innerText = "Your mapping is broken"
        return
    }
    elements.errorText.innerText = ""
    }

    reset = function(){
    mapping = TRUE_MAPPING
    updateCache()
    elements.currentMapping.value = JSON.stringify(mapping, null, 2)
    elements.errorText.innerText = ""
    }

    elements.game.addEventListener('keypress', function(event) {
    if(event.key === 'Enter') {
        event.preventDefault()
        checkSingle()
    }
    })
    elements.item.addEventListener('keypress', function(event) {
    if(event.key === 'Enter') {
        event.preventDefault()
        checkSingle()
    }
    })


    reset()
})