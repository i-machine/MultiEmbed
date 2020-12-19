function SoundManager ()
{
    this.soundCollections = [];
}

function SoundCollection ()
{
    this.name = null;
    this.type = 'numbered';
    this.sounds = [];
}

SoundManager.prototype.initialise = function ()
{
    this.initialiseSounds ();
}

SoundManager.prototype.initialiseSounds = function ()
{
    this.initialiseKeyboardSounds ();
}

SoundManager.prototype.initialiseKeyboardSounds = function ()
{
    this.addSoundCollection ('buckling spring',{type: 'numbered', startIndex: 1, endIndex: 20, stub: '/Libraries/3rdParty/keyboardsounds/buckling spring/%d.wav'});
}

SoundManager.prototype.addSoundCollection = function (name,userParams)
{
    var collection = new SoundCollection;

    collection.name = new NameObject (name);

    copyProperties (userParams,collection);

    if (collection.type == 'numbered')
        collection.sounds = produceNumberedArray (collection.startIndex,collection.endIndex,collection.stub);

    collection.arrayRandomizer = new ArrayRandomizer (collection.sounds);

    this.soundCollections.push (collection);

    return collection;
}

SoundManager.prototype.getSoundCollection = function (name)
{
    var result = findObjectInArray (this.soundCollections,'name',name);

    return result;
}

SoundManager.prototype.getRandomSound = function (soundCollection)
{
    return soundCollection.arrayRandomizer.getRandomElement ();
}
