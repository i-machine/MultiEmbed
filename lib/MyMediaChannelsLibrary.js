var MasterChannelsArray = [];
var UserChannelsArray = [];
var MediaChannelsTagsManager = new TagsManagerObject ();

var ChannelDomainsArray = ['youtube','ustream','livestream','bambuser','filmon','rt','other'];

function InitialisedChannelObject ()
{
	this._index = 0;
	this.Name = '';
	this.ID = '';
	this.StreamerID = '';
	this.StreamerName = '';
	this.Location = '';
	this.Domain = 'other';
	this.Tags = new TagsObject (MediaChannelsTagsManager);
	this.DivID = '';
	this.IsLive = true;
	this.Description = '';
	this.UsersViewingNow = 0;
	this.UsersViewingEver = 0;
	this.HasChannelBeenPolledYet = false;
	this.IncludeInNextPoll = true;
	this.Window = null;
	this.IsUserChannel = false;
	this.Sources = [];
	this.CurrentSourceIndex = 0;

	this.AddSource = function (EmbedCode,Embedsrc,HostPageURL)
	{
		return AddChannelSource (this,EmbedCode,Embedsrc,HostPageURL);
	}
}

function InitialisedChannelSourceObject ()
{
	this.EmbedCode = '';
	this.Embedsrc = '';
	this.HostPageURL = '';
}

function InitialisedUserChannelObject ()
{
	this.Name = '';
	this.EmbedCode = '';
	this.Embedsrc = '';
	this.HostPageURL = '';
	// this.Tags = new TagsObject (MediaChannelsTagsManager);
}

function ChannelObjectReplacer (key,value)
{
	switch (key)
	{
		case 'DivID':
			return undefined;
		case 'Tags':
			return Tags.ToString ();
		default:
			return value;
	}
}

function UserChannelObjectReplacer (key,value)
{
	switch (key)
	{
		case 'Tags':
			return Tags.ToString ();
		default:
			return value;
	}
}

function GetCurrentChannelSource (Channel)
{
	return Channel.Sources [Channel.CurrentSourceIndex];
}

function SelectNextChannelSource (Channel)
{
	Channel.CurrentSourceIndex ++;

	if (Channel.CurrentSourceIndex >= Channel.Sources.length)
		Channel.CurrentSourceIndex = 0;

	return Channel.Sources [Channel.CurrentSourceIndex];
}

function AddChannelSource (Channel,EmbedCode,Embedsrc,HostPageURL)
{
	var result = new InitialisedChannelSourceObject ();
	result.EmbedCode = EmbedCode;
	result.HostPageURL = getOptionalValue (HostPageURL,'');

	if (isDefinedAndNotEmpty (Embedsrc))
		result.Embedsrc = Embedsrc;
	else
	{
	    var tmpParsedArray = EmbedCode.match ('src="(.*?)"');
	    if (tmpParsedArray == null || !tmpParsedArray.length)
	    	tmpParsedArray = EmbedCode.match ("src='(.*?)'");
	    if (tmpParsedArray != null)
			result.Embedsrc = tmpParsedArray [1];
	}

	Channel.Sources.push (result);

	return result;
}

function AddChannel (Name,Tags)
{
	var Channel = findObjectInArray (MasterChannelsArray,'Name',Name);
	if (Channel)
	{
		return Channel;
	}

	Channel = new InitialisedChannelObject ();
	Channel._index = MasterChannelsArray.length;
	Channel.Name = Name;
	MasterChannelsArray.push (Channel);

	Channel.Tags.Add (Tags);

	if (Channel.Name.match (/news/i))
		Channel.Tags.Add ('News');

	if (Channel.Name.match (/movie/i)
		|| Channel.Name.match (/film/i)
		|| Channel.Name.match (/cinema/i)
		)
		Channel.Tags.Add ('Movies');

	return Channel;
}

function AddUserChannel (Name,EmbedCode,HostPageURL,Tags)
{
	var newUserChannel = new InitialisedUserChannelObject ();
	newUserChannel.Name = Name;
	newUserChannel.EmbedCode = EmbedCode;
	newUserChannel.Embedsrc = '';
	newUserChannel.HostPageURL = HostPageURL;
	// newUserChannel.Tags.Add (Tags);

    var tmpParsedArray = EmbedCode.match ('src="(.*?)"');
    if (tmpParsedArray == null || !tmpParsedArray.length)
    	tmpParsedArray = EmbedCode.match ("src='(.*?)'");
    if (tmpParsedArray != null)
		newUserChannel.Embedsrc = tmpParsedArray [1];

	UserChannelsArray.push (newUserChannel);

	var Channel = AddChannel (Name,Tags);
	AddChannelSource (Channel,EmbedCode,'',HostPageURL);
	Channel.IsUserChannel = true;
	Channel.IsLive = true;
}

