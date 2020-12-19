function createGMPageScriptHelper ()
{
	var psh = new GMPageScriptHelper ()

	return psh
}

function GMPageScriptHelper ()
{
	var psh = this

	this.timeAtPageLoad = new Date ()
	this.parsedLocation = parseUrl (location.href)
	this.parsedLocationAtPageLoad = parseUrl (location.href)

	this.options = {
		useLocationAtPageLoadWhenRefreshingPage: true,
	}

	this.autoRefresh = {
		options:
		{
			enabled: false,
			intervalInMinutes: 60,
			onlyIfAtTopOfDocument: true
		},
		enable: function (intervalInMinutes,onlyIfAtTopOfDocument)
		{
			psh.autoRefresh.options.enabled = true
			psh.autoRefresh.options.intervalInMinutes = intervalInMinutes
			if (onlyIfAtTopOfDocument !== undefined)
				psh.autoRefresh.options.onlyIfAtTopOfDocument = onlyIfAtTopOfDocument

			psh.autoRefresh.timer = setInterval (function () {
				if (!psh.autoRefresh.options.enabled)
					return

				if (psh.timeSincePageLoad () < psh.autoRefresh.options.intervalInMinutes * 60 * 1000)
					return

				if (psh.autoRefresh.options.onlyIfAtTopOfDocument && window.scrollY > 0)
					return

				psh.refreshPage ()
			},500)

		},
		timer: undefined
	}

}

GMPageScriptHelper.prototype.activate = function ()
{
	var pageScriptHelper = this

	if (pageScriptHelper.options.autoRefresh.enabled)
	{
	}
}

GMPageScriptHelper.prototype.timeSincePageLoad = function ()
{
	var now = new Date ()

	return now - this.timeAtPageLoad
}

GMPageScriptHelper.prototype.refreshPage = function ()
{
	if (this.options.useLocationAtPageLoadWhenRefreshingPage)
		location.href = this.parsedLocationAtPageLoad.href
	else
		location.reload ()
}

GMPageScriptHelper.prototype.makeElementFillWindow = function ($element)
{
	if (!$element.length)
	{
		console.log ('error:makeElementFillWindow:no element found')
		return
	}

	// OnFullScreenAnythingModeChangeClick ($element [0])
	$element [0].scrollIntoView ()
	OnFullScreenAnythingModeChangeClick ()
}
