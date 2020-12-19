function initialiseGMCSClient (userParams)
{
	var gmcsClient = new GMCSClient ();
	gmcsClient.initialise (userParams);
	return gmcsClient;
}

function GMCSClient ()
{
	this.params = {
		name: undefined,
		protocol: 'https:',
		receiveMessagesSentFromSelf: false,
		receiveMessagesSentToClientsOtherThanSelf: false,

		onMessageReceived: null,
		onMessageReplyReceived: null,
		onClientReady: null,

		pingEnabled: false,
		pingIntervalInSeconds: 0,
		messagingMode: 'localStorage',
		debugMode: false,
	}

	this.id = undefined;
	this.ready = false;
	this.connected = false;
	this.messagesWaitingToBeSent = [];
	this.messagesWaitingForReplies = [];
	this.nextMessageIdIndex = 0
	this.private = new GMCSClientPrivate (this)
}

function GMCSMessage (gmcsClient)
{
	this.messageType = 'message'
	this.gmcsMessageId = gmcsClient.getNextMessageId ()

	this.contents = {};

	this.metadata = {
		sender: {
			id: gmcsClient.id,
			name: isDefinedAndNotEmpty (gmcsClient.name) ? gmcsClient.name.Name : undefined
		},
		recipients: []
	}
}

function GMCSMessageWaitingForReply (gmcsMessage,onReply)
{
	this.message = gmcsMessage
	this.onReply = onReply
}

GMCSClient.prototype.sendMessage = function (toClientOrClients,messageOrMessageContents)
{
	if (this.isValidGMCSMessage (toClientOrClients))
		return this.sendGMCSMessage (toClientOrClients)

	var clients = valueToArray (toClientOrClients)
	return this.sendMessageToClients (clients,messageOrMessageContents)
}

GMCSClient.prototype.sendMessageToClient = function (client,messageOrMessageContents)
{
	var clients = valueToArray (client)
	return this.sendMessageToClients (clients,messageOrMessageContents);
}

GMCSClient.prototype.sendMessageToClients = function (clients,messageOrMessageContents)
{
	clients = valueToArray (clients)

	var gmcsMessage = this.createGMCSMessage (messageOrMessageContents);

	gmcsMessage.metadata.recipients = getCopyOfArray (clients);
	for (var c = 0; c < gmcsMessage.metadata.recipients.length; c ++)
		gmcsMessage.metadata.recipients [c] = this.private.resolveClientIdentifier (gmcsMessage.metadata.recipients [c])

	this.sendGMCSMessage (gmcsMessage)
}

GMCSClient.prototype.sendGMCSMessage = function (gmcsMessage)
{
	if (!this.isValidGMCSMessage (gmcsMessage))
		return false

	if (this.ready)
	{
		if (this.debugMode)
			console.log ('gmcsClient:Sending message:',gmcsMessage)

		if (isDefined (gmcsMessage.onReply))
		{
			var onReply = gmcsMessage.onReply
			delete gmcsMessage.onReply

			gmcsMessage.wantReply = true
			var messageWaitingForReply = new GMCSMessageWaitingForReply ()
			messageWaitingForReply.message = gmcsMessage
			messageWaitingForReply.onReply = onReply
			this.messagesWaitingForReplies.push (messageWaitingForReply)
		}

		this.private.postGMCSMessage (gmcsMessage)
	}
	else
	{
		if (this.debugMode)
			console.log ('gmcsClient:Client not ready:Adding message to messagesWaitingToBeSent:',gmcsMessage)
		this.messagesWaitingToBeSent.push (gmcsMessage);
	}
}

GMCSClient.prototype.broadcastMessage = function (messageOrMessageContents)
{
	return this.sendMessageToAllClients (messageOrMessageContents);
}

GMCSClient.prototype.sendMessageToAllClients = function (messageOrMessageContents)
{
	return this.sendMessageToClients ([],messageOrMessageContents);
}

GMCSClient.prototype.replyToMessage = function (message,replyMessageOrReplyMessageContents)
{
	if (!this.isValidGMCSMessage (message))
		return false

	var replyMessage = this.createGMCSMessage (replyMessageOrReplyMessageContents)
	replyMessage.inReplyToMessageId = message.gmcsMessageId
	replyMessage.metadata.recipients = [message.metadata.sender]
	this.sendMessage (replyMessage)
}

