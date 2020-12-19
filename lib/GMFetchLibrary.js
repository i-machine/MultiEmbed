var gmFetchManager = createGMFetchManager ()
var gmCorsAnywhereServer, gmNodeJSServer

function gmFetch (url,options)
{
	return gmFetchManager.fetch (url,options)
}

function gmFetchFile (filename,options)
{
	return gmFetchManager.fetchFile (filename,options)
}

function gmFetchSaveFile (filename,contents,options)
{
	return gmFetchManager.saveFile (filename,contents,options)
}

function createGMFetchManager ()
{
	var gmFetchManager = new GMFetchManager ()

	return gmFetchManager
}

function GMFetchManager ()
{
	this.gmCorsAnywhereServer = new GMFetchProxyServer (this,'http://localhost:8080/')
	this.gmNodeJSServer = new GMFetchProxyServer (this,'https://localhost:3000/fetchUrl?url=')
	gmCorsAnywhereServer = this.gmCorsAnywhereServer
	gmNodeJSServer = this.gmNodeJSServer
	this.proxyServer = this.gmCorsAnywhereServer
}

function GMFetchRequest (url,options,opGMFetchManager)
{
	var fetchRequest = this

	this.gmFetchManager = opGMFetchManager || gmFetchManager
	this.proxyServer = gmFetchManager.proxyServer

	this.url = url
	this.useProxyServer = false
	this.proxyUrl = undefined

	this.options = new GMFetchRequestOptions ()
	this.gmFetchManager.updateFetchRequestFromOptions (this,options)

	this.fetchResponse = undefined
	this.fetchResponseStatus = undefined
}

function GMFetchResponse (gmFetchRequest)
{
	this.fetchRequest = gmFetchRequest
	this.response = undefined
	this.contents = undefined
	this.json = undefined
	this.status = undefined
}

function GMFetchRequestOptions ()
{
	this.convertToJson = false
	this.removeScriptTags = true
	this.queryParams = undefined
	this.proxyServer = undefined
	this.saveFile = undefined
}

function GMFetchProxyServer (gmFetchManager,serverUrl)
{
	this.gmFetchManager = gmFetchManager
	this.serverUrl = serverUrl
}

GMFetchManager.prototype.fetch = function (url,options)
{
	var gmFetchManager = this

	var fetchRequest = gmFetchManager.createFetchRequest (url,options)

	return gmFetchManager.executeFetchRequest (fetchRequest)
}

GMFetchManager.prototype.fetchFile = function (filename,options)
{
	return this.fetch ('file://' + filename,options)
}

GMFetchManager.prototype.saveFile = function (filename,contents,options)
{
	var gmFetchManager = this

	options = options || {}
	options.saveFile = true

	filenamePlusProtocol = 'file://' + filename
	var fetchRequest = gmFetchManager.createFetchRequest (filenamePlusProtocol,options)

	return fetch (fetchRequest.useProxyServer ? fetchRequest.proxyUrl : fetchRequest.filenamePlusProtocol,
	{
		mode: 'cors',
		redirect: 'follow',
		method: 'post',
		headers: {
		    'Accept': 'application/json',
		    'Content-Type': 'application/json'
		},
  		body: JSON.stringify ({contents: contents})
	})
}

GMFetchManager.prototype.createFetchRequest = function (url,options)
{
	var fetchRequest = new GMFetchRequest (url,options,this)

	return fetchRequest
}

GMFetchManager.prototype.createFetchResponse = function (fetchRequest)
{
	var fetchResponse = new GMFetchResponse (fetchRequest)
	fetchRequest.fetchResponse = fetchResponse
	return fetchResponse
}

GMFetchManager.prototype.executeFetchRequest = function (fetchRequest)
{
	var gmFetchManager = this

	return new Promise (function (resolve,reject)
	{
		return fetch (fetchRequest.useProxyServer ? fetchRequest.proxyUrl : fetchRequest.url,
		{
			mode: 'cors',
			redirect: 'follow',
			method: 'get'
		})
		.then (response => gmFetchResolveResponseStatus (response,fetchRequest))
		.then (async function (response)
		{
			var fetchResponse = gmFetchManager.createFetchResponse (fetchRequest)
			fetchResponse.status = fetchRequest.fetchResponseStatus
			fetchResponse.response = response
			
			await response.text ().then (text => fetchResponse.contents = text)
			if (fetchRequest.options.removeScriptTags)
				fetchResponse.contents = removeTagsFromHtml (['script'],fetchResponse.contents)
			
			if (fetchRequest.options.convertToJson)
				await response.json ().then (json => fetchResponse.json = json)
			
			return fetchResponse
		})
		.then (function (fetchResponse)
		{
			if (isDefined (resolve))
			{
				resolve (fetchResponse)
				return fetchResponse
			}
		})
		.catch (function (error)
		{
			console.error ('executeFetchRequest failed:', error)
			if (isDefined (reject))
				reject (error)
		})
	})
}

GMFetchManager.prototype.updateFetchRequestFromOptions = function (fetchRequest,options)
{
	if (isDefined (options))
	{
		copyCommonProperties (options,fetchRequest.options)

		function setFetchProxyServer (possiblePropertyNames)
		{
			for (var c = 0; c < possiblePropertyNames.length; c ++)
			{
				var ppn = possiblePropertyNames [c]

				if (options.hasOwnProperty (ppn))
				{
					fetchRequest.proxyServer = options [ppn]
					return
				}
			}
		}

		setFetchProxyServer (['proxyServer','fetchProxyServer','proxy'])
	}

	fetchRequest.useProxyServer = isDefined (fetchRequest.proxyServer)
	if (fetchRequest.useProxyServer)
		fetchRequest.proxyUrl = fetchRequest.proxyServer.serverUrl + fetchRequest.url
	else
		fetchRequest.proxyUrl = undefined
}

function gmFetchResolveResponseStatus (response,fetchRequest)
{
	fetchRequest.fetchResponseStatus = response.status

	if (response.status >= 200 && response.status < 300)
	{
		return Promise.resolve (response)
	}
	else
	{
		// i don't know how to do the error handling so i'm just gonna act like everything's ok and 
		// rely on the caller to check the response status
		return Promise.resolve (response)

//		return Promise.reject (new Error (response.statusText))
	}
}
