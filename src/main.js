var embedManager = new GMEmbedManager()

function onYouTubeIframeAPIReady() {
    console.log('youtubeIframeAPIReady')
    //	addTestItems ()
}

function initialiseEmbed() {
    embedManager.initialise()

    console.log(embedManager)
}

function addTestItems() {
    embedManager.interfaceManager.addItem('https://www.twitch.tv/shroud')
    embedManager.interfaceManager.addItem('https://www.twitch.tv/sypherpk')
    embedManager.interfaceManager.addItem('https://www.twitch.tv/poach')
    embedManager.interfaceManager.addItem('https://www.twitch.tv/aydan')
}

function editTitle() {
    var title = prompt('Enter title', document.title)
    if (title) document.title = title
}

function initialiseEventHandlers() {
    $(window).resize(function () {
        if (embedManager) embedManager.normalise()
    })

    $(document).on('click', '.panelIcon', function () {
        var $this = $(this)
        var $panelDiv = $(this).closest('.' + embedManager.interfaceManager.panelDivClass)
        var panel = embedManager.interfaceManager.getPanelForDiv($panelDiv)
        console.log(panel)
        if (panel) {
            var panelItem = panel.item

            if ($this.hasClass('removeItem')) {
                embedManager.removePanel(panel, true)
            }

            if ($this.hasClass('maximizeItem')) {
                embedManager.interfaceManager.togglePanelMaximized(panel)
            }

            if ($this.hasClass('refreshItem') && panelItem) {
                embedManager.unbindItemFromPanel(panelItem)
                embedManager.bindItemToPanel(panelItem, panel)
            }

            if ($this.hasClass('muteAllItems')) {
                embedManager.interfaceManager.muteAllItems()
            }

            if ($this.hasClass('toggleItemMute') && panelItem) {
                embedManager.interfaceManager.toggleItemMute(panelItem)
            }

            if ($this.hasClass('toggleItemVisible') && panelItem) {
                embedManager.interfaceManager.toggleItemVisible(panelItem)
            }

            if ($this.hasClass('muteAllItemsExceptThis')) {
                embedManager.interfaceManager.muteAllItemsExceptItem(panelItem)
            }
        }
    })

    $('.addItem').on('click', function () {
        embedManager.interfaceManager.addItem('')
    })

    $('.columnsInput').on('click change keyup', function () {
        embedManager.setColumns($('.columnsInput').val())
    })

    $('.rowsInput').on('click change keyup', function () {
        embedManager.setRows($('.rowsInput').val())
    })

    $('.autoColumnsInput').on('click change keyup', function () {
        embedManager.setAutoColumns($('.autoColumnsInput').is(':checked'))
    })

    $('.autoRowsInput').on('click change keyup', function () {
        embedManager.setAutoRows($('.autoRowsInput').is(':checked'))
    })

    $('.editTitle').on('click', function () {
        editTitle()
    })

    $('.urlInput').on('keypress', function () {
        var lowerCaseKey = event.key.toLowerCase()

        switch (lowerCaseKey) {
            case 'enter':
                embedManager.interfaceManager.addItem('')
                break
        }
    })

    $(document).on('mouseenter', '.' + embedManager.interfaceManager.panelDivClass, function () {
        var $panelDiv = $(this)
        var panel = embedManager.interfaceManager.getPanelForDiv($panelDiv)
        if (panel) {
            embedManager.interfaceManager.setActivePanel(panel)

            if (panel.item) $panelDiv.find('.' + embedManager.interfaceManager.panelDivFloatingToolsDivClass).css('display', 'block')
        }
    })

    $(document).on('mouseleave', '.' + embedManager.interfaceManager.panelDivClass, function () {
        var $panelDiv = $(this)
        var panel = embedManager.interfaceManager.getPanelForDiv($panelDiv)
        if (panel) {
            if (panel.item) $panelDiv.find('.' + embedManager.interfaceManager.panelDivFloatingToolsDivClass).css('display', 'none')
        }
    })

    // $(document).on ('mousedown','.' + embedManager.interfaceManager.panelDivClass, function () {
    // 	embedManager.interfaceManager.mouseDownPanel = embedManager.interfaceManager.activePanel
    // })

    // $(document).on ('mouseup','.' + embedManager.interfaceManager.panelDivClass, function (event) {
    // 	embedManager.interfaceManager.mouseUpPanel = embedManager.interfaceManager.activePanel
    // 	if (embedManager.interfaceManager.mouseDownPanel && embedManager.interfaceManager.mouseUpPanel && embedManager.interfaceManager.mouseDownPanel !== embedManager.interfaceManager.mouseUpPanel)
    // 	{
    // 		event.preventDefault ()
    // 		embedManager.interfaceManager.swapPanelItems (embedManager.interfaceManager.mouseDownPanel,embedManager.interfaceManager.mouseUpPanel)
    // 	}
    // })

    $(document).on('keypress', function (event) {
        var $focused = $(':focus')
        if (!(!$focused.length || $focused.hasClass(embedManager.interfaceManager.panelDivClass))) return

        var lowerCaseKey = event.key.toLowerCase()

        switch (lowerCaseKey) {
            case 'a':
                embedManager.interfaceManager.addItem('')
                break

            case 't':
                editTitle()
                break

            case 'd':
                console.log(embedManager)
                break
        }

        switch (event.key) {
            case 'c':
                embedManager.setColumns(embedManager.columns + 1)
                break
            case 'C':
                embedManager.setColumns(Math.max(1, embedManager.columns - 1))
                break
            case 'r':
                embedManager.setRows(embedManager.rows + 1)
                break
            case 'R':
                embedManager.setRows(Math.max(1, embedManager.rows - 1))
                break
            case 'h':
                $('#controlDiv').css('display', 'table-row')
                embedManager.normalise()
                break
            case 'H':
                $('#controlDiv').css('display', 'none')
                embedManager.normalise()
                break
        }

        if (embedManager.interfaceManager.activePanel) {
            switch (lowerCaseKey) {
                case 'x':
                    embedManager.removePanel(embedManager.interfaceManager.activePanel, true)
                    break
            }
        }

        updateInterface()
    })
}

function initialiseInterface() {
    $(embedManager.interfaceManager.panelDivsContainerSelector).sortable()
    $(embedManager.interfaceManager.panelDivsContainerSelector).disableSelection()

    updateInterface()
    initialiseEventHandlers()
}

function updateInterface() {
    $('.columnsInput').val(embedManager.columns)
    $('.rowsInput').val(embedManager.rows)
}

$(document).ready(function () {
    delete Array.prototype.toJSON // Required to make JSON.stringify work.

    //	gmTestsManager.runAllTests ()

    initialiseEmbed()
    initialiseInterface()
})