function LoadUserChannels ()
{
	UserChannelsArray = loadArray ('MyMediaChannels.UserChannelsArray');
}

function SaveUserChannels ()
{
	saveArray (UserChannelsArray,'MyMediaChannels.UserChannelsArray',UserChannelObjectReplacer);
}

function GetChannelDomain (hostname)
{
	result = '';
	switch (hostname.toLowerCase ())
	{
		case 'www.ustream.tv':
			result = 'ustream';
			break;
	}
	return result;
}

function DoesChannelMatchTags (Channel,Tags)
{
	return Channel.Tags.Contains (Tags);
}

function GetChannel (pSearchStr)
{
	var tmparray = GetChannels (pSearchStr);
	if (tmparray && tmparray.length)
		return tmparray [0]
	else
		return null;
}

function GetChannels (pSearchStr)
{
	var MatchingChannels = [];

	for (var cChannel = 0; cChannel < MasterChannelsArray.length; cChannel ++)
	{
		var Channel = MasterChannelsArray [cChannel];
		if (MatchingChannels.contains (Channel))
			continue;

		if (AreStringsBasicallyEqual (pSearchStr,Channel.ID.toString()))
		{
			MatchingChannels.push (Channel);
			continue;
		}

		if (AreStringsBasicallyEqual (pSearchStr,Channel.Name))
		{
			MatchingChannels.push (Channel);
			continue;
		}

		if (AreStringsBasicallyEqual (pSearchStr,Channel.StreamerName))
		{
			MatchingChannels.push (Channel);
			continue;
		}

		if (AreStringsBasicallyEqual (pSearchStr,Channel.Domain))
		{
			MatchingChannels.push (Channel);
			continue;
		}

		var DidAnySourceMatch = false;

		for (var cSource = 0; cSource < Channel.Sources.length; cSource++)
		{
			var Source = Channel.Sources [cSource];

			if (AreStringsBasicallyEqual (pSearchStr,Source.EmbedCode))
			{
				DidAnySourceMatch = true;
				break;
			}
			if (AreStringsBasicallyEqual (pSearchStr,Source.Embedsrc))
			{
				DidAnySourceMatch = true;
				break;
			}
			if (AreStringsBasicallyEqual (pSearchStr,Source.HostPageURL))
			{
				DidAnySourceMatch = true;
				break;
			}
		}

		if (DidAnySourceMatch)
		{
			MatchingChannels.push (Channel);
			continue;
		}
	}

	return MatchingChannels;
}

function FindChannelsMatchingTags (ChannelsArray,Tags)
{
	var MatchingChannels = [];

	for (var cChannel = 0; cChannel < ChannelsArray.length; cChannel ++)
	{
		var Channel = ChannelsArray [cChannel];

		if (DoesChannelMatchTags (Channel,Tags))
			MatchingChannels.push (Channel);
	}

	return MatchingChannels;
}

function ApplyTagsToChannels (pTags,pChannels)
{
	for (var cChannel = 0; cChannel < pChannels.length; cChannel++)
	{
		var Channel = findObjectInArray (MasterChannelsArray,'Name',pChannels [cChannel],{UseTokenizedStrings: true});

		if (Channel)
			Channel.Tags.Add (pTags);
	}
}

function ApplyTagsToMasterChannelsArray ()
{
	var t1 = ['Fox news','CNN USA','CNN International','MSNBC','CBS News','CNBC','ABC News','Sky news','RT news','BBC News'];
	var t2 = ['Bloomberg','Euronews English','Al Jazeera','Al Jazeera America','Press TV','NEWSMAX','France24'];

	ApplyTagsToChannels ('News 1',t1);
	ApplyTagsToChannels ('News 2',t2);
	ApplyTagsToChannels ('News 1 and 2',t1.concat (t2));

	ApplyTagsToChannels ('Europe News,Euro News,European News,Europe Happenings,Euro Happenings,European Happenings,Europe Overview,Euro Overview,European Overview',['Sky News','BBC News','Russia Today','France24','Euronews English','Al Jazeera','Press TV']);
	ApplyTagsToChannels ('Turkey Coup,Turkey Happenings,Turkey Overview',['CNN TURK','NTV Turkey','TRTHaber Canli Yayin','Kanal 7 Canlı Yayın','Sky News','BBC News','Russia Today','France24','Euronews English','Al Jazeera','Press TV']);
	ApplyTagsToChannels ('USA Happenings,USA Overview,US Happenings,US Overview',['CBS Raw Feed','ABC news.go','WSBT Atlanta live-breaking2','Fox 10 Phoenix','No Thiefs Allowed','Exposing Reality','NewsThisSecond','The Watchman','Fox News','CNN USA','ABC News','CBS News']);

	for (var ct3 = 0; ct3 < MasterChannelsArray.length; ct3 ++)
	{
		var tmpChannel = MasterChannelsArray [ct3];
		if (DoesChannelMatchTags (tmpChannel,'News'))
		{
			if (!(DoesChannelMatchTags (tmpChannel,'News 1') || DoesChannelMatchTags (tmpChannel,'News 2')))
				tmpChannel.Tags.Add ('News 3');
		}

	}
}

