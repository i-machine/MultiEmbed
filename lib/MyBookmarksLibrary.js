// objects

function BookmarkManagerObject ()
{
	this.TagsManager = new TagsManagerObject ();
	this.Bookmarks = [];
	this.NextNewBookmarkIndex = 0;
	this.StorageKey = 'GMBookmarks';
}

function BookmarkObject (pManager)
{
	this.Manager = pManager;
	this.Index = -1;

	this.Name = new NameObject ();
	this.Tags = new TagsObject (this.Manager.TagsManager);

	this.URL = '';
}

// ---------------------------------------------
// objects end o.end o.e oe 
// prototypes begin p.begin p.b pb 
// ---------------------------------------------

BookmarkManagerObject.prototype.Initialise = function ()
{
	this.TagsManager.StorageKey = this.StorageKey + '.Tags';
}

BookmarkManagerObject.prototype.Save = function ()
{
	this.TagsManager.Save ();

	var SaveObject = {};

	SaveObject.NextNewBookmarkIndex = this.NextNewBookmarkIndex;
	SaveObject.Bookmarks = [];

	for (var cBookmark = 0; cBookmark < this.Bookmarks.length; cBookmark ++)
	{
		var Bookmark = this.Bookmarks [cBookmark];

		var SaveBookmark = {};

		SaveBookmark.Index = Bookmark.Index;
		SaveBookmark.Name = NameObjectToJSONObject (Bookmark.Name);
		SaveBookmark.Tags = TagsObjectToJSONObject (Bookmark.Tags);

		SaveBookmark.URL = Bookmark.URL;

		SaveObject.Bookmarks.push (SaveBookmark);
	}

	localStorage.setItem (this.StorageKey + '.Bookmarks',JSON.stringify (SaveObject));
}

BookmarkManagerObject.prototype.Load = function ()
{
	this.Bookmarks = [];

	this.TagsManager.Load ();

	var LoadedStr = localStorage.getItem (this.StorageKey + '.Bookmarks');

	if (NotDefinedOrEmpty (LoadedStr))
		return;

	var LoadedObject = JSON.parse (LoadedStr);

	this.NextNewBookmarkIndex = LoadedObject.NextNewBookmarkIndex;

	for (var cBookmark = 0; cBookmark < LoadedObject.Bookmarks.length; cBookmark ++)
	{
		var LoadedBookmark = LoadedObject.Bookmarks [cBookmark];

		var newBookmark = new BookmarkObject (this);

		newBookmark.Index = LoadedBookmark.Index;
		newBookmark.Name = JSONObjectToNameObject (LoadedBookmark.Name);
		newBookmark.Tags = JSONObjectToTagsObject (LoadedBookmark.Tags,this.TagsManager);

		newBookmark.URL = LoadedBookmark.URL;

		this.Bookmarks.push (newBookmark);
	}

	for (var cBookmark = 0; cBookmark < this.Bookmarks.length; cBookmark ++)
	{
		var Bookmark = this.Bookmarks [cBookmark];

	}
}

BookmarkManagerObject.prototype.AddBookmark = function (pURL)
{
	var newBookmark = new BookmarkObject (this);
	
	newBookmark.URL = pURL;

	newBookmark.Index = this.NextNewBookmarkIndex;
	this.NextNewBookmarkIndex ++;

	this.Bookmarks.push (newBookmark);

	return newBookmark;
}

// ---------------------------------------------
// prototypes end p.end p.e pe 
// functions begin f.begin f.b fb 
// ---------------------------------------------

// ---------------------------------------------
// functions end f.end f.e fe 
// initialisation begin i.begin i.b ib 
// ---------------------------------------------

