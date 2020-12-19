var x2js = new X2JS ();

function NewsFeedManagerObject (Callbacks)
{
	this.TagsManager = new TagsManagerObject ();
	this.Categories = new TagsObject (this.TagsManager);

	this.Sites = [];
	this.Feeds = [];
	this.AllItems = [];
	this.Callbacks = Callbacks || {};
	this.interfaceRefreshNeeded = false;
	this.synonymManager = new SynonymManagerObject ();

	this.Initialise = function ()
	{
		this.InitialiseNewsFeeds ();
		this.InitialiseCategories ();
	}

	this.InitialiseCategories = function ()
	{
		this.Categories.Add ('News,Science,Technology,Financial,Sport,Other');
	}

	this.InitialiseNewsFeeds = function ()
	{
		with (this.AddFeedSite ('Reddit'))
		{
			FeedFormat = 'json';

			AddFeed ('World news','worldnews','world news,news');
			AddFeed ('US news','news','news');
			AddFeed ('Science','science','Science');
			AddFeed ('Technology','technology','Technology');
			AddFeed ('Economy','economy','Economy,Financial');
			AddFeed ('Conspiracy','conspiracy','Conspiracy,Other');
		}

		with (this.AddFeedSite ('Voat'))
		{
			AddFeed ('World news','worldnews','world news,news');
			AddFeed ('US news','news','US news,news');
		}

		with (this.AddFeedSite ('Google news'))
		{
			AddFeed ('World news','world','world news,news','http://news.google.com/news?cf=all&topic=w&hl=en&ned=uk&output=rss');
			AddFeed ('Front','front','world news,news','http://news.google.com/news?cf=all&hl=en&ned=uk&output=rss');
		}

		with (this.AddFeedSite ('Yahoo news'))
		{
			AddFeed ('World news','world','world news,news');
		}

		with (this.AddFeedSite ('Sky news'))
		{
			AddFeed ('World news','world','world news,news');
		}

		with (this.AddFeedSite ('BBC news'))
		{
			AddFeed ('World news','world','world news,news');
			AddFeed ('UK news','uk','UK news,news');
		}

		with (this.AddFeedSite ('RT news'))
		{
			AddFeed ('Front','front','world news,news','https://www.rt.com/rss/');
		}

		with (this.AddFeedSite ('scorespro'))
		{
			AddFeed ('Live scores','live scores','sport,football','http://www.scorespro.com/rss2/live-soccer.xml');
		}
	}

	this.AddFeed = function (FeedSite,SectionDisplayName,SectionCode,Categories,FeedURL)
	{
		var result = new NewsFeedObject (this,FeedSite,SectionDisplayName,SectionCode,Categories,FeedURL);
		this.Feeds.push (result);
		FeedSite.Feeds.push (result);

		if ((!isDefined (FeedURL)) || FeedURL.length == 0)
		{
			switch (FeedSite.Code)
			{
				case 'bbcnews':
					result.FeedURL = 'http://feeds.bbci.co.uk/news/' + result.SectionCode + '/rss.xml';
					break;

				case 'skynews':
					result.FeedURL = 'http://feeds.skynews.com/feeds/rss/' + result.SectionCode + '.xml';
					break;

				case 'reddit':
					result.FeedURL = 'https://www.reddit.com/r/' + SectionCode + '/new.json?sort=new&limit=100';
					break;

				case 'voat':
					result.FeedURL = 'https://voat.co/rss/' + SectionCode;
					break;

				case 'yahoonews':
					result.FeedURL = 'https://uk.news.yahoo.com/rss/' + SectionCode;
					break;
			}
		}

		return result;
	}

	this.initSynonyms = function ()
	{
		with (this.synonymManager)
		{
			AddEntry (['U.S.A','U.S','United States','United States of America','north america','america','american']);
			AddEntry (['Russia','Russian']);
			AddEntry (['China','Chinese']);
			AddEntry (['United Kingdom','Great Britain','u.k','g.b','britain','british']);
			AddEntry (['France','French']);
			AddEntry (['Italy','Italian']);
			AddEntry (['Iran','Iranian']);
			AddEntry (['Iraq','Iraqi']);
			AddEntry (['Libya','Libya']);
			AddEntry (['Donald Trump','trump','djt','potus','president of usa','us president','president trump','president donald trump']);
			AddEntry (['president','prez']);
		}
	}

	this.AddFeedSite = function (DisplayName,Code)
	{
		var result = new NewsFeedSiteObject (this,DisplayName,Code);
		this.Sites.push (result);
		return result;
	}

	this.GetFeedSite = function (DisplayNameOrCode)
	{
		var result = findObjectInArray (this.Sites,'DisplayName',DisplayNameOrCode);
		if (!result)
			result = findObjectInArray (this.Sites,'Code',DisplayNameOrCode);

		return result;
	}

	this.ProcessNewFeedItems = function (Feed)
	{
		Feed.Items = Feed.Items.concat (Feed.NewItems);
		Feed.Manager.AllItems = Feed.Manager.AllItems.concat (Feed.NewItems);

		var tmpNewItems = [].concat (Feed.NewItems);
		tmpNewItems.sort (sortByThePropertiesInThisArray (['-TimePolled']));

		Feed.LastPolledItem = tmpNewItems [0];

		if (isDefined (Feed.Manager.Callbacks.onNewFeedItems))
			Feed.Manager.Callbacks.onNewFeedItems (Feed);
	}

	this.JSONItemToFeedItem = function (JSONItem,Item)
	{
		Item.JSONItem = JSONItem;

		switch (Item.Feed.Site.Code)
		{
			case 'reddit':
				Item.TimeStamp = new Date (parseInt (JSONItem.created_utc) * 1000);
				Item.ID = JSONItem.id;
				Item.Title = JSONItem.title;
				Item.URL = JSONItem.url;
				Item.Domain = JSONItem.domain;
				Item.SourceURL = JSONItem.url;
				Item.CommentsURL = 'https://reddit.com' + JSONItem.permalink;
				Item.CommentCount = JSONItem.num_comments;
				break;

			case 'voat':
				Item.TimeStamp = new Date (JSONItem.updated.__text);
				Item.ID = JSONItem.guid.__text;
				Item.Title = JSONItem.title;
				Item.URL = JSONItem.link;
				break;

			case 'bbcnews':
				Item.TimeStamp = new Date (JSONItem.pubDate);
				Item.ID = JSONItem.guid.__text;
				Item.Title = JSONItem.title;
				Item.URL = JSONItem.guid.__text;
				break;

			case 'skynews':
				Item.TimeStamp = new Date (JSONItem.pubDate);
				Item.ID = JSONItem.guid;
				Item.Title = JSONItem.title;
				Item.URL = JSONItem.link;
				break;

			case 'googlenews':
				Item.TimeStamp = new Date (JSONItem.pubDate);
				Item.ID = JSONItem.guid.__text;
				Item.Title = JSONItem.title;
				Item.URL = JSONItem.link;
				break;

			case 'yahoonews':
				Item.TimeStamp = new Date (JSONItem.pubDate);
				Item.ID = JSONItem.guid.__text;
				Item.Title = JSONItem.title;
				Item.URL = JSONItem.link;
				Item.SourceURL = JSONItem.source._url;
				break;

			case 'rtnews':
				Item.TimeStamp = new Date (JSONItem.pubDate);
				Item.ID = JSONItem.guid;
				Item.Title = JSONItem.title;
				Item.URL = JSONItem.guid; // intentional
				break;

			case 'scorespro':
				Item.TimeStamp = new Date (JSONItem.pubDate);
				Item.ID = JSONItem.description; // intentional
				Item.Title = JSONItem.description;
				Item.URL = JSONItem.link;
				break;
		}

		if (Item.URL && !Item.SourceURL)
			Item.SourceURL = Item.URL;

		if (Item.SourceURL)
			Item.SourceHost = StringToLocation (Item.SourceURL).hostname.replace(/^www\./,'');
	}

	this.ProcessJSONFeed = function (Feed,Data)
	{
		var thisManager = this;

		function ProcessJSONItem (JSONItem)
		{
			var newItem = new NewsFeedItemObject (Feed);
			thisManager.JSONItemToFeedItem (JSONItem,newItem);

			var ExistingItem = findObjectInArray (Feed.Items,'ID',newItem.ID,{UseTokenizedStrings: false}) || findObjectInArray (Feed.NewItems,'ID',newItem.ID,{UseTokenizedStrings: false});
			if (ExistingItem)
			{
				if (newItem.CommentCount != ExistingItem.CommentCount)
				{
					ExistingItem.CommentCount = newItem.CommentCount;
					thisManager.interfaceRefreshNeeded = true;
				}
				newItem = null;
				return;
			}

			Feed.NewItems.push (newItem);
			thisManager.interfaceRefreshNeeded = true;
		}

		Feed.NewItems.length = 0;


		switch (Feed.Site.Code)
		{
			case 'reddit':
				var JSONItemArray = Data.data.children;
				for (var cItem = 0; cItem < JSONItemArray.length; cItem++)
					ProcessJSONItem (JSONItemArray [cItem].data);
				break;

			case 'voat':
			case 'bbcnews':
			case 'skynews':
			case 'googlenews':
			case 'yahoonews':
			case 'rtnews':
			case 'scorespro':
				var JSONItemArray = Data.rss.channel.item;

				if (JSONItemArray)
				{
					for (var cItem = 0; cItem < JSONItemArray.length; cItem++)
						ProcessJSONItem (JSONItemArray [cItem]);
				}

				break;
		}

		if (Feed.NewItems.length)
			this.ProcessNewFeedItems (Feed);
	}

	this.PollFeed = function (Feed)
	{
		var thisManager = this;

		$.ajax({
			type: 'GET',
			dataType: Feed.FeedFormat,
			url: 'http://crossorigin.me/' + Feed.FeedURL,
			context: {},
			success: function(data)
			{
				switch (Feed.FeedFormat)
				{
					case 'xml':
						data = x2js.xml2json (data);
						thisManager.ProcessJSONFeed (Feed,data);
						Feed.HasFeedBeenPolledThisSession = true;
						break;
					case 'jsonp':
						break;
					case 'json':
						thisManager.ProcessJSONFeed (Feed,data);
						Feed.HasFeedBeenPolledThisSession = true;
						break;
				}
			}
		})
		.done(function( data, textStatus, jqXHR ) {
		});

	}

	this.PollAllFeeds = function ()
	{
		this.interfaceRefreshNeeded = false;
		for (var c = 0; c < this.Feeds.length; c++)
		{
			var feed = this.Feeds [c];

			if (feed.EnabledByUser && feed.EnabledByFilters)
				this.PollFeed (this.Feeds [c]);
		}
	}
}