function GetYouTubeEmbed (LastPartOfYouTubeURL)
{
	return '<iframe src="https://www.youtube.com/embed/' + LastPartOfYouTubeURL + '?autoplay=true&allowfullscreen=1" frameborder="0" allowfullscreen=1 allowfullscreen></iframe>';
}

function PopulateMasterChannelsArray ()
{
	PopulateUStreamChannels ();
	PopulateNewsChannels ();
	PopulateLiveStreamChannels ();
	PopulateFilmOnChannels ();
	PopulateUSTVChannels ();
	PopulateHappeningsChannels ();
	PopulateSportsChannels ();

	// PopulateStreamazoneSources ('http://www.streamazone.com/live-tv/us/');

	PopulateUserChannels ();

	ApplyTagsToMasterChannelsArray ();

//	saveArray (MasterChannelsArray,'MyMediaChannels.MasterChannelsArray',ChannelObjectReplacer);
}

function PopulateUserChannels ()
{
	LoadUserChannels ();

	for (var cUserChannel = 0; cUserChannel < UserChannelsArray.length; cUserChannel++)
	{
		var UserChannel = UserChannelsArray [cUserChannel];

		var Channel = AddChannel (UserChannel.Name,UserChannel.Tags);
		AddChannelSource (Channel,UserChannel.EmbedCode,'',UserChannel.HostPageURL);
		Channel.IsUserChannel = true;
	}
}

function PopulateLiveStreamChannels ()
{
	with (AddChannel ('Global Revolution','Stream aggregate,Aggregate,US,USA,Fergtard,Occutard'))
	{
		AddSource ('<iframe src="http://cdn.livestream.com/embed/globalrevolution?layout=3&autoPlay=false" style="border:0;outline:0" frameborder=0 scrolling=no></iframe>');
	}

	with (AddChannel ('ActivistWorldNewsNow','Stream aggregate,Aggregate,US,USA,Fergtard,Occutard'))
	{
		AddSource ('<iframe src="http://cdn.livestream.com/embed/activistworldnewsnow?layout=3&autoPlay=false" style="border:0;outline:0" frameborder=0 scrolling=no></iframe>');
	}
}

function PopulateFilmOnChannels ()
{
	var RawChannelsArray = loadArray ('MyMediaChannels.Raw.FilmOn');

	for (var c = 0; c < RawChannelsArray.length; c++)
	{
		var RawChannel = RawChannelsArray [c];

		var NewChannel = AddChannel (RawChannel.Name,RawChannel.Tags);
		NewChannel.AddSource ('<iframe src="http://www.filmon.tv/tv/channel/export?channel_id=' + RawChannel.ID + '"></iframe>');
		NewChannel.ID = RawChannel.ID;
		NewChannel.IsLive = true;
		NewChannel.Domain = 'filmon';
	}
}

function AddUStreamChannel (Name,ChannelID)
{
	var Channel = AddChannel (Name,'Ustream,UStreamers');
	Channel.AddSource ('<iframe src="http://www.ustream.tv/embed/' + ChannelID + '?html5ui=1&autoplay=true&volume=30&wmode=direct" scrolling="no" frameborder="0" style="border: 0px none transparent;"></iframe>');
	Channel.Domain = 'ustream';
	Channel.ID = ChannelID;
	Channel.IsLive = false;

	console.log (Name + '(' + ChannelID + ')');

	var DeadStreams = [11660111,19572867,19660521,17193609,19922407];
	if (DeadStreams.indexOf (Channel.ID) > -1)
		Channel.IncludeInNextPoll = false;
	else
		Channel.IncludeInNextPoll = true;

	var NonImportantStreams = ['no-thiefs-allowed','wakamiyasumi5','iwakamiyasumi5','live-iss-stream','kcjj-raw','shadow-of-the-almighty',
								'exploreLakeTahoeHomewoodMountainResort','exploreLakeTahoeWestShoreCafe','hopnews-trial','nasahdtv','nasa-msfc',
								'iss-hdev-payload','robertchristianshow','nitwit-tv','vigil-tv','wearechange','blue22251-s-ps4-live-show',
								'opensea','broadcasthd','freednipro','AlexJonesLive','%D0%93%D1%80%D0%BE%D0%BC%D0%B0%D0%B4%D1%81%D1%8C%D0%BA%D0%B5',
								'ruedalo%21%21%21%21','deeshanger','vichekyiv','pbsnewshour','liberty-patrol'];
	if (NonImportantStreams.indexOf (Channel.Name) > -1 || NonImportantStreams.indexOf (Channel.StreamerName) > -1)
	{
		Channel.Tags.Add ('USN');
	}
	else
	{
		// console.log ('USI: ' + Channel.Name);
		Channel.Tags.Add ('USI');
	}
	return Channel;
}

