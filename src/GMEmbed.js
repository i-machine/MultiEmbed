function GMEmbedManager() {
    this.itemTypes = []
    this.items = []
    this.panels = []
    this.columns = 0
    this.rows = 0
    this.autoColumns = true
    this.autoRows = true
    this.interfaceManager = new GMEmbedInterfaceManager(this)
    this.nextIndex = 0
    this.options = {
        muteNewItems: true,
        defaultItemVolume: 100,
    }
}

function GMEmbedPanel(manager) {
    this.embedManager = manager
    this.index = 0
    this.item = null
}

function GMEmbedItem(manager) {
    this.embedManager = manager
    this.index = 0
    this.panel = null
    this.inputUrl = ''
    this.embedUrl = ''
    this.parsedInputUrl = undefined
    this.parsedEmbedUrl = undefined
    this.playerMode = undefined
    this.host = ''
    this.id = ''
    this.title = ''
    this.player = undefined
}

function GMEmbedItemType(manager) {
    this.embedManager = manager
    this.index = 0
    this.name = undefined
    this.getPlayerModeAndIdForUrl = undefined
    this.setItemPlayerMode = undefined
    this.createItemPlayer = undefined
    this.getItemPlayerMute = undefined
    this.setItemPlayerMute = undefined
    this.setItemPlayerVisible = undefined
    this.getItemPlayerVolume = undefined
    this.setItemPlayerVolume = undefined
}

GMEmbedManager.prototype.initialise = function (rows) {
    this.initialiseYoutubeIframeAPI()
    this.initialiseEmbedItemTypes()
}

GMEmbedManager.prototype.initialiseEmbedItemTypes = function (rows) {
    var embedManager = this

    this.addEmbedItemType('youtube video', {
        getPlayerModeAndIdForUrl: function (url, parsedUrl) {
            parsedUrl = parsedUrl || parseUrl(url)
            if (!parsedUrl) return null

            if (!parsedUrl.host.toLowerCase() === 'www.youtube.com') return null
            if (!parsedUrl.pathnameAsArray.length) return null

            var result = {
                playerMode: undefined,
                id: undefined,
            }

            var videoIdParam = gmArrays.findElementUsingFilter(parsedUrl.searchParamsArray, 'key === "v"')

            if (videoIdParam && parsedUrl.pathnameAsArray.length === 1) {
                result.id = videoIdParam.value
                if (gmValues.isDefinedAndNotNull(result.id)) {
                    switch (parsedUrl.pathnameAsArray[0].toLowerCase()) {
                        case 'watch':
                            result.playerMode = 'video'
                            break

                        case 'live_chat':
                            result.playerMode = 'chat'
                            break
                    }
                }
            }

            return result
        },

        setItemPlayerMode: function (item, playerMode) {
            item.playerMode = playerMode

            switch (item.playerMode.toLowerCase()) {
                case 'video':
                    item.embedUrl = sprintf('https://www.youtube.com/embed/%s?autoplay=1', item.id)
                    break

                case 'chat':
                    item.embedUrl = sprintf('https://www.youtube.com/live_chat?v=%s&embed_domain=%s', item.id, location.hostname)
                    break

                case 'videoandchat':
                    break
            }
        },

        createItemPlayer: function (item, $playerDiv) {
            item.player = undefined

            switch (item.playerMode) {
                case 'video':
                    item.player = new YT.Player($playerDiv[0], {
                        videoId: item.id,
                        events: {
                            onReady: embedManager.interfaceManager.onYoutubePlayerReady.bind(embedManager.interfaceManager),
                            onStateChange: embedManager.interfaceManager.onYoutubePlayerStateChange,
                        },
                    })
                    break
            }
        },

        getItemPlayerMute: function (item) {
            if (item.player && item.player instanceof YT.Player) return item.player.isMuted()
            else return true
        },

        setItemPlayerMute: function (item, mute) {
            if (item.player && item.player instanceof YT.Player) {
                if (mute) item.player.mute()
                else item.player.unMute()
            }
        },

        setItemPlayerVisible: function (item, visible) {
            if (item.player && item.player instanceof YT.Player) {
                if (visible)
                    // !!
                    item.player.mute()
                else item.player.unMute()
            }
        },

        getItemPlayerVolume: function (item) {
            if (item.player && item.player instanceof YT.Player) return item.player.getVolume()
            else return 0
        },

        setItemPlayerVolume: function (item, volume) {
            if (item.player && item.player instanceof YT.Player) item.player.setVolume(Math.floor(volume))
        },
    })

    this.addEmbedItemType('twitch channel', {
        getPlayerModeAndIdForUrl: function (url, parsedUrl) {
            parsedUrl = parsedUrl || parseUrl(url)
            if (!parsedUrl) return null

            if (!parsedUrl.pathnameAsArray.length) return null

            var result = {
                playerMode: undefined,
                id: undefined,
            }

            switch (parsedUrl.host.toLowerCase()) {
                case 'www.twitch.tv':
                    if (parsedUrl.pathnameAsArray.length === 1) {
                        if (['directory'].indexOf(parsedUrl.pathnameAsArray[0]) === -1) {
                            result.playerMode = 'video'
                            result.id = parsedUrl.pathnameAsArray[0]
                        }
                    } else if (parsedUrl.pathnameAsArray.length === 3) {
                        if (parsedUrl.pathnameAsArray[0] === 'popout' && parsedUrl.pathnameAsArray[2] === 'chat') {
                            result.playerMode = 'chat'
                            result.id = parsedUrl.pathnameAsArray[1]
                        }
                    }
                    break

                case 'player.twitch.tv': {
                    var videoIdParam = gmArrays.findElementUsingFilter(parsedUrl.searchParamsArray, 'key === "channel"')
                    if (videoIdParam) {
                        result.playerMode = 'video'
                        result.id = videoIdParam.value
                    }
                }
            }

            return result
        },

        setItemPlayerMode: function (item, playerMode) {
            item.playerMode = playerMode

            switch (item.playerMode.toLowerCase()) {
                case 'video':
                    item.embedUrl = sprintf('https://player.twitch.tv/?channel=%s', item.id)
                    break
                case 'chat':
                    item.embedUrl = sprintf('https://www.twitch.tv/embed/%s/chat', item.id)
                    break
                case 'videoandchat':
                    break
            }
        },

        createItemPlayer: function (item, $playerDiv) {
            item.player = undefined

            switch (item.playerMode) {
                case 'video':
                    item.player = new Twitch.Player($playerDiv.attr('id'), {
                        height: '100%',
                        width: '100%',
                        channel: item.id,
                    })

                    embedManager.interfaceManager.setItemVolume(item, embedManager.options.defaultItemVolume)
                    embedManager.interfaceManager.setItemMute(item, embedManager.options.muteNewItems)

                    break

                case 'videoAndChat':
                    item.player = new Twitch.Embed($playerDiv.attr('id'), {
                        height: '100%',
                        width: '100%',
                        channel: item.id,
                    })

                    embedManager.interfaceManager.setItemVolume(item, embedManager.options.defaultItemVolume)
                    embedManager.interfaceManager.setItemMute(item, embedManager.options.muteNewItems)

                    break
            }
        },

        getItemPlayerMute: function (item) {
            if (item.player && item.player instanceof Twitch.Player) return item.player.getMuted()
            else return true
        },

        setItemPlayerMute: function (item, mute) {
            if (item.player && item.player instanceof Twitch.Player) item.player.setMuted(mute)
        },

        getItemPlayerVolume: function (item) {
            if (item.player && item.player instanceof Twitch.Player) return item.player.getVolume() * 100
            else return 0
        },

        setItemPlayerVolume: function (item, volume) {
            if (item.player && item.player instanceof Twitch.Player) item.player.setVolume(volume / 100)
        },
    })
}

