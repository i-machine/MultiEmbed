function Terminal (parentDivSelector,jqTerminalOptions)
{
    this.parentDivSelector = parentDivSelector;
    this.jqTerminalOptions = {greetings: 'Command terminal', prompt: '> ', scrollOnEcho: true};

    if (jqTerminalOptions)
        copyProperties (jqTerminalOptions,this.jqTerminalOptions);

    this.jqTerminal = null;
    this.soundManager = null;
    this.keyboardSounds = null;
    this.keyboardSoundsAudio = null;
}

Terminal.prototype.initialise = function ()
{
    this.initialiseSound ();
    this.initialisejQueryTerminal ();
    this.initialiseEventHandlers ();
}

Terminal.prototype.initialisejQueryTerminal = function ()
{
    this.jqTerminal = $(this.parentDivSelector).terminal (this.handleCommand,this.jqTerminalOptions);

    console.log (this.jqTerminal);
}

Terminal.prototype.initialiseSound = function ()
{
    this.soundManager = new SoundManager ();

    this.soundManager.initialise ();

    this.keyboardSounds = this.soundManager.getSoundCollection ('buckling spring');
    this.keyboardSoundsAudio = new Audio ();
}

Terminal.prototype.initialiseEventHandlers = function ()
{
    $('body').on ('keydown',this.handlekeydown.bind (this));
}

Terminal.prototype.handlekeydown = function (e)
{
    var sfn = this.soundManager.getRandomSound (this.keyboardSounds);

    this.keyboardSoundsAudio.src = sfn;

    this.keyboardSoundsAudio.play ();
}

Terminal.prototype.handleCommand = function (command)
{
    if (command !== '')
    {
        try
        {
            var result = window.eval (command);
            if (result !== undefined)
            {
                var resultStr;

                if (isArray (result) || typeof result === 'object')
                    resultStr = JSON.stringify (result);
                else
                    resultStr = new String (result);

                this.echo (resultStr);
                this.echo (' ');
            }
        }
        catch (e)
        {
            this.error (new String (e));
            this.echo (' ');
        }
    }
    else
    {
    }
}
