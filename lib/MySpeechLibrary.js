var testingMySpeechLibrary = false;
var IsSpeechSynthesisReady = false;
var Hasonvoiceschangedbeenfired = false;

function speak (textOrObject,voice)
{
    return Speak (textOrObject,voice);
}

function Speak (textOrObject,voice)
{
	var speakObject = {
		text: '',
		voice: 0,
		pitch: 1,
		rate: 0.8,
		volume: 0.75,
		callback: null,
	};

	if (typeof textOrObject == 'string')
	{
		speakObject.text = textOrObject;
		speakObject.voice = voice || 0;
	}

	if (textOrObject instanceof Object)
		copyCommonProperties (textOrObject,speakObject);

	if (testingMySpeechLibrary)
        console.log ('Speak: "' + speakObject.text + '"');

	var ssu = new SpeechSynthesisUtterance (speakObject.text);

	if (Hasonvoiceschangedbeenfired)
		ssu.voice = speechSynthesisVoices [speakObject.voice];

	copyProperties (speakObject,ssu,['pitch','rate','volume']);

	var version = 1;

	switch (version)
	{
		case 1: // truncate text at 300 characters

            ssu.text = ssu.text.substring (0,300);

			ssu.onboundary = function (event)
			{
                if (testingMySpeechLibrary)
			     	console.log (event);
			};

			// window.speechSynthesis.cancel ();
			window.speechSynthesis.speak (ssu);

		    if (speakObject.callback)
		    	speakObject.callback (speakObject);

			break;

		case 2: // split text up into chunks and speak them all
			speechUtteranceChunker (ssu,null,speakObject.callback);
			break;
	}
}

function StopSpeaking ()
{
    window.speechSynthesis.cancel ();
}

/**
 * Chunkify
 * Google Chrome Speech Synthesis Chunking Pattern
 * Fixes inconsistencies with speaking long texts in speechUtterance objects
 * Licensed under the MIT License
 *
 * Peter Woolley and Brett Zamir
 * Modified by Haaris for bug fixes
 */

var speechUtteranceChunker = function (utt, settings, callback) {
    settings = settings || {};
    var newUtt;
    var txt = (settings && settings.offset !== undefined ? utt.text.substring(settings.offset) : utt.text);

    if (1 == 0)
//!!    if (utt.voice && utt.voice.voiceURI === 'native')
    { // Not part of the spec
        newUtt = utt;
        newUtt.text = txt;
        newUtt.addEventListener('end', function () {
            if (speechUtteranceChunker.cancel) {
                speechUtteranceChunker.cancel = false;
            }
            if (callback) {
                callback();
            }
        });
    }
    else {
        var chunkLength = (settings && settings.chunkLength) || 250;
        var pattRegex = new RegExp('^[\\s\\S]{' + Math.floor(chunkLength / 2) + ',' + chunkLength + '}[.!?,]{1}|^[\\s\\S]{1,' + chunkLength + '}$|^[\\s\\S]{1,' + chunkLength + '} ');
        var chunkArr = txt.match(pattRegex);

        if (chunkArr == null || chunkArr[0] === undefined || chunkArr[0].length <= 2) {
            //call once all text has been spoken...
            if (callback) {
                callback();
            }
            return;
        }
        var chunk = chunkArr[0];
        newUtt = new SpeechSynthesisUtterance(chunk);

        var x;
        for (x in utt) {
            if (utt.hasOwnProperty(x) && x !== 'text') {
                newUtt[x] = utt[x];
            }
        }

        copyProperties (utt,newUtt,['voice','pitch','rate','volume']);

        newUtt.addEventListener('end', function () {
            if (speechUtteranceChunker.cancel) {
                speechUtteranceChunker.cancel = false;
                return;
            }
            settings.offset = settings.offset || 0;
            settings.offset += chunk.length;
            speechUtteranceChunker(utt, settings, callback);
        });
    }

    if (settings.modifier) {
        settings.modifier(newUtt);
    }
    if (testingMySpeechLibrary)
        console.log(newUtt); //IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.

    //placing the speak invocation inside a callback fixes ordering and onend issues.
    setTimeout(function () {
        speechSynthesis.speak(newUtt);
    }, 0);
};

function GetVoices ()
{
	speechSynthesisVoices = window.speechSynthesis.getVoices ();

	// speechSynthesisVoices.forEach (function (voice)
	// {
 //  		console.log (voice.name, voice.default ? '(default)' :'');
	// });
}

window.speechSynthesis.onvoiceschanged = function () {
	if (Hasonvoiceschangedbeenfired)
		return;
	Hasonvoiceschangedbeenfired = true;
	GetVoices ();
	IsSpeechSynthesisReady = true;
};
