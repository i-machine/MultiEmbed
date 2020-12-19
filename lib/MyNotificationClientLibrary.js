function createGMCSNotificationClient (userParams)
{
    var gmcsNotificationClient = new GMCSNotificationClient ();

    gmcsNotificationClient.initialise (userParams);

    return gmcsNotificationClient;
}

function GMCSNotificationClient ()
{
    this.gmcsClient = null;
}

function GMCSNotificationMessage ()
{
    var td = new Date ();
    this.TimeStamp = td.toLocaleString ();
    this.HostName = '';
    this.HostURL = location.href;
    this.HostIcon = location.protocol + '//' + location.hostname + '/favicon.ico';
    this.SectionName = '';
    this.Title = '';
    this.SourceName = '';
    this.URL = '';
    this.SourceURL = '';
}

GMCSNotificationClient.prototype.initialise = function (userParams)
{
    this.gmcsClient = initialiseGMCSClient (userParams);
}

GMCSNotificationClient.prototype.createNotificationMessage = function (userParams)
{
    var notificationMessage = new GMCSNotificationMessage ();

    if (isDefined (userParams))
        copyCommonProperties (userParams,notificationMessage);

    return notificationMessage;
}

GMCSNotificationClient.prototype.postNotificationMessage = function (notificationMessage)
{
    var gmcsMessage = this.gmcsClient.createGMCSMessage (notificationMessage);

    gmcsMessage.messageType = 'notification';

//    this.gmcsClient.broadcastMessage (gmcsMessage);
    this.gmcsClient.sendMessageToClient ('Notifications',gmcsMessage)
}