function PopulateUStreamChannels ()
{
	var RawChannelsArray = loadArray ('MyMediaChannels.Raw.Ustream');

	for (var c = 0; c < RawChannelsArray.length; c++)
	{
		var RawChannel = RawChannelsArray [c];
		var NewChannel = AddUStreamChannel (RawChannel.Name,RawChannel.ID);
	}
}

function PopulateUSTVChannels ()
{
	function AddUSTVChannel (Name,iframeCode,extraTags)
	{
		var Channel = AddChannel (Name,'TV,US TV,USA TV');
		Channel.AddSource (iframeCode);

		Channel.Tags.Add (extraTags);

		return Channel;
	}

	AddUSTVChannel ('ABC','<iframe width="600" height="400" src="http://zerocast.tv/embed.php?a=1&amp;id=&amp;width=600&amp;height=400&amp;autostart=true&amp;stretch=true" stretch="true" scrolling="no" border="0" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen=""></iframe>');
	AddUSTVChannel ('ABC','<iframe class="source_frame" src="http://www.streamazone.com/streams/2/71055" style="display: inline;"></iframe>');

	AddUSTVChannel ('CBS','<iframe src="http://zerocast.tv/embed.php?a=338&amp;id=&amp;width=700&amp;height=480&amp;autostart=true&amp;strech=" width="700" scrolling="no" border="0" frameborder="0" marginwidth="0" marginheight="0" height="480" allowfullscreen=""></iframe>');

	AddUSTVChannel ('NBC','<iframe src="http://zerocast.tv/embed.php?a=1900&amp;id=&amp;width=658&amp;height=430&amp;autostart=true&amp;strech=" width="658" scrolling="no" border="0" frameborder="0" marginwidth="0" marginheight="0" height="430" allowfullscreen=""></iframe>');

	AddUSTVChannel ('HBO','<iframe id="myfr" src="http://tv4embed.com/usa/Hbo-stream1.html" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" width="650" height="600"></iframe>');

	AddUSTVChannel ('AMC','<iframe id="myfr" src="http://tv4embed.com/usa/AMC-stream1.html" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" width="600" height="500"></iframe>');

	AddUSTVChannel ('Comedy Central','<iframe src="http://www.streamlive.to/embedplayer_new.php?width=700&amp;height=480&amp;channel=71610&amp;autoplay=true" frameborder="0" marginheight="0" marginwidth="0" scrolling="no" width="700" height="480"></iframe>');

	AddUSTVChannel ('FX','<iframe src="http://zerocast.tv/embed.php?a=10&amp;id=&amp;width=700&amp;height=480&amp;autostart=true&amp;strech=" width="700" scrolling="no" border="0" frameborder="0" marginwidth="0" marginheight="0" height="480" allowfullscreen=""></iframe>');

	AddUSTVChannel ('Syfy','<iframe src="http://zerocast.tv/embed.php?a=16&amp;id=&amp;width=700&amp;height=480&amp;autostart=true&amp;strech=" width="700" scrolling="no" border="0" frameborder="0" marginwidth="0" marginheight="0" height="480" allowfullscreen=""></iframe>');
	AddUSTVChannel ('Syfy','<iframe src="http://tv4embed.com/usa/syfy-stream1.html" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" width="650" height="600"></iframe>');	AddUSTVChannel ('TNT','<iframe src="http://zerocast.tv/embed.php?a=18&amp;id=&amp;width=700&amp;height=480&amp;autostart=true&amp;strech=" width="700" scrolling="no" border="0" frameborder="0" marginwidth="0" marginheight="0" height="480" allowfullscreen=""></iframe>');

	AddUSTVChannel ('Showtime','<iframe src="http://zerocast.tv/embed.php?a=1903&amp;id=&amp;width=700&amp;height=480&amp;autostart=true&amp;strech=" width="700" scrolling="no" border="0" frameborder="0" marginwidth="0" marginheight="0" height="480" allowfullscreen=""></iframe>');

	AddUSTVChannel ('The CW','<iframe src="http://zerocast.tv/embed.php?a=8&amp;id=&amp;width=700&amp;height=480&amp;autostart=true&amp;strech=" width="700" scrolling="no" border="0" frameborder="0" marginwidth="0" marginheight="0" height="480" allowfullscreen=""></iframe>');

	AddUSTVChannel ('USA Network','<iframe src="http://zerocast.tv/embed.php?a=19&amp;id=&amp;width=700&amp;height=480&amp;autostart=true&amp;strech=" width="700" scrolling="no" border="0" frameborder="0" marginwidth="0" marginheight="0" height="480" allowfullscreen=""></iframe>');

	AddUSTVChannel ('TNT','<iframe class="stream_frame" src="http://www.stream2watch.co/streams/21747/2"></iframe>','Movies');
}