GMCSClient.prototype.createGMCSMessage = function (messageOrMessageContents)
{
	if (this.isValidGMCSMessage (messageOrMessageContents))
		return messageOrMessageContents

	var gmcsMessage;

	gmcsMessage = new GMCSMessage (this);
	if (isDefined (messageOrMessageContents))
		gmcsMessage.contents = messageOrMessageContents;

	return gmcsMessage;
}

GMCSClient.prototype.sendPing = function ()
{
	var pingMessage = this.createGMCSMessage ();
	pingMessage.metadata.messageType = 'ping'

	this.broadcastMessage (pingMessage);
}

GMCSClient.prototype.sendNextMessageWaitingToBeSent = function ()
{
	if (!this.ready)
		return;

	if (this.messagesWaitingToBeSent.length === 0)
		return;

	var nextMessageWaitingToBeSent = this.messagesWaitingToBeSent [0];
	this.messagesWaitingToBeSent.splice (0,1);

	this.sendGMCSMessage (nextMessageWaitingToBeSent)
}

GMCSClient.prototype.getNextMessageId = function ()
{
	var nextMessageId = this.id + '-' + this.nextMessageIdIndex.toString ()
	this.nextMessageIdIndex ++
	return nextMessageId
}

GMCSClient.prototype.isValidGMCSMessage = function (message)
{
	if (isNotDefined (message))
		return false;

	if (isNotDefined (message.gmcsMessageId))
		return false;

	if (isNotDefined (message.messageType))
		return false;

	if (isNotDefined (message.metadata))
		return false;

	if (isNotDefined (message.contents))
		return false;

	return true;
}

GMCSClient.prototype.initialise = function (userParams)
{
	var gmcsClient = this;
	var params = userParams || {};

	setupClientFromParams ();

	gmcsClient.id = gmcsClient.private.setClientId () // set id here so it can't be overwritten in setupClientFromParams

	if (this.debugMode)
		console.log ('gmcsClient:Initialising',gmcsClient);

	gmcsClient.private.initialiseIframe ();

	addEventListener ('message',gmcsClient.private.processRawReceivedMessage.bind (gmcsClient.private),false);
	addEventListener ('storage',gmcsClient.private.onStorageChange.bind (gmcsClient.private));

	setInterval (gmcsClient.sendNextMessageWaitingToBeSent,50);

	if (gmcsClient.pingEnabled && gmcsClient.pingIntervalInSeconds > 0)
	{
		gmcsClient.sendPing ();
		setInterval (gmcsClient.sendPing,Math.floor (gmcsClient.pingIntervalInSeconds * 1000));
	}

	function setupClientFromParams ()
	{
		copyCommonProperties (params,gmcsClient.params);
		copyProperties (gmcsClient.params,gmcsClient);

		gmcsClient.protocol = (gmcsClient.protocol || 'https:').toLowerCase ();
		if (gmcsClient.protocol [gmcsClient.protocol.length - 1] != ':')
			gmcsClient.protocol += ':';

		if (isDefined (gmcsClient.name))
			gmcsClient.name = new NameObject (gmcsClient.name);

		gmcsClient.pingEnabled = (gmcsClient.pingInterval > 0);
	}
}

function GMCSClientPrivate (gmcsClient)
{
	this.gmcsClient = gmcsClient

	this.iframeElement = null;
	this.iframeSrc = '';
	this.iframeReady = false;
}

GMCSClientPrivate.prototype.setClientId = function ()
{
	var gmcsClient = this.gmcsClient

	gmcsClient.id = gmcsClientIdPrefix + generateRandomString (gmcsRandomClientIdLength)

	return gmcsClient.id
}

GMCSClientPrivate.prototype.isValidClientId = function (id)
{
	if (id.length !== gmcsClientIdPrefix.length + gmcsRandomClientIdLength) return false
	if (id.indexOf (gmcsClientIdPrefix) !== 0) return false
	return true
}

GMCSClientPrivate.prototype.resolveClientIdentifier = function (objectOrIdOrName)
{
	if (isObject (objectOrIdOrName))
		return objectOrIdOrName

	var result = {}
	if (this.isValidClientId (objectOrIdOrName))
		result.id = objectOrIdOrName
	else
		result.name = objectOrIdOrName

	return result
}