GMEmbedManager.prototype.getEmbedItemType = function (name) {
    return gmArrays.findObject(this.itemTypes, 'name', name)
}

GMEmbedManager.prototype.getEmbedItemTypeForUrl = function (url, parsedUrl) {
    parsedUrl = parsedUrl || parseUrl.url
    if (!parsedUrl) return null

    for (var c = 0; c < this.itemTypes.length; c++) {
        var itemType = this.itemTypes[c]
        var playerModeAndId = itemType.getPlayerModeAndIdForUrl(url, parsedUrl)
        if (playerModeAndId && gmValues.isDefinedAndNotNull(playerModeAndId.playerMode)) return itemType
    }

    return null
}

GMEmbedManager.prototype.addEmbedItemType = function (name, options) {
    var itemType = new GMEmbedItemType(this)

    itemType.name = new NameObject(name)

    for (var p in options) itemType[p] = options[p]

    this.itemTypes.push(itemType)
    return itemType
}

GMEmbedManager.prototype.initialiseYoutubeIframeAPI = function (rows) {
    var tag = document.createElement('script')

    tag.src = 'https://www.youtube.com/iframe_api'

    var firstScriptTag = document.getElementsByTagName('script')[0]

    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
}

GMEmbedManager.prototype.setRows = function (rows) {
    this.setColumnsAndRows(this.columns, rows)
}

GMEmbedManager.prototype.setColumns = function (columns) {
    this.setColumnsAndRows(columns, this.rows)
}

GMEmbedManager.prototype.setAutoRows = function (value) {
    this.autoRows = value
    this.normaliseColumnsAndRows()
}

GMEmbedManager.prototype.setAutoColumns = function (value) {
    this.autoColumns = value
    this.normaliseColumnsAndRows()
}

GMEmbedManager.prototype.setColumnsAndRows = function (columns, rows) {
    this.columns = columns
    this.rows = rows

    console.log('setColumnsAndRows', columns, rows)

    this.normalise(false)
}

GMEmbedManager.prototype.unbindItemFromPanel = function (item) {
    if (item.panel) {
        this.interfaceManager.destroyItemPlayer(item)

        item.panel.item = null
        item.panel = null
    }
}

GMEmbedManager.prototype.bindItemToPanel = function (item, panel) {
    if (item.panel) this.unbindItemFromPanel(item)

    item.panel = panel
    panel.item = item

    this.interfaceManager.createItemPlayer(item)
}