function PopulateNewsChannels ()
{
	with (AddChannel ('Fox News','Live news,News,US,USA'))
	{
		AddSource ('<iframe src="http://vaughnlive.tv/embed/video/newzviewz?viewers=true&amp;watermark=false&amp;autoplay=true" name="vaughn" scrolling="no" frameborder="0" allowfullscreen="" style="wmode:transparent;overflow: hidden;position: absolute; left: 0px; top: 20px; width: 658; height: 430;" seamless="" __idm_id__="274433"></iframe>');
		AddSource ('<iframe src="http://www.stream2watch.cc/streams/36/8584"></iframe>');

		AddSource (GetYouTubeEmbed ('mcvpi0QBBD0'));

		AddSource ('<iframe src="http://www.livenewsbox.com/player/livenewsbox.swf?k1=live&amp;k2=newzviewzx2&amp;t=1428694351?viewers=true&amp;autoplay=true" width="100%" height="400" scrolling="no"></iframe>');
		AddSource ('<iframe id="embed-iframe" src="http://2ndrun.tv/swf/VaughnSoftPlayer.swf?k1=live&amp;k2=newzviewz&amp;t=1428694351?viewers=false&amp;autoplay=true" frameborder="0" scrolling="no"></iframe>');
		AddSource ('<iframe frameborder="0" framespacing="0" src="http://vaughnlive.tv/embed/video/newzviewz?viewers=false&amp;watermark=right&amp;autoplay=true"></iframe>');
		AddSource ('<iframe class="stream_frame" src="http://www.stream2watch.co/streams/23114/4"></iframe>');
	}

	with (AddChannel ('CNN USA','Live news,News,US,USA'))
	{
		AddSource ('<iframe src="http://2ndrun.tv/swf/VaughnSoftPlayer.swf?k1=live&amp;k2=ksr2w7twah5&amp;t=1428694351?viewers=true&amp;autoplay=true&amp;allowfullscreen=true frameborder="0" framespacing="0" width="700" height="420"></iframe>');
		AddSource ('<iframe src="http://2ndrun.tv/swf/VaughnSoftPlayer.swf?k1=live&amp;k2=l3ao5rr39is2ge&amp;t=1428694351?viewers=true&amp;autoplay=true&amp;allowfullscreen=true frameborder=" 0"="" framespacing="0" width="700" height="420"></iframe>');
		AddSource ('<iframe src="http://tv4embed.com/usa/cnn-usa-stream-1.html" name="frame1" scrolling="no" frameborder="no" align="center" height="480px" width="658px"> </iframe>');
		AddSource ('<iframe src="http://2ndrun.tv/swf/VaughnSoftPlayer.swf?k1=live&amp;k2=jr6epsw0w&amp;t=1428694351?viewers=false&amp;autoplay=true&amp;allowfullscreen=true frameborder=" frameborder="0" scrolling="no" "></iframe>');
		AddSource ('<iframe src="http://2ndrun.tv/swf/VaughnSoftPlayer.swf?k1=live&amp;k2=gdsohs5as&amp;t=1428694351?viewers=false&amp;autoplay=true&amp;allowfullscreen=true frameborder=" 0"="" framespacing="0" width="700" height="420"></iframe>');
		AddSource ('<iframe src="http://www.streamazone.com/streams/23/71119" style="display: inline;"></iframe>');
		AddSource ('<iframe src="http://www.streamlive.to/embedplayer_new.php?width=658&amp;height=450&amp;channel=68967&amp;autoplay=true" frameborder="0" marginheight="0" marginwidth="0" scrolling="no" width="658" height="450"></iframe>');
	}

	with (AddChannel ('CNN International','Live news,News,US,USA'))
	{
		AddSource ('<iframe id="embed-iframe" src="http://www.giniko.com/watch.php?id=26" frameborder="0" scrolling="no"></iframe>');
		AddSource ('<iframe src="http://tv4embed.com/Player.php?http://wpc.c1a9.edgecastcdn.net/hls-live/20C1A9/cnn/ls_satlink/b_828.m3u8" width="658" height="430" scrolling="no" frameborder="0" __idm_id__="3461121"></iframe>');
	}

	with (AddChannel ('MSNBC','Live news,News,US,USA'))
	{
		AddSource (GetYouTubeEmbed ('gwy33CByAOo'));
		AddSource ('<iframe src="http://www.livenewsbox.com/player/livenewsbox.swf?k1=live&amp;k2=ks3g6ha82jsdb1o&amp;t=1428694351?viewers=true&amp;autoplay=true"></iframe>');
		AddSource ('<iframe src="http://2ndrun.tv/swf/VaughnSoftPlayer.swf?k1=live&amp;k2=i3ws6ai2q83cn&amp;t=1428694351?viewers=true&amp;autoplay=true" frameborder="0" framespacing="0" width="700" height="420"></iframe>');
		AddSource ('<iframe src="http://2ndrun.tv/swf/VaughnSoftPlayer.swf?k1=live&amp;k2=p4d3h228za3&amp;t=1428694351?viewers=false&amp;autoplay=true&amp;allowfullscreen=true frameborder=" 0"="" framespacing="0" width="700" height="420"></iframe>');
		AddSource ('<iframe src="http://vaughnlive.tv/embed/video/g3s6e92srrz?viewers=false&amp;watermark=left&amp;autoplay=true" width="600" height="430" frameborder="0"></iframe>');
		AddSource ('<iframe src="http://2ndrun.tv/swf/VaughnSoftPlayer.swf?k1=live&amp;k2=he3whstw&amp;t=1428694351?viewers=true&amp;autoplay=true"></iframe>');
		AddSource ('<iframe src="http://www.janjuaplayer.com/embedplayer/msnbc3264/3/600/400"></iframe>');
	}

	with (AddChannel ('CNBC','Live news,News,US,USA'))
	{
		AddSource ('<iframe class="source_frame" src="http://www.streamazone.com/streams/29/71141" style="display: inline;"></iframe>');
	}

	with (AddChannel ('CBS News','Live news,News,US,USA'))
	{
		AddSource ('<iframe width="700" height="400" scrolling="no" frameborder="0" allowtransparency="true" src="http://sawlive.tv/embed/watch/IxOTdjZGRhYzM3ODljYjRlOGY2MTRmYmU_/Y2JzLW5ld3M6OGFhNWVhMjdiYzBmYjA0N2NkM2NlYWRjZjAxZWFkZGI6ZWQ1OTRiOD"></iframe>');
	}

	with (AddChannel ('ABC News','Live news,News,US,USA'))
	{
		AddSource ("<iframe src='http://abcnews.go.com/video/embed?id=20969244&autoPlay=true&mute=false' width='640' height='360' scrolling='no' style='border:none;'></iframe>");
		AddSource ('<iframe class="stream_frame" src="http://www.stream2watch.co/streams/75617"></iframe>');
	}

	with (AddChannel ('Sky News','Live news,News,UK,Europe'))
	{
		AddSource (GetYouTubeEmbed ('y60wDzZt8yg'));
	}

	with (AddChannel ('BBC News','Live news,News,UK,Europe'))
	{
	}

	with (AddChannel ('Russia Today','Live news,News,Russia,Europe'))
	{
	}

	with (AddChannel ('Fox 2 news','Live news,News,US,USA,KTVI,KTVI News,KTVI St. Louis,St. Louis'))
	{
		AddSource ('<iframe src="http://new.livestream.com/accounts/2075940/events/1701970/player?width=560&height=315&autoPlay=true&mute=false" width="560" height="315" frameborder="0" scrolling="no"> </iframe>');
	}

	with (AddChannel ('Fox 5 news','Live news,News,US,USA'))
	{
		AddSource ('<iframe src="http://new.livestream.com/accounts/2363281/events/1763520/player?width=600&height=400&autoPlay=true&mute=false" width="600" height="400" frameborder="0" scrolling="no"> </iframe>');
	}

	with (AddChannel ('Fox 10 Phoenix','Live news,News,US,USA,Happenings'))
	{
		AddSource (GetYouTubeEmbed ('wRYpF26La14'));
	}

	with (AddChannel ('France24','Live news,News,France,Europe'))
	{
		AddSource (GetYouTubeEmbed ('gq11un3xqsA'));
	}

	with (AddChannel ('Euronews English','Live news,News,Europe'))
	{
		AddSource (GetYouTubeEmbed ('JuIIVkAF-1s'));
	}

	with (AddChannel ('Bloomberg','Live news,News,Europe'))
	{
		AddSource (GetYouTubeEmbed ('AdRlbEAc1fY'));
	}

	with (AddChannel ('Al Jazeera','Live news,News,Europe'))
	{
		AddSource (GetYouTubeEmbed ('HoclZ6s1enA'));
	}

	with (AddChannel ('Newsmax','Live news,News'))
	{
		AddSource (GetYouTubeEmbed ('UYKNKzT77Q4'));
	}

	with (AddChannel ('i24News','Live news,News'))
	{
		AddSource (GetYouTubeEmbed ('Msgo-R3zZuM'));
	}

	with (AddChannel ('CNN TURK','Live news,News,Turkey'))
	{
		AddSource (GetYouTubeEmbed ('iNvZZymiLNU'));
	}

	with (AddChannel ('NTV Turkey','Live news,News,Turkey'))
	{
		AddSource (GetYouTubeEmbed ('oruk-T3_xSw'));
	}

	with (AddChannel ('Kanal 7 Canlı Yayın','Live news,News,Turkey'))
	{
		AddSource (GetYouTubeEmbed ('L1wVGU7vMfo'));
	}

	with (AddChannel ('TRTHaber Canli Yayin','Live news,News,Turkey'))
	{
		AddSource (GetYouTubeEmbed ('PZNQw440yA4'));
	}

	with (AddChannel ('Habertürk TV Canlı Yayın','Live news,News,Turkey'))
	{
		AddSource (GetYouTubeEmbed ('SbmktGjjIcI'));
	}

	with (AddChannel ('DHA Turkey','Live news,News,Turkey'))
	{
		AddSource ("<iframe src='http://www.dha.com.tr/dhayayin/dhafeed.asp' width='645' height='500' scrolling='no' readonly></iframe>");
	}

}

