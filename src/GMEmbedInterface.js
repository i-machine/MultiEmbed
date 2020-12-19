function GMEmbedInterfaceManager (manager)
{
	this.embedManager = manager
	this.panelDivsContainerSelector = '#panelDivsContainer'
	this.panelDivClass = 'panelDiv'
	this.panelDivTitleDivClass = 'panelDivTitleDiv'
	this.panelDivFloatingToolsDivClass = 'panelDivFloatingToolsDiv'
	this.panelDivPlayerDivClass = 'panelDivPlayerDiv'
	this.panelDivPanelIndexAttr = 'GMEmbedPanelIndex'
	this.activePanel = null
	this.mouseDownPanel = null
	this.mouseUpPanel = null
	this.maximizedPanel = null
}

GMEmbedInterfaceManager.prototype.addItem = function (inputUrl)
{
	if (gmStrings.isEmpty (inputUrl))
	{
		inputUrl = $('.urlInput').val ()
		if (gmStrings.isEmpty (inputUrl))
		{

			inputUrl = prompt ('Enter url to add','')
			if ((!inputUrl) || gmStrings.isEmpty (inputUrl))
				return null
		}
		else
			$('.urlInput').val ('')
	}

	var parsedInputUrl = parseUrl (inputUrl)
	if (!parsedInputUrl)
	{
		alert ('url cannot be parsed')
		return null
	}

	var item = this.embedManager.findItem (inputUrl)

	if (item)
	{
		alert ('url already embedded')
		return item
	}

	item = this.embedManager.addItem (inputUrl)

	if (!item)
	{
		alert ('could not create embed item')
		return null
	}

	this.embedManager.normalise ()

	return item
}

GMEmbedInterfaceManager.prototype.addPanelDiv = function (panel)
{
	var html = ''
	html += sprintf ('<div class="%s" %s="%d" style="display: inline-block; position: relative">',this.panelDivClass,this.panelDivPanelIndexAttr,panel.index)

		html += sprintf	('<div class="%s" style="display: width: 100%%; height: 100%%">',this.panelDivPlayerDivClass)
		html += sprintf ('</div>')

		html += sprintf ('<div class="%s" style="display: none; position: absolute">',this.panelDivFloatingToolsDivClass)
			html += sprintf ('<span class="muteAllItemsExceptThis panelIcon clickable glyphicon glyphicon-volume-up" title="mute all items except this"></span>')
			html += sprintf ('<span class="toggleItemMute panelIcon clickable glyphicon glyphicon-volume-down" title="toggle item mute"></span>')
			html += sprintf ('<span class="muteAllItems panelIcon clickable glyphicon glyphicon-volume-off" title="mute all items"></span>')
			html += sprintf ('<span class="moveItem panelIcon clickable glyphicon glyphicon-move" title="move item to another panel"></span>')
			html += sprintf ('<span class="refreshItem panelIcon clickable glyphicon glyphicon-refresh" title="refresh item embed"></span>')
			html += sprintf ('<span class="maximizeItem panelIcon clickable glyphicon glyphicon-th-large" title="maximize/unmaximize panel"></span>')
			html += sprintf ('<span class="removeItem panelIcon clickable glyphicon glyphicon-remove" title="delete item & panel"></span>')
		html += sprintf ('</div>')
	html += sprintf ('</div>')

	$(this.panelDivsContainerSelector).append (html)
}

GMEmbedInterfaceManager.prototype.removePanelDiv = function (panel)
{
	var $div = this.getDivForPanel (panel)
	if ($div)
		$div.remove ()
}

GMEmbedInterfaceManager.prototype.getAllPanelDivs = function ()
{
	return $(this.panelDivsContainerSelector + ' > .' + this.panelDivClass)
}

GMEmbedInterfaceManager.prototype.getPanelForDiv = function (div)
{
	var $div = $(div)
	var panelIndexStr = $div.attr (this.panelDivPanelIndexAttr)
	if (panelIndexStr.length)
	{
		var panelIndex = parseInt (panelIndexStr)
		var panel = this.embedManager.findPanelByIndex (panelIndex)		

		return panel
	}

	return null
}

GMEmbedInterfaceManager.prototype.getDivForPanel = function (panel)
{
	var meim = this

	var $divs = this.getAllPanelDivs ()
	var $result = null

	$divs.each (function () {
		var $div = $(this)
		var divPanel = meim.getPanelForDiv ($div)
		if (divPanel === panel)
		{
			$result = $div
			return false
		}
	})

	return $result
}

GMEmbedInterfaceManager.prototype.createItemPlayer = function (item)
{
	var $panelDiv = this.getDivForPanel (item.panel)
	var $playerDiv = $('.' + this.panelDivPlayerDivClass,$panelDiv)

	var playerDivId = sprintf ('playerDiv%d',item.index)
	var html = sprintf ('<div id="%s" class="playerDiv" style="height: 100%%; width: 100%%"></div>',playerDivId)
	$playerDiv.append (html)
	var $playerDiv = $panelDiv.find ('#' + playerDivId)

	item.player = undefined

	if (item.itemType)
		item.itemType.createItemPlayer (item,$playerDiv)

	if (!item.player)
	{
		var html = sprintf ('<iframe src="%s" style="height: 100%%; width: 100%%" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>',item.embedUrl)
		html += '</iframe>'
		$playerDiv.append (html)
	}
}

