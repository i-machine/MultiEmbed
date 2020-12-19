var GlobalMessagingHostName = 'GlobalMessagingHost';

var GlobalMessagingClient = null;

var interAppMessagingClient = null;

var PendingMessages = [];

var interAppMessagingLocalStorageKeyStub = 'InterappMessaging';

function initialiseInterAppMessagingClient (appName,params)
{
	console.log ('Initialising InterAppMessagingClient', appName);

	interAppMessagingClient = new InterAppMessagingClient (params);
	interAppMessagingClient.appName = appName;

	if (interAppMessagingClient.useGlobalMessagingClient)
		InitialiseGlobalMessagingClient (interAppMessagingClient.appName,interAppMessagingClient.httpProtocol);

	if (interAppMessagingClient.listenForMessages)
	{
		$(window).on ('storage',interAppMessageListener);
//		$(document.getElementById ('GlobalMessagingHostiframeDiv').contentWindow).on ('storage',interAppMessageListener);
	}

	if (params.pingIntervalInSeconds > 0)
	{
		// send an initial "hello" ping
		sendPing ();

		setInterval (sendPing,Math.floor (params.pingIntervalInSeconds * 1000));
	}

	console.log ('interAppMessagingClient initialised:')
	console.log (interAppMessagingClient);

	return interAppMessagingClient;
}

function InterAppMessagingClient (userParams)
{
	var params = {};

	params.useGlobalMessagingClient = true;
	params.listenForMessages = false;
	params.messageCallback = null;
	params.httpProtocol = 'http';
	params.ignoreMessagesIntendedForOtherApps = true;
	params.pingIntervalInSeconds = 0;

	if (userParams)
		copyProperties (userParams,params);

	this.appName = '';
	copyProperties (params,this);
}

function GlobalMessagingClientObject ()
{
	this.Name = '';
	this.Hostiframe = null;
	this.Ready = false;
}

function InterAppMessage ()
{
	this.sourceApp = GlobalMessagingClient.Name;
	this.targetApp = '';
	this.messageType = '';
	this.dataType = '';
	this.data = {};
}

function NewsMessageObject ()
{
	this.TimeStamp = new Date ().toLocaleString ();
	this.HostURL = '';
	this.HostName = '';
	this.SectionName = '';
	this.SectionURL = '';
	this.EntryID = '';
	this.Title = '';
	this.URL = '';
	this.SourceName = '';
	this.SourceURL = '';
	this.Tags = '';
}

function NotificationMessageDataObject ()
{
	this.PlayThisSound = '';
	this.SayThis = '';
	this.SpeakInThisVoice = 0;
	this.Icon = '';
	this.Title = '';
	this.Body = '';
}

function MessageObject (Sender,Recipient,MessageType,Data)
{
	this.IsGlobalMessagingMessage = true;
	this.Sender = Sender;
	this.Recipient = Recipient;
	this.MessageType = MessageType;
	this.Data = Data;
}

function InitialiseGlobalMessagingClient (ClientName,protocol)
{
	var protocol = protocol || 'http';

	GlobalMessagingClient = new GlobalMessagingClientObject ();

	GlobalMessagingClient.Name = ClientName;
	console.log ('Starting GlobalMessaging client: "' + GlobalMessagingClient.Name + '"');

	// localStorage.setItem ('MessageObjectCount',0);

	var iframesrc = protocol + '://localhost/MyWebStuff/GlobalMessaging/GlobalMessagingHost.html';
	$('body').append ('<div id="GlobalMessagingHostiframeDiv" style="display: none"><iframe id="GlobalMessagingHostiframe" src="' + iframesrc + '"</iframe></div>');
	GlobalMessagingClient.Hostiframe = document.getElementById ('GlobalMessagingHostiframe');
	GlobalMessagingClient.Hostiframe.onload = OnGlobalMessagingHostiframeLoad;

	addEventListener ('message',GlobalMessagingEventListener,false);

	setInterval (PostPendingMessages,100);

	console.log ('GlobalMessaging client "' + GlobalMessagingClient.Name + '" started');
	return GlobalMessagingClient;
}

function OnGlobalMessagingHostiframeLoad ()
{
	GlobalMessagingClient.Ready = true;
}

function LogMessageEvent (Message,EventType)
{
	return;

	console.log (EventType + ': Sender="' + Message.Sender + '" Recipient="' + Message.Recipient + '"');
	console.log (Message.Data);
}