function NewsFeedSiteObject (Manager,DisplayName,Code)
{
	this.Manager = Manager;
	this.DisplayName = DisplayName;
	this.Code = GetTokenizedVersionOf (Code || DisplayName,true,false);
	this.Feeds = [];
	this.FeedFormat = 'xml';

	this.AddFeed = function (SectionDisplayName,SectionCode,Categories,FeedURL)
	{
		return this.Manager.AddFeed (this,SectionDisplayName,SectionCode,Categories,FeedURL);
	}
}

function NewsFeedObject (Manager,FeedSite,SectionDisplayName,SectionCode,Categories,FeedURL)
{
	this.Manager = Manager;
	this.Site = FeedSite;

	this.SectionDisplayName = SectionDisplayName;
	this.SectionCode = GetTokenizedVersionOf (SectionCode || SectionDisplayName,true,false);

	this.Categories = new TagsObject (this.Manager.TagsManager);
	this.Categories.Add (Categories);

	this.FeedURL = FeedURL || '';

	this.Items = [];
	this.NewItems = [];
	this.HasFeedBeenPolledThisSession = false;
	this.FeedFormat = FeedSite.FeedFormat;

	this.EnabledByFilters = true;
	this.EnabledByUser = true;

	this.FullName = function ()
	{
		if (Empty (this.SectionCode))
			return this.Site.DisplayName;
		else
			return this.Site.DisplayName + ' ' + this.SectionDisplayName;
	}
}

function NewsFeedItemObject (Feed)
{
	this.Feed = Feed || null;
	this.TimeStamp = new Date ();
	this.ID = '';
	this.Title = '';
	this.URL = '';
	this.JSONItem = null;
	this.TimePolled = new Date ();
	this.SourceHost = '';
	this.SourceURL = '';
	this.CommentsURL = '';
	this.CommentCount = 0;
	this.TimeThreshold = null;
}