function PopulateHappeningsChannels ()
{
	with (AddChannel ('CBS Raw Feed','Happenings'))
	{
		AddSource ('<iframe src="http://takemelive.com/external/cbsraw" frameborder="0" allowfullscreen></iframe>');
	}

	with (AddChannel ('ABC news.go','Happenings'))
	{
		AddSource ("<iframe src='http://abcnews.go.com/video/embed?id=14476486' width='640' height='360' scrolling='no' style='border:none;'></iframe>");
	}

	with (AddChannel ('WSBT Atlanta live-breaking','Happenings'))
	{
		AddSource ('<iframe scrolling="no" frameborder="0" allowfullscreen webkitallowfullscreen mozallowfullscreen src="http://up.anv.bz/latest/anvload.html?key=eyJ1IjoiaHR0cDovL2NtZ2hsc2xpdmUtaS5ha2FtYWloZC5uZXQvaGxzL2xpdmUvMjI0NzE2L1dTQlRWX0JSRUFLSU5HMS9tYXN0ZXIubTN1OCIsInBsdWdpbnMiOnsiZGZwIjp7ImNsaWVudFNpZGUiOnsiYWRUYWdVcmwiOiJodHRwczovL3B1YmFkcy5nLmRvdWJsZWNsaWNrLm5ldC9nYW1wYWQvYWRzP3N6PTQwMHgzMDAmaXU9LzEyNTIzMjkzL0F0bGFudGFfVFYvd3NidHZfd2ViX2RlZmF1bHQvcHJlX3JvbGwmaW1wbD1zJmdkZnBfcmVxPTEmZW52PXZwJm91dHB1dD14bWxfdmFzdDMmdW52aWV3ZWRfcG9zaXRpb25fc3RhcnQ9MSZ1cmw9W3JlZmVycmVyX3VybF0mZGVzY3JpcHRpb25fdXJsPVtkZXNjcmlwdGlvbl91cmxdJmNvcnJlbGF0b3I9W3RpbWVzdGFtcF0ifSwiY29tc2NvcmUiOnsiY2xpZW50SWQiOjYwMzU5NDR9fSwiaGVhcnRiZWF0QmV0YSI6eyJtYXJrZXRpbmdDbG91ZElkIjoiMTQ2MjM0Qjg1Mjc4MzVFMTBBNDkwRDQ0QEFkb2JlT3JnIiwiY3VzdG9tVHJhY2tpbmdTZXJ2ZXIiOiJjb3huZXQuMTEyLjJvNy5uZXQiLCJ0cmFja2luZ1NlcnZlciI6ImNveG5ldC5oYi5vbXRyZGMubmV0Iiwiam9iSWQiOiJqMiIsImFjY291bnQiOiJjb3h3c2J0dixjb3hnbG9iYWwiLCJwdWJsaXNoZXJJZCI6ImNveG5ldCIsInZlcnNpb24iOiIxLjUifX19"  width ="640" height="360"></iframe>');
	}

	with (AddChannel ('WSBT Atlanta live-breaking2','Happenings'))
	{
		AddSource ('<iframe scrolling="no" frameborder="0" allowfullscreen webkitallowfullscreen mozallowfullscreen src="http://up.anv.bz/latest/anvload.html?key=eyJ1IjoiaHR0cDovL2NtZ2hsc2xpdmUtaS5ha2FtYWloZC5uZXQvaGxzL2xpdmUvMjI0NzE2L1dTQlRWX0JSRUFLSU5HMi9tYXN0ZXIubTN1OCIsInBsdWdpbnMiOnsiZGZwIjp7ImNsaWVudFNpZGUiOnsiYWRUYWdVcmwiOiJodHRwczovL3B1YmFkcy5nLmRvdWJsZWNsaWNrLm5ldC9nYW1wYWQvYWRzP3N6PTQwMHgzMDAmaXU9LzEyNTIzMjkzL0F0bGFudGFfVFYvd3NidHZfd2ViX2RlZmF1bHQvcHJlX3JvbGwmaW1wbD1zJmdkZnBfcmVxPTEmZW52PXZwJm91dHB1dD14bWxfdmFzdDMmdW52aWV3ZWRfcG9zaXRpb25fc3RhcnQ9MSZ1cmw9W3JlZmVycmVyX3VybF0mZGVzY3JpcHRpb25fdXJsPVtkZXNjcmlwdGlvbl91cmxdJmNvcnJlbGF0b3I9W3RpbWVzdGFtcF0ifSwiY29tc2NvcmUiOnsiY2xpZW50SWQiOjYwMzU5NDR9fSwiaGVhcnRiZWF0QmV0YSI6eyJtYXJrZXRpbmdDbG91ZElkIjoiMTQ2MjM0Qjg1Mjc4MzVFMTBBNDkwRDQ0QEFkb2JlT3JnIiwiY3VzdG9tVHJhY2tpbmdTZXJ2ZXIiOiJjb3huZXQuMTEyLjJvNy5uZXQiLCJ0cmFja2luZ1NlcnZlciI6ImNveG5ldC5oYi5vbXRyZGMubmV0Iiwiam9iSWQiOiJqMiIsImFjY291bnQiOiJjb3h3c2J0dixjb3hnbG9iYWwiLCJwdWJsaXNoZXJJZCI6ImNveG5ldCIsInZlcnNpb24iOiIxLjUifX19"  width ="640" height="360"></iframe>');
	}

	with (AddChannel ('No Thiefs Allowed','Happenings'))
	{
		AddSource ('<iframe src="https://www.youtube.com/embed/pXbuP19AWDM?autoplay=true" frameborder="0" allowfullscreen></iframe>');
	}

	with (AddChannel ('Exposing Reality','Happenings'))
	{
		AddSource ('<iframe src="https://www.youtube.com/embed/aLKQDbFIYfg?autoplay=true" frameborder="0" allowfullscreen></iframe>');
	}

	with (AddChannel ('NewsThisSecond','Happenings'))
	{
		AddSource ('<iframe src="https://www.youtube.com/embed/Fw1X2NVHj0I?autoplay=true" frameborder="0" allowfullscreen></iframe>');
	}

	with (AddChannel ("Gentleman''s on",'Happenings'))
	{
		AddSource ('<iframe src="https://www.youtube.com/embed/U2e8273S03E?autoplay=true" frameborder="0" allowfullscreen></iframe>');
	}

	with (AddChannel ('James Feeney','Happenings'))
	{
		AddSource ('<iframe src="https://www.youtube.com/embed/yI_ty3Z5JTc?autoplay=true" frameborder="0" allowfullscreen></iframe>');
	}

	with (AddChannel ('The Watchman','Happenings'))
	{
		AddSource ('<iframe src="https://www.youtube.com/embed/_lAYQLD-ZuY?autoplay=true" frameborder="0" allowfullscreen></iframe>');
	}

	with (AddChannel ('RNC Convention','Happenings'))
	{
		AddSource ('<iframe src="https://www.youtube.com/embed/r_lpyG-ddec?autoplay=true" frameborder="0" allowfullscreen></iframe>');
	}

}