GMCSClientPrivate.prototype.isMessageIntendedForThisClient = function (message)
{
	var gmcsClient = this.gmcsClient

	if (!gmcsClient.receiveMessagesSentFromSelf && message.metadata.sender.id === gmcsClient.id)
		return false;

	if (gmcsClient.receiveMessagesSentToClientsOtherThanSelf)
		return true;

	if (message.metadata.recipients.isEmpty ())
		return true;

	for (var c = 0; c < message.metadata.recipients.length; c ++)
	{
		var clientIdentifier = this.resolveClientIdentifier (message.metadata.recipients [c])
		if (isDefinedAndNotEmpty (clientIdentifier.id) && clientIdentifier.id === gmcsClient.id)
			return true;
		if (isDefinedAndNotEmpty (clientIdentifier.name) && isDefined (gmcsClient.name) && gmcsClient.name.MatchesString (clientIdentifier.name))
			return true;
	}

	return false;
}

GMCSClientPrivate.prototype.initialiseIframe = function ()
{
	var gmcsClient = this.gmcsClient

	this.iframeReady = false;

	this.iframeSrc = gmcsClient.protocol + '//localhost/MyWebStuff/localStorageGlobalMessaging/localStorageGlobalMessagingHost.html';

	$('body').append ('<div id="localStorageGlobalMessagingHostiframeDiv" style="display: none"><iframe id="localStorageGlobalMessagingHostiframe" src="' + this.iframeSrc + '"</iframe></div>');

	this.iframeElement = document.getElementById ('localStorageGlobalMessagingHostiframe');
	this.iframeElement.onload = this.onIframeLoad.bind (this);
}

GMCSClientPrivate.prototype.onIframeLoad = function ()
{
	var gmcsClient = this.gmcsClient

	this.iframeReady = true;
	gmcsClient.ready = true;
	gmcsClient.connected = true;

	console.log ('gmcsClient:Initialised',gmcsClient);

	if (isDefined (gmcsClient.onClientReady))
		gmcsClient.onClientReady ();
}

GMCSClientPrivate.prototype.onStorageChange = function (event)
{
	var gmcsClient = this.gmcsClient

	var key = event.key;
	var value = event.newValue;

	if (key != gmcsLocalStorageKeyStub)
		return;

	if (value == null)
		return;

	var message = JSON.parse (value);

	this.processRawReceivedMessage (message);
}

GMCSClientPrivate.prototype.processRawReceivedMessage = function (message)
{
	var gmcsClient = this.gmcsClient

	if (!gmcsClient.isValidGMCSMessage (message))
		return false;

	if (!this.isMessageIntendedForThisClient (message))
		return false;

	this.processReceivedMessage (message);
}

GMCSClientPrivate.prototype.processReceivedMessage = function (message)
{
	var gmcsClient = this.gmcsClient

	//!!
	if (gmcsClient.debugMode)
		console.log ('gmcsClient:Received message:',message);

	if (isDefined (gmcsClient.onMessageReceived))
		gmcsClient.onMessageReceived (message);
}

GMCSClientPrivate.prototype.SetGlobalStorage = function (pKey,pValue)
{
	var gmcsClient = this.gmcsClient

	var gmcsMessage = gmcsClient.createGMCSMessage ()

	gmcsMessage.messageType = 'setglobalstorage';
	gmcsMessage.contents.key = pKey;
	gmcsMessage.contents.value = pValue;

	this.postGMCSMessageToWindow (gmcsMessage);
}

GMCSClientPrivate.prototype.RemoveGlobalStorage = function (pKey)
{
	var gmcsClient = this.gmcsClient

	var gmcsMessage = gmcsClient.createGMCSMessage ()

	gmcsMessage.messageType = 'removeglobalstorage';
	gmcsMessage.contents.key = pKey;

	this.postGMCSMessageToWindow (gmcsMessage);
}

GMCSClientPrivate.prototype.postGMCSMessageToWindow = function (message)
{
	var gmcsClient = this.gmcsClient

	if (gmcsClient.ready)
		this.iframeElement.contentWindow.postMessage (message,'*');
}

GMCSClientPrivate.prototype.postGMCSMessageToLocalStorage = function (message)
{
	var gmcsClient = this.gmcsClient

	var messageStr = JSON.stringify (message);

	this.SetGlobalStorage (gmcsLocalStorageKeyStub,messageStr);
	this.RemoveGlobalStorage (gmcsLocalStorageKeyStub);
}

GMCSClientPrivate.prototype.postGMCSMessage = function (message)
{
	this.postGMCSMessageToLocalStorage (message);
}

var gmcsClientIdPrefix = '';
var gmcsRandomClientIdLength = 5;
var gmcsLocalStorageKeyStub = 'gmcsMessage';