GMEmbedManager.prototype.getFirstUnboundPanel = function () {
    for (var c = 0; c < this.panels.length; c++) {
        var panel = this.panels[c]

        if (panel.item === null) return panel
    }

    return null
}

GMEmbedManager.prototype.getNextIndex = function () {
    var index = this.nextIndex
    this.nextIndex++
    return index
}

GMEmbedManager.prototype.findPanelByIndex = function (index) {
    return gmArrays.findElementUsingFilter(this.panels, 'index === ' + index.toString())
}

GMEmbedManager.prototype.addPanel = function () {
    var panel = new GMEmbedPanel(this)
    panel.index = this.getNextIndex()

    this.panels.push(panel)

    this.interfaceManager.addPanelDiv(panel)

    return panel
}

GMEmbedManager.prototype.removePanel = function (panel, opRemoveItem) {
    var panelItem = panel.item
    if (panelItem) this.unbindItemFromPanel(panelItem)

    this.interfaceManager.removePanelDiv(panel)

    gmArrays.remove(this.panels, panel)

    if (panelItem && gmValues.getOptionalValue(opRemoveItem, true)) this.removeItem(panelItem)

    this.normalise()
}

GMEmbedManager.prototype.normalise = function (opNormaliseColumnsAndRows) {
    var normaliseColumnsAndRows = gmValues.getOptionalValue(opNormaliseColumnsAndRows, true)
    if (normaliseColumnsAndRows) this.normaliseColumnsAndRows()
    this.normalisePanels()
    this.normaliseItemPanels()
    this.interfaceManager.normalisePanelDivs()
}

GMEmbedManager.prototype.normalisePanels = function () {
    var requiredPanelsLength = this.columns * this.rows

    while (this.panels.length > requiredPanelsLength) this.removePanel(this.panels[this.panels.length - 1], false)

    while (this.panels.length < requiredPanelsLength) this.addPanel()
}

GMEmbedManager.prototype.normaliseItemPanels = function () {
    for (var c = 0; c < this.items.length; c++) {
        var item = this.items[c]
        if (item.panel !== null) continue
        var panel = this.getFirstUnboundPanel()
        if (panel) this.bindItemToPanel(item, panel)
    }
}

GMEmbedManager.prototype.normaliseColumnsAndRows = function () {
    function scr(c, r) {
        embedManager.setColumnsAndRows(c, r)
    }

    var embedManager = this

    if (!(this.autoColumns || this.autoRows)) return

    var itemCount = this.items.length

    if (itemCount <= 1) return scr(1, 1)
    if (itemCount <= 2) return scr(1, 2)
    if (itemCount <= 4) return scr(2, 2)
    if (itemCount <= 6) return scr(3, 2)
    if (itemCount <= 9) return scr(3, 3)
    if (itemCount <= 12) return scr(4, 3)
    if (itemCount <= 16) return scr(4, 4)
    if (itemCount <= 20) return scr(5, 4)
    if (itemCount <= 25) return scr(5, 5)
}

GMEmbedManager.prototype.findItem = function (url) {
    return gmArrays.findElementUsingFilter(this.items, sprintf('inputUrl === "%s" || embedUrl === "%s"', url))
}

GMEmbedManager.prototype.findItemByPlayer = function (player) {
    return gmArrays.findElementUsingFilter(this.items, function (item) {
        return item.player === player
    })
}

GMEmbedManager.prototype.addItem = function (inputUrl) {
    var item = new GMEmbedItem(this)
    item.index = this.getNextIndex()

    if (!this.setItemUrl(item, inputUrl)) return null

    this.items.push(item)
    return item
}

GMEmbedManager.prototype.removeItem = function (item) {
    if (item.panel) this.unbindItemFromPanel(item)

    gmArrays.remove(this.items, item)

    this.normalise()
}

GMEmbedManager.prototype.setItemId = function (item, id) {
    item.id = id
    this.setItemPlayerMode(item.playerMode)
}

GMEmbedManager.prototype.setItemUrl = function (item, inputUrl) {
    item.inputUrl = inputUrl
    item.parsedInputUrl = parseUrl(item.inputUrl)

    if (!item.parsedInputUrl) return false

    item.host = item.parsedInputUrl.host.toLowerCase()
    item.embedUrl = item.inputUrl
    item.player = undefined
    item.playerMode = undefined
    item.id = undefined
    item.title = undefined

    item.itemType = this.getEmbedItemTypeForUrl(item.inputUrl, item.parsedInputUrl)
    if (gmValues.isDefinedAndNotNull(item.itemType)) {
        var tmpPlayerModeAndId = item.itemType.getPlayerModeAndIdForUrl(item.inputUrl, item.parsedInputUrl)
        if (tmpPlayerModeAndId) {
            item.id = tmpPlayerModeAndId.id
            item.itemType.setItemPlayerMode(item, tmpPlayerModeAndId.playerMode)
        }
    }

    item.parsedEmbedUrl = parseUrl(item.embedUrl)
    console.log(item)
    if (!item.parsedEmbedUrl) return false

    return true
}