function PopulateSportsChannels ()
{
	with (AddChannel ('Sky sports news','Sports, UK TV'))
	{
		AddSource ('<iframe src="http://www.stream2watch.co/streams/31822/1"></iframe>');
	}

	with (AddChannel ('Sky sports 1','Sports, UK TV'))
	{
		AddSource ('<iframe src="http://www.stream2watch.co/streams/19294/3"></iframe>');
	}

	with (AddChannel ('Sky sports 2','Sports, UK TV'))
	{
		AddSource ('<iframe src="http://www.stream2watch.co/streams/25628/3"></iframe>');
	}

	with (AddChannel ('Sky sports F1','Sports, UK TV'))
	{
		AddSource ('<iframe src="http://www.stream2watch.co/streams/43954/3"></iframe>');
	}

	with (AddChannel ('ESPN','Sports, TV'))
	{
		AddSource ('<iframe src="http://tv4embed.com/usa/espn-usa-stream2.html"></iframe>');
	}

	with (AddChannel ('ESPN 2','Sports, TV'))
	{
		AddSource ('<iframe src="http://tv4embed.com/usa/espn2-stream1.html"></iframe>');
	}
}

function OnLoadRootiframe (e)
{
	console.log (e);
}

function PopulateStreamazoneSources (Root)
{
	var Rootiframe = $('<iframe id="root" src="' + Root + '" onload="OnLoadRootiframe (this);"></iframe>');
	$('body').append (Rootiframe);
}