GMEmbedInterfaceManager.prototype.onYoutubePlayerReady = function (event)
{
	var youtubePlayer = event.target
	var item = this.embedManager.findItemByPlayer (youtubePlayer)
	
	this.setItemVolume (item,this.embedManager.options.defaultItemVolume)
	this.setItemMute (item,this.embedManager.options.muteNewItems)

	item.player.playVideo ()
}

GMEmbedInterfaceManager.prototype.onYoutubePlayerStateChange = function (event)
{
	var youtubePlayer = event.target
	var item = this.embedManager.findItemByPlayer (youtubePlayer)
}

GMEmbedInterfaceManager.prototype.destroyItemPlayer = function (item)
{
	var $panelDiv = this.getDivForPanel (item.panel)
	var $playerDiv = $('.' + this.panelDivPlayerDivClass,$panelDiv)

	$playerDiv.html ('')
	item.player = null
}

GMEmbedInterfaceManager.prototype.isItemMuted = function (item)
{
	if (item.itemType && gmValues.isDefinedAndNotNull (item.itemType.getItemPlayerMute))
		return item.itemType.getItemPlayerMute (item)
	else
		return true
}

GMEmbedInterfaceManager.prototype.setItemMute = function (item,mute)
{
	if (item.player && item.itemType && gmValues.isDefinedAndNotNull (item.itemType.setItemPlayerMute))
		item.itemType.setItemPlayerMute (item,mute)
}

GMEmbedInterfaceManager.prototype.toggleItemMute = function (item)
{
	this.setItemMute (item,!this.isItemMuted (item))
}

GMEmbedInterfaceManager.prototype.muteAllItems = function (exceptItem)
{
	for (var c = 0; c < this.embedManager.items.length; c ++)
	{
		var item = this.embedManager.items [c]
		if (item === exceptItem) continue
		this.setItemMute (item,true)
	}
}

GMEmbedInterfaceManager.prototype.setItemVolume = function (item,volume)
{
	if (item.player && item.itemType && gmValues.isDefinedAndNotNull (item.itemType.setItemPlayerVolume))
		item.itemType.setItemPlayerVolume (item,volume)
}

GMEmbedInterfaceManager.prototype.getItemVolume = function (item)
{
	if (item.player && item.itemType && gmValues.isDefinedAndNotNull (item.itemType.getItemPlayerVolume))
		return item.itemType.getItemPlayerVolume (item,volume)
	else
		return 0
}

GMEmbedInterfaceManager.prototype.muteAllItemsExceptItem = function (item)
{
	this.muteAllItems (item)
	this.setItemMute (item,false)
}

GMEmbedInterfaceManager.prototype.setItemPlayerMode = function (item,playerMode)
{
	if (item.itemType && item.panel)
	{
		var itemPanel = item.panel

		this.embedManager.unbindItemFromPanel (item)

		item.itemType.setItemPlayerMode (item,playerMode)
		
		this.embedManager.bindItemToPanel (item,itemPanel)
	}
}

GMEmbedInterfaceManager.prototype.normalisePanelDivs = function ()
{
	for (var c = 0; c < this.embedManager.panels.length; c ++)
	{
		var panel = this.embedManager.panels [c]
		var $panelDiv = this.getDivForPanel (panel)

		var availableWidth = window.innerWidth - 30
		var availableHeight = window.innerHeight - 50

		var columns, rows

		if (this.maximizedPanel && this.maximizedPanel === panel)
		{
			columns = 1
			rows = 1
		}
		else
		{
			columns = this.embedManager.columns
			rows = this.embedManager.rows
		}

		var panelDivPercentWidth = Math.floor (99 / columns)
		var panelDivPercentHeight = Math.floor (99 / rows)

		$panelDiv.css ('width',panelDivPercentWidth + '%')
		$panelDiv.css ('height',panelDivPercentHeight + '%')

		var displayThisDiv = true

		if ((!panel.item) || (this.maximizedPanel && this.maximizedPanel !== panel))
			displayThisDiv = false

		$panelDiv.css ('display',displayThisDiv ? 'inline-block' : 'none')
	}
}

GMEmbedInterfaceManager.prototype.setActivePanel = function (panel)
{
	this.activePanel = panel
}

GMEmbedInterfaceManager.prototype.swapPanelItems = function (panel1,panel2)
{
	var panel1Item = panel1.item
	var panel2Item = panel2.item

	if (panel1Item)
		this.embedManager.unbindItemFromPanel (panel1Item)
	if (panel2Item)
		this.embedManager.unbindItemFromPanel (panel2Item)

	if (panel1Item)
		this.embedManager.bindItemToPanel (panel1Item,panel2)
	if (panel2Item)
		this.embedManager.bindItemToPanel (panel2Item,panel1)
}

GMEmbedInterfaceManager.prototype.togglePanelMaximized = function (panel)
{
	if (this.maximizedPanel === panel)
		this.maximizedPanel = null
	else
		this.maximizedPanel = panel

	this.embedManager.normalise ()
}