function GlobalMessagingEventListener (event)
{
	var Message = event.data;

	if (!isDefined (Message))
		return;

	if (!isDefined (Message.IsGlobalMessagingMessage))
		return;

	if (!isDefined (Message.Sender))
	{
		console.log ('GlobalMessaging client "' + GlobalMessagingClient.Name + '" error: Cannot resolve message - no sender data');
		return;
	}

	if (!isDefined (Message.Recipient))
	{
		console.log ('GlobalMessaging client "' + GlobalMessagingClient.Name + '" error: Cannot resolve message - no recipient data');
		return;
	}

	if (!isDefined (Message.Data))
	{
		console.log ('GlobalMessaging client "' + GlobalMessagingClient.Name + '" error: Cannot resolve message - no message data string');
		return;
	}

	LogMessageEvent (Message,'Message received');
}

function PostMessageObject (Message)
{
	if (GlobalMessagingClient.Ready)
	{
		GlobalMessagingClient.Hostiframe.contentWindow.postMessage (Message,'*');
		LogMessageEvent (Message,'Message sent');
	}
	else
	{
		PendingMessages.push (Message);
		LogMessageEvent (Message,'Message added to pending');
	}
}

function PostMessage (MessageType,MessageData)
{
	var Message = new MessageObject (GlobalMessagingClient.Name,GlobalMessagingHostName,MessageType,MessageData);
	PostMessageObject (Message);
}

function PostMessageToClient (RecipientClientName,MessageType,MessageData)
{
	var Message = new MessageObject (GlobalMessagingClient.Name,RecipientClientName,MessageType,MessageData);
	PostMessageObject (Message);
}

function PostPendingMessages ()
{
	if (!GlobalMessagingClient.Ready)
		return false;

	while (PendingMessages.length)
	{
		var Message = PendingMessages [0];
		LogMessageEvent (Message,'Pending message sent');
		GlobalMessagingClient.Hostiframe.contentWindow.postMessage (Message,'*');
		PendingMessages.splice (0,1);
	}
}

function SetGlobalStorage (pKey,pValue)
{
    PostMessage ('setglobalstorage',{Key: pKey, Value: pValue});
}

function RemoveGlobalStorage (pKey)
{
    PostMessage ('removeglobalstorage',{Key: pKey});
}

function AddToGlobalStorageList (pListKey,pValue)
{
    PostMessage ('addtoglobalstoragelist',{ListKey: pListKey, Value: pValue});
}

function PostLocalStorageMessage (message,key)
{
	var workingKey = key || 'message';

	var messageStr = JSON.stringify (message);

	SetGlobalStorage (workingKey,messageStr);
	RemoveGlobalStorage (workingKey);
}

function sendInterAppMessage (messageOrParams)
{
	if (isNotDefined (messageOrParams))
		return false;

	var message;

	if (messageOrParams instanceof InterAppMessage)
		message = messageOrParams;
	else
	{
		message = new InterAppMessage ();
		copyProperties (messageOrParams,message);
	}

	var workingKey = interAppMessagingLocalStorageKeyStub;
	var messageStr = JSON.stringify (message);

	SetGlobalStorage (workingKey,messageStr);
	RemoveGlobalStorage (workingKey);
}

function sendNotificationMessage (notificationData)
{
	var message = new InterAppMessage ();

	message.targetApp = 'Notifications';
	message.messageType = 'notification';
	message.dataType = 'notification';
	message.data = notificationData;

	sendInterAppMessage (message);
}

function sendPing ()
{
	var message = new InterAppMessage ();

	message.targetApp = '';
	message.messageType = 'ping';
	message.dataType = 'ping';

	sendInterAppMessage (message);
}

function interAppMessageListener (event)
{
	var key = event.originalEvent.key;
	var value = event.originalEvent.newValue;

	if (value == null)
		return;

	if (key != interAppMessagingLocalStorageKeyStub)
		return;

	var message = JSON.parse (value);

	var isMessageIntendedForThisApp = (empty (message.targetApp)) || (AreStringsBasicallyEqual (message.targetApp,interAppMessagingClient.appName));

	if (interAppMessagingClient.ignoreMessagesIntendedForOtherApps && !isMessageIntendedForThisApp)
		return;

	if (interAppMessagingClient.messageCallback)
		interAppMessagingClient.messageCallback (message);
}
