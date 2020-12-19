var PreferencesSectionsArray = [];
var PreferencesArray = [];
var PreferencesDiv = null;
var PreferencesTitleDiv = null;
var PreferencesAsStringsDiv = null;
var PreferencesAsStringsEdit = null;

var RootPreferencesSection = null;
var PreferencesDivRootSection = null;

var PreferenceTypeOnOff = 1;
var PreferenceTypeValue = 2;
var PreferenceTypeOnOffPlusValue = 3;

var LocalStoragePreferencesPrefix = '';
var HaveAnyPreferencesBeenEditedSincePreferencesDivOpened = false;
var HaveAnyPreferencesBeenEditedSincePreferencesAsTextDivRefreshed = false;

var psLocalStorage = 0;
var psStrings = 1;

function InitialisedPreferencesSection (Name)
{
    this.Name = Name;
    this.FullName = this.Name;
    this.ParentSection = null;
    this.OverrideEnabled = true;
    this.DisplayAsRoot = false;
    this.IsTemplate = false;
    this.Sections = [];
    this.Preferences = [];
    this.SectionsAndPreferences = [];
    this.ShowPreferencesAsInline = false;

    this.Collapsed = false;
    this.ShowTitleInPreferencesDiv = true;
    this.ShowChildrenInPreferencesDiv = true;
    this.SectionDiv = null;
    this.EnabledCheckBox = null;
    this.ShowHideLink = null;
    this.ResetLink = null;
    this.SectionPreferencesDiv = null;
    this.DefaultPreferenceValueEditElementLeft = 0;

    this.Enabled = function () {
        return (this.CanBeEnabled () && this.OverrideEnabled);
    };

    this.CanBeEnabled = function () {
        if (this.ParentSection != null)
        {
            if (this.ParentSection.OverrideEnabled == false)
                return false;
            else
                return this.ParentSection.CanBeEnabled ();
        }
        else
            return true;
    };

    this.CalculateFullName = function () {
        var ExistingFullName = this.FullName;
        if (this.ParentSection)
            this.FullName = this.ParentSection.CalculateFullName () + '.' + this.Name;
        else
            this.FullName = this.Name;
        if (this.FullName != ExistingFullName)
            {
            for (var c = 0; c < this.Sections.length; c ++)
                this.Sections [c].CalculateFullName ();
            for (var c = 0; c < this.Preferences.length; c ++)
                this.Preferences [c].CalculateFullName ();
        }
        return this.FullName;
    };

    this.AddSection = function (Name,Options)
    {
        if (!isDefined (Options))
            Options = {};

        Options.ParentSection = this;
        return AddPreferencesSection (Name,Options);
    };
    
    this.GetSection = function (Name)
        {
        var result = findObjectInArray (this.Sections,'Name',Name);
        return result;
    };
    
    this.AddPreference = function (Name,PreferenceType,Enabled,Options)
    {
        if (!isDefined (Options))
            Options = {};

//        console.log ('Adding preference "' + Name + '" to section "' + this.FullName + '"');
        var newPreference = new InitialisedPreference (Name,PreferenceType,Enabled,Options);
        newPreference.ParentSection = this;
        this.Preferences.push (newPreference);
        this.SectionsAndPreferences.push (newPreference);
        PreferencesArray.push (newPreference);
        newPreference.CalculateFullName ();
        return newPreference;
    };
    
    this.GetPreference = function (Name)
    {
        return findObjectInArray (this.Preferences,'Name',Name);
    };
}

function AddPreferencesSection (Name,Options)
{
    if (!isDefined (Options))
        Options = {};

    var newSection = new InitialisedPreferencesSection (Name);

    if (Options.ParentSection)
        {
        if (typeof (Options.ParentSection) == 'string')
            newSection.ParentSection = GetPreferencesSection (Options.ParentSection);
        else
            newSection.ParentSection = Options.ParentSection;
    }
    else
        {
        if (getOptionalValue (Options.AddToRoot,false))
            newSection.ParentSection = null;
        else
            newSection.ParentSection = RootPreferencesSection;
    }
    newSection.OverrideEnabled = getOptionalValue (Options.Enabled,true);
    newSection.IsTemplate = getOptionalValue (Options.IsTemplate,false);
    newSection.ShowTitleInPreferencesDiv = getOptionalValue (Options.ShowTitleInPreferencesDiv,true);
    newSection.ShowChildrenInPreferencesDiv = getOptionalValue (Options.ShowChildrenInPreferencesDiv,true);
    newSection.ShowPreferencesAsInline = getOptionalValue (Options.ShowPreferencesAsInline,false);
    newSection.DefaultPreferenceValueEditElementLeft = getOptionalValue (Options.DefaultPreferenceValueEditElementLeft,0);

    if (newSection.ParentSection)
        var tmpDisplayAsRoot = (newSection.ParentSection == RootPreferencesSection);
    else
        var tmpDisplayAsRoot = true;
    newSection.DisplayAsRoot = getOptionalValue (Options.DisplayAsRoot,tmpDisplayAsRoot);

    newSection.CalculateFullName ();
    
    // check to see if section already exists
    if (GetPreferencesSection (newSection.FullName) != null)
        {
        console.log ('AddPreferencesSection error: Section "' + newSection.FullName + '" already exists.');
        return null;
    }
//    console.log ('Adding Section "' + newSection.FullName + '"');

    if (Options.AsCloneOf)
    {
        if (typeof (Options.AsCloneOf) == 'string')
            var SectionToClone = GetPreferencesSection (Options.AsCloneOf);
        else
            var SectionToClone = Options.AsCloneOf;

//        console.log ('Cloning section "' + Options.AsCloneOf.FullName + '"');
        for (var cSOP = 0; cSOP < SectionToClone.SectionsAndPreferences.length; cSOP ++)
        {
            var tmpSectionOrPreference = SectionToClone.SectionsAndPreferences [cSOP];

            if (SectionToClone.Sections.indexOf (tmpSectionOrPreference) != -1)
            {
                var tmpSection = tmpSectionOrPreference;
//                console.log ('Cloning subsection "' + tmpSection.FullName + '"');
                newSection.AddSection (tmpSection.Name,{AsCloneOf: tmpSection, Enabled: tmpSection.OverrideEnabled, DisplayAsRoot: tmpSection.DisplayAsRoot, IsTemplate: tmpSection.IsTemplate, ShowTitleInPreferencesDiv: tmpSection.ShowTitleInPreferencesDiv, ShowChildrenInPreferencesDiv: tmpSection.ShowChildrenInPreferencesDiv, ShowPreferencesAsInline: tmpSection.ShowPreferencesAsInline, DefaultPreferenceValueEditElementLeft: tmpSection.DefaultPreferenceValueEditElementLeft});
            }
            else
            {
                var tmpPreference = tmpSectionOrPreference;
//                console.log ('Cloning preference "' + SectionToClone.FullName + '.' + tmpPreference.Name + '"');
                newSection.AddPreference (tmpPreference.Name,tmpPreference.PreferenceType,tmpPreference.OverrideEnabled,{DefaultValue: tmpPreference.DefaultValue, Value: tmpPreference.Value, ValueType: tmpPreference.ValueType, SelectValueFrom: tmpPreference.SelectValueFrom, ValueEditElementType: tmpPreference.ValueEditElementType, ShowValueEditElementAsInline: tmpPreference.ShowValueEditElementAsInline, ValueEditElementWidth: tmpPreference.ValueEditElementWidth, ValueEditElementLeft: tmpPreference.ValueEditElementLeft, RequiresThesePreferencesToBeEnabled: tmpPreference.RequiresThesePreferencesToBeEnabled, RequiresTheseSectionsToBeEnabled: tmpPreference.RequiresTheseSectionsToBeEnabled});
            }
        }
    }
    
    // now incorporate section into system by adding it to relevant arrays
    PreferencesSectionsArray.push (newSection);
    if (newSection.ParentSection)
    {
        newSection.ParentSection.Sections.push (newSection);
        newSection.ParentSection.SectionsAndPreferences.push (newSection);
    }
    
    return newSection;
}

function AddPreferencesSectionTemplate (Name,Options)
{
    if (!isDefined (Options))
        Options = {};

//    console.log ('Adding Section template "' + Name + '"');
    Options.IsTemplate = true;
    Options.ShowTitleInPreferencesDiv = false;
    Options.ShowChildrenInPreferencesDiv = false;
    return AddPreferencesSection (Name,Options);
}

function GetPreferencesSection (FullName)
{
    var result = findObjectInArray (PreferencesSectionsArray,'FullName',FullName);
    if (result == null && RootPreferencesSection != null)
        result = findObjectInArray (PreferencesSectionsArray,'FullName',RootPreferencesSection.FullName + '.' + FullName);
    return result;
}

function IsPreferencesSectionEnabled (SectionName)
{
    var tmpSection = GetPreferencesSection (SectionName);
    if (!tmpSection)
        return false;
    return tmpSection.Enabled ();
}

function InitialisedPreference (Name,PreferenceType,Enabled,Options)
{
    if (!isDefined (Options))
        Options = {};

    this.Name = Name;
    this.FullName = Name;
    this.PreferenceType = PreferenceType;
    this.OverrideEnabled = Enabled;
    this.ParentSection = null;
    this.DefaultValue = getOptionalValue (Options.DefaultValue,'');
    this.Value = getOptionalValue (Options.Value,this.DefaultValue);
    this.ValueType = getOptionalValue (Options.ValueType,'string');
    this.SelectValueFrom = getOptionalValue (Options.SelectValueFrom,'');
    if (Trim (this.SelectValueFrom) != '')
        this.SelectValueFromArray = this.SelectValueFrom.split ('|');
    else
        this.SelectValueFromArray = [];
    this.Notes = getOptionalValue (Options.Notes,'');
    this.RequiresThesePreferencesToBeEnabled = getOptionalValue (Options.RequiresThesePreferencesToBeEnabled,'');
    this.RequiresTheseSectionsToBeEnabled = getOptionalValue (Options.RequiresTheseSectionsToBeEnabled,'');

    this.PreferenceDiv = null;
    this.PreferenceNameDiv = null;
    this.EnabledCheckBox = null;
    this.ValueEditElementType = getOptionalValue (Options.ValueEditElementType,'text');
    if (this.SelectValueFromArray.length && this.ValueEditElementType == 'text')
        this.ValueEditElementType = 'select-one';
    this.ValueEditElement = null;
    this.ShowValueEditElementAsInline = getOptionalValue (Options.ShowValueEditElementAsInline,true);
    this.ValueEditElementWidth = getOptionalValue (Options.ValueEditElementWidth,'Medium');
    this.ValueEditElementLeft = getOptionalValue (Options.ValueEditElementLeft,0);
    
    this.Enabled = function () {
        return (this.CanBeEnabled () && this.OverrideEnabled);
    };

    this.CanBeEnabled = function () {
        if (!this.AreAllRequiredPreferencesAndSectionsEnabled ())
            return false;
        else
            {
            if (this.ParentSection != null && !this.ParentSection.Enabled ())
                return false;
            else
                return true;
        }
    };

    this.AreAllRequiredPreferencesAndSectionsEnabled = function () {
        if (Trim (this.RequiresThesePreferencesToBeEnabled) != '')
        {
            var tmpArray = this.RequiresThesePreferencesToBeEnabled.split (',');
            for (var c = 0; c < tmpArray.length; c++)
            {
                var tmpRP = this.ParentSection.GetPreference (tmpArray [c]);
                if (!tmpRP.Enabled ())
                    return false;
            }
        }
        if (Trim (this.RequiresTheseSectionsToBeEnabled) != '')
        {
            var tmpArray = this.RequiresTheseSectionsToBeEnabled.split (',');
            for (var c = 0; c < tmpArray.length; c++)
            {
                var tmpRS = this.ParentSection.GetSection (tmpArray [c]);
                if (!tmpRS.Enabled ())
                    return false;
            }
        }
        return true;
    };

    this.CalculateFullName = function () {
        if (this.ParentSection)
            this.FullName = this.ParentSection.CalculateFullName () + '.' + this.Name;
        else
            this.FullName = this.Name;
        return this.FullName;
    };
    
    this.HasOnOffComponent = function () {
        return (this.PreferenceType == PreferenceTypeOnOff || this.PreferenceType == PreferenceTypeOnOffPlusValue);
    };

    this.HasValueComponent = function () {
        return (this.PreferenceType == PreferenceTypeValue || this.PreferenceType == PreferenceTypeOnOffPlusValue);
    };
}

function GetPreference (SectionOrFullPreferenceName,PreferenceName)
{
    var tmpSection = null;
    
    if (typeof (SectionOrFullPreferenceName) == 'string')
        {
        var tmpPreference = findObjectInArray (PreferencesArray,'FullName',SectionOrFullPreferenceName);
        if (tmpPreference == null && RootPreferencesSection != null)
            tmpPreference = findObjectInArray (PreferencesArray,'FullName',RootPreferencesSection.FullName + '.' + SectionOrFullPreferenceName);
        if (tmpPreference != null)
            return tmpPreference;
        else
            tmpSection = GetPreferencesSection (SectionOrFullPreferenceName);
    }
    else
        tmpSection = SectionOrFullPreferenceName;

    if (tmpSection)
        return tmpSection.GetPreference (PreferenceName);

    return null;
}

function IsPreferenceEnabled (SectionOrFullPreferenceName,PreferenceName)
{
    var tmpPreference = GetPreference (SectionOrFullPreferenceName,PreferenceName);
    if (!tmpPreference)
        return false;
    
    if (tmpPreference.PreferenceType == PreferenceTypeValue)
        return (true);
    return tmpPreference.Enabled ();
}

function GetPreferenceValue (SectionOrFullPreferenceName,PreferenceNameOrDefaultValue,DefaultValue)
{
    var tmpPreference = GetPreference (SectionOrFullPreferenceName,PreferenceNameOrDefaultValue);
    
    if (tmpPreference && tmpPreference.Enabled ())
        return tmpPreference.Value;
    else
        {
        if (isDefined (DefaultValue))
            return DefaultValue;
        if (isDefined (PreferenceNameOrDefaultValue))
            return PreferenceNameOrDefaultValue;
        return null;
    }
}

function SetPreferenceEnabled (SectionOrFullPreferenceName,PreferenceNameOrValue,Value)
{
    var tmpPreference = GetPreference (SectionOrFullPreferenceName,PreferenceNameOrValue);
    
    if (!tmpPreference)
        return false;

    if (isDefined (Value))
        tmpPreference.OverrideEnabled = Value;
    else
        tmpPreference.OverrideEnabled = PreferenceNameOrValue;
}

function SetPreferenceValue (SectionOrFullPreferenceName,PreferenceNameOrValue,Value)
{
    var tmpPreference = GetPreference (SectionOrFullPreferenceName,PreferenceNameOrValue);
    if (!tmpPreference)
        return '';
    if (isDefined (Value))
        tmpPreference.Value = Value;
    else
        tmpPreference.Value = PreferenceNameOrValue;
}

function SetPreferenceEnabledAndValue (SectionOrFullPreferenceName,PreferenceNameOrEnabled,EnabledOrValue,Value)
{
    var tmpPreference = GetPreference (SectionOrFullPreferenceName,PreferenceNameOrEnabled);
    if (!tmpPreference)
        return '';
    if (isDefined (Value))
        {
        tmpPreference.OverrideEnabled = EnabledOrValue;
        tmpPreference.Value = Value;
    }
    else
    {
        tmpPreference.OverrideEnabled = PreferenceNameOrEnabled;
        tmpPreference.Value = EnabledOrValue;
    }
}

function SetPreferencesSectionFromDiv (thisSection)
{
    if (!(thisSection.ShowTitleInPreferencesDiv || thisSection.ShowChildrenInPreferencesDiv))
        return;
    if (thisSection.ShowTitleInPreferencesDiv)
        thisSection.OverrideEnabled = (thisSection.EnabledCheckBox.checked);

    if (thisSection.ShowChildrenInPreferencesDiv)
    {
        for (var cPreference = 0; cPreference < thisSection.Preferences.length; cPreference ++)
        {
            var Preference = thisSection.Preferences [cPreference];
            
            if (Preference.HasOnOffComponent ())
                Preference.OverrideEnabled = (Preference.EnabledCheckBox.checked);
            if (Preference.HasValueComponent ())
            {
                switch (Preference.ValueEditElementType)
                {
                    case 'text':
                        Preference.Value = Preference.ValueEditElement.value;
                        break;
                    case 'textarea':
                        var tmpStrings = Preference.ValueEditElement.value.split ('\n');
                        Preference.Value = tmpStrings.join ('|n');
                        break;
                    case 'select-one':
                    case 'select-multiple':
                        if (Preference.ValueEditElement.selectedIndex >= 0)
                            Preference.Value = Preference.ValueEditElement.options [Preference.ValueEditElement.selectedIndex].text;
                        else
                            Preference.Value = '';
                        break;
                }
            }
        }
        for (var cChildSection = 0; cChildSection < thisSection.Sections.length; cChildSection ++)
            SetPreferencesSectionFromDiv (thisSection.Sections [cChildSection]);
    }
}

function SetPreferencesFromPreferencesDiv ()
    
{
    SetPreferencesSectionFromDiv (PreferencesDivRootSection);
}

function LoadPreferences (StorageMode,FromTheseStrings)
{
    function ProcessInputStr (Name,LineNumber,ValueStr)
    {
        switch (StorageMode)
        {
            case psLocalStorage:
                ValueStr = localStorage.getItem (LocalStoragePreferencesPrefix + Name);
                if (ValueStr == null)
                    return false;
                break;
            case psStrings:
                break;
        }
        
        var tmpPreference = null;
        var tmpSection = GetPreferencesSection (Name);
        
        if (tmpSection == null)
        {
            tmpPreference = GetPreference (Name);
            if (tmpPreference == null)
            {
                console.log ('LoadPreferencesFromStrings error: line ' + LineNumber + ' - cannot find section or preference "' + Name + '"');
                return false;
            }
        }

        if (Trim (ValueStr) == '')
        {
            console.log ('LoadPreferencesFromStrings error: line ' + LineNumber + ' - no values specified for "' + Name + '"');
            return false;
        }
 
        var tmpParsedArray = ValueStr.match (new RegExp ('Enabled=(.*?)(?:\\W|$)','i'));
        if (tmpParsedArray != null && tmpParsedArray.length > 1)
            {
            if (tmpSection != null)
                tmpSection.OverrideEnabled = AreStringsBasicallyEqual (tmpParsedArray [1],'true');
            if (tmpPreference != null)
            {
                if (tmpPreference.HasOnOffComponent ())
                    tmpPreference.OverrideEnabled = AreStringsBasicallyEqual (tmpParsedArray [1],'true');
            }
        }

        var tmpParsedArray = ValueStr.match (new RegExp ('Value=(.*?)$',''));
        if (tmpParsedArray != null && tmpParsedArray.length > 1)
            {
            if (tmpPreference != null)
            {
                if (tmpPreference.HasValueComponent ())
                    tmpPreference.Value = tmpParsedArray [1];
            }
        }
    }
    
    function LoadPreferenceSection (thisSection)
    {
        ProcessInputStr (thisSection.FullName);

        for (var cPreference = 0; cPreference < thisSection.Preferences.length; cPreference ++)
        {
            var Preference = thisSection.Preferences [cPreference];
            
            ProcessInputStr (Preference.FullName);
        }
            
        for (var cChildSection = 0; cChildSection < thisSection.Sections.length; cChildSection ++)
            LoadPreferenceSection (thisSection.Sections [cChildSection]);
    }

    function LoadPreferencesFromStrings ()
    {
        for (cLine = 0; cLine < FromTheseStrings.length; cLine ++)
        {
            InputStr = FromTheseStrings [cLine];
            if (Trim (InputStr) == '')
                continue;

            ColonSP = InputStr.indexOf (':');
            if (ColonSP == -1)
            {
                console.log ('LoadPreferencesFromStrings error: line ' + (cLine+1) + ' incorrectly formatted - cannot find ":"');
                continue;
            }
            ProcessInputStr (InputStr.substr (0,ColonSP),cLine+1,InputStr.substr (ColonSP+1));
        }
    }
    
    switch (StorageMode)
    {
        case psLocalStorage:
            LoadPreferenceSection (RootPreferencesSection);
            break;
        case psStrings:
            LoadPreferencesFromStrings ();
            break;
    }
}

function SavePreferences (RootSection,StorageMode,OutputStrings,Options)
{
    function SaveStrs (NameStr,ValueStr)
    {
        switch (StorageMode)
        {
            case psLocalStorage:
                if (getOptionalValue (Options.DeleteItems,false))
                    localStorage.removeItem (LocalStoragePreferencesPrefix + NameStr);
                else
                    localStorage.setItem (LocalStoragePreferencesPrefix + NameStr,ValueStr);
                break;
            case psStrings:
                OutputStrings.push (NameStr + ':' + ValueStr);
                break;
        }
    }
    
    function SavePreferenceSection (thisSection)
    {
        if (thisSection.IsTemplate)
            return;

        var NameStr = thisSection.FullName;
        if (StorageMode == psStrings && thisSection.ParentSection != null)
            NameStr = NameStr.replace (RootPreferencesSection.Name+'.','');
        if (!(StorageMode == psStrings && thisSection.ParentSection == null))
            SaveStrs (NameStr,'Enabled=' + thisSection.OverrideEnabled);
        
        for (var cSectionOrPreference = 0; cSectionOrPreference < thisSection.SectionsAndPreferences.length; cSectionOrPreference ++)
        {
            var SectionOrPreference = thisSection.SectionsAndPreferences [cSectionOrPreference];
            
            if (thisSection.Sections.indexOf (SectionOrPreference) != -1)
            {
                var Section = SectionOrPreference;

                SavePreferenceSection (Section);
            }
            else
            {
                var Preference = SectionOrPreference;

                var NameStr = Preference.FullName;
                if (StorageMode == psStrings && thisSection.ParentSection != null)
                    NameStr = NameStr.replace (RootPreferencesSection.Name+'.','');
                
                var ValueStr = '';

                if (Preference.HasOnOffComponent ())
                    ValueStr += 'Enabled=' + Preference.OverrideEnabled;
                
                if (Preference.HasValueComponent ())
                {
                    if (ValueStr != '')
                        ValueStr += ', ';
                    ValueStr += 'Value=' + Preference.Value;
                }
                
                SaveStrs (NameStr,ValueStr);
            }
        }
    }

    if (!isDefined (Options))
        Options = {};

    StorageMode = getOptionalValue (StorageMode,psLocalStorage);
    if (OutputStrings)
        OutputStrings.length = 0;
    SavePreferenceSection (RootSection);
}

function ApplyPreferencesChangesAndReloadPage ()
{
    SetPreferencesFromPreferencesDiv ();
    SavePreferences (PreferencesDivRootSection,psLocalStorage);
    location.reload ();
}

function HandlePreferencesAsStringsEdit ()
{
    if (GetTokenizedVersionOf (PreferencesAsStringsEdit.value,true).length > 0)
        SetPreferencesFromTextLink.style.color = 'red';
    else
        SetPreferencesFromTextLink.style.color = PreferencesAsStringsDiv.style.color;
}

function HandlePreferenceValueEdit ()
{
    HaveAnyPreferencesBeenEditedSincePreferencesDivOpened = true;
    ApplyChangesLink.style.display = 'inline-block';
    DiscardChangesLink.style.display = 'inline-block';

    HaveAnyPreferencesBeenEditedSincePreferencesAsTextDivRefreshed = true;
    if (HaveAnyPreferencesBeenEditedSincePreferencesAsTextDivRefreshed)
        RefreshPreferencesTextLink.style.color = 'red';
}

function HandleValueEditElementValueChanged (thisElement)
{
    var tmpPreference = findObjectInArray (PreferencesArray,'ValueEditElement',thisElement);
    if (!tmpPreference)
        return false;

    HandlePreferenceValueEdit ();
    SetPreferencesSectionFromDiv (tmpPreference.ParentSection);
    RefreshDivForSection (tmpPreference.ParentSection);
}

function HandleEnabledCheckBoxClick (thisCheckBox)
{
    var tmpSection = findObjectInArray (PreferencesSectionsArray,'EnabledCheckBox',thisCheckBox);
    if (!tmpSection)
    {
        var tmpPreference = findObjectInArray (PreferencesArray,'EnabledCheckBox',thisCheckBox);
        if (tmpPreference && tmpPreference.ParentSection)
            tmpSection = tmpPreference.ParentSection;
        else
            return;
    }
    HandlePreferenceValueEdit ();
    SetPreferencesFromPreferencesDiv ();
    RefreshPreferencesDiv ();
}

function RefreshPreferencesAsStringsEdit ()
{
    var tmpStrings = [];
    SavePreferences (PreferencesDivRootSection,psStrings,tmpStrings);
    PreferencesAsStringsEdit.value = tmpStrings.join ('\n');
}

function IsPreferencesDivOpen ()
{
    return (PreferencesDiv != null && PreferencesDiv.style.display != 'none');
}

function RefreshPreferencesDiv ()
{
    RefreshSectionDivs ();
}

function RefreshSectionDivs ()
{
    RefreshDivForSection (PreferencesDivRootSection);
}

function RefreshDivForSection (thisSection)
{
    if (!(thisSection.ShowTitleInPreferencesDiv || thisSection.ShowChildrenInPreferencesDiv))
        return;

    if (thisSection.ShowTitleInPreferencesDiv)
    {
        thisSection.EnabledCheckBox.disabled = !thisSection.CanBeEnabled ();
        if (thisSection.Enabled ())
            thisSection.SectionDiv.style.color = 'black';
        else
            thisSection.SectionDiv.style.color = '#707070';
        
        if (thisSection.Collapsed)
            {
            thisSection.ShowHideLink.innerHTML = 'Show';
            thisSection.ResetLink.style.display = 'none';
            thisSection.SectionPreferencesDiv.style.display = 'none';
        }
        else
            {
            thisSection.ShowHideLink.innerHTML = 'Hide';
            thisSection.ResetLink.style.display = 'inline-block';
            thisSection.SectionPreferencesDiv.style.display = 'block';
        }
    }

    if (thisSection.ShowChildrenInPreferencesDiv)
    {
        for (var cPreference = 0; cPreference < thisSection.Preferences.length; cPreference ++)
        {
            var Preference = thisSection.Preferences [cPreference];

            if (Preference.Enabled ())
                Preference.PreferenceDiv.style.color = 'black';
            else
                Preference.PreferenceDiv.style.color = '#707070';
            if (Preference.HasOnOffComponent ())
                Preference.EnabledCheckBox.disabled = !Preference.CanBeEnabled ();
            
            var tmpLeft = Preference.ValueEditElementLeft;
            if (tmpLeft == 0)
                tmpLeft = Preference.ParentSection.DefaultPreferenceValueEditElementLeft;
            if (tmpLeft > 0)
                Preference.PreferenceNameDiv.style.width = tmpLeft + 'px';

            if (Preference.HasValueComponent ())
                {
                if (Preference.ValueEditElement)
                {

                    if (Preference.ValueType == 'color')
                        Preference.ValueEditElement.style.backgroundColor = Preference.Value;
                    Preference.ValueEditElement.disabled = !Preference.Enabled ();
                }
            }
        }
        for (var cChildSection = 0; cChildSection < thisSection.Sections.length; cChildSection ++)
            RefreshDivForSection (thisSection.Sections [cChildSection]);
    }
}

function AddLinkElement (Text,URL,Options)
{
    if (!isDefined (Options))
        Options = {};

    var newLink = document.createElement ('a');
    with (newLink)
        {
        innerHTML = Text;
        setAttribute ('href',URL);
        if (isDefined (Options.FontColor))
            style.color = Options.FontColor;
        if (isDefined (Options.FontSize))
            style.fontSize = Options.FontSize;
    }
    return newLink;
}

function BuildDivsForSection (thisSection,DivIndent)
{
    with (thisSection)
    {
        if (thisSection.IsTemplate)
            return;

        SectionDiv = document.createElement ('div');
        if (ParentSection && ParentSection.SectionPreferencesDiv)
            ParentSection.SectionPreferencesDiv.appendChild (SectionDiv);
        else
            PreferencesDiv.appendChild (SectionDiv);

        if (thisSection != PreferencesDivRootSection)
        {
            if (DisplayAsRoot)
            {
                $(SectionDiv).css ({
                    'border':'thin solid black',
                    'margin-top':'10px',
                    'margin-bottom':'15px',
                    'background':'#F9F9F9',
                });
            }
            else
            {
                $(SectionDiv).css ({
                    'border':'thin solid black',
                    'margin-top':'5px',
                    'margin-bottom':'8px',
                });
            }
        }

        if (ShowTitleInPreferencesDiv)
        {

            SectionTitleDiv = document.createElement ('div');
            SectionDiv.appendChild (SectionTitleDiv);

            $(SectionTitleDiv).css ({
                'height':'20px',
            });

            if (DisplayAsRoot)
            {
                $(SectionTitleDiv).css ({
                    'background':'white',
                    'font-size':'15px',
                    'border-bottom':'thin solid black',
                });
            }
            else
            {
                $(SectionTitleDiv).css ({
                    'font-size':'13px',
//                    'border-bottom':'thin solid black',
                });
//!!                SectionDiv.appendChild (document.createElement ('br'));
            }

            EnabledCheckBox = document.createElement ('input');
            with (EnabledCheckBox)
            {
                className = 'SectionEnabledCheckBox';
                type = 'checkbox';
                style.verticalAlign = 'text-bottom';
                    style.marginBottom = 0;
                style.marginRight = '4px';
                onclick = function () {HandleEnabledCheckBoxClick (this);};
                checked = OverrideEnabled;
            }
            SectionTitleDiv.appendChild (EnabledCheckBox);
            SectionTitleDiv.appendChild (document.createTextNode (Name));

            ShowHideLink = AddLinkElement ('Show','',{FontSize: '11px'});
            SectionTitleDiv.appendChild (ShowHideLink);
            with (ShowHideLink)
            {
                style.marginLeft = '20px';
                if (!thisSection.DisplayAsRoot)
                    style.display = 'none';
                onclick = function () {HandleShowHideLinkClick (this); return false};
            }

            ResetLink = AddLinkElement ('Reset','',{FontSize: '11px'});
            SectionTitleDiv.appendChild (ResetLink);
            with (ResetLink)
            {
                style.marginLeft = '20px';
                onclick = function () {HandleResetLinkClick (this); return false};
            }

        }

        SectionPreferencesDiv = document.createElement ('div');
        if (thisSection.ShowTitleInPreferencesDiv)
            {
            SectionPreferencesDiv.style.marginLeft = '15px';
            SectionPreferencesDiv.style.marginRight = '15px';
            if (DisplayAsRoot)
            {
            }
            else
            {
            }
        }
        SectionDiv.appendChild (SectionPreferencesDiv);

        if (ShowChildrenInPreferencesDiv)
        {
            for (var cSOP = 0; cSOP < SectionsAndPreferences.length; cSOP ++)
            {
                var tmpSectionOrPreference = SectionsAndPreferences [cSOP];
                if (Sections.indexOf (tmpSectionOrPreference) != -1)
                {
                    var tmpSection = tmpSectionOrPreference;
                    
                    if (tmpSection.ShowTitleInPreferencesDiv)
                        {
                        if (tmpSection.DisplayAsRoot)
                            BuildDivsForSection (tmpSection,DivIndent);
                        else
                            BuildDivsForSection (tmpSection,DivIndent + 1);
                    }
                    else
                        BuildDivsForSection (tmpSection,DivIndent);
                }
                else
                {
                    var tmpPreference = tmpSectionOrPreference;

                    tmpPreference.PreferenceDiv = document.createElement ('div');
                    SectionPreferencesDiv.appendChild (tmpPreference.PreferenceDiv);

                    tmpPreference.PreferenceDiv.style.marginTop = '5px';
                    tmpPreference.PreferenceDiv.style.marginBottom = '5px';
                    
                    if (ShowPreferencesAsInline)
                        {
                        tmpPreference.PreferenceDiv.style.fontSize = '11px';
                        tmpPreference.PreferenceDiv.style.display = 'inline-block';
                        tmpPreference.PreferenceDiv.style.marginRight = '30px';
                    }
                    else
                        {
                        tmpPreference.PreferenceDiv.style.fontSize = '12px';
                        tmpPreference.PreferenceDiv.style.display = 'block';
                    }

                    if (tmpPreference.HasOnOffComponent ())
                    {
                        tmpPreference.EnabledCheckBox = document.createElement ('input');
                        with (tmpPreference.EnabledCheckBox)
                        {
                            type = 'checkbox';
                            style.verticalAlign = 'text-bottom';
                            style.marginBottom = 0;
                            style.marginRight = '4px';
                            onclick = function () {HandleEnabledCheckBoxClick (this);};
                            checked = tmpPreference.OverrideEnabled;
                            tmpPreference.PreferenceDiv.appendChild (tmpPreference.EnabledCheckBox);
                        }
                    }
                    tmpPreference.PreferenceNameDiv = document.createElement ('div');
                    tmpPreference.PreferenceNameDiv.appendChild (document.createTextNode (tmpPreference.Name));
                    tmpPreference.PreferenceDiv.appendChild (tmpPreference.PreferenceNameDiv);

                    tmpPreference.PreferenceNameDiv.style.display = 'inline-block';
                    tmpPreference.PreferenceNameDiv.style.marginTop = '5px';
                    tmpPreference.PreferenceNameDiv.style.marginBottom = '3px';

                    if (tmpPreference.HasValueComponent ())
                    {
                        switch (tmpPreference.ValueEditElementType)
                        {
                            case 'text':
                                tmpPreference.ValueEditElement = document.createElement ('input');
                                tmpPreference.ValueEditElement.type = tmpPreference.ValueEditElementType;
                                tmpPreference.ValueEditElement.value = tmpPreference.Value;
                                break;
                            case 'textarea':
                                tmpPreference.ValueEditElement = document.createElement ('textarea');
                                tmpPreference.ValueEditElement.type = tmpPreference.ValueEditElementType;
                                tmpPreference.ValueEditElement.rows = 4;
                                var tmpStrings = tmpPreference.Value.split ('|n');
                                tmpPreference.ValueEditElement.value = tmpStrings.join ('\n');
                                break;
                            case 'select-one':
                            case 'select-multiple':
                                tmpPreference.ValueEditElement = document.createElement ('select');
                                for (var c = 0; c < tmpPreference.SelectValueFromArray.length; c ++)
                                    tmpPreference.ValueEditElement.innerHTML += '<option>' + tmpPreference.SelectValueFromArray [c] + '</option>';
                                tmpPreference.ValueEditElement.selectedIndex = tmpPreference.SelectValueFromArray.indexOf (tmpPreference.Value);
                                break;
                        }

                        with (tmpPreference.ValueEditElement)
                        {
                            style.position = 'relative';
                            style.left = '5px';

                            if (!tmpPreference.ShowValueEditElementAsInline)
                                style.display = 'block';

                            onchange = function () {HandleValueEditElementValueChanged (this);};
                            oninput = function () {HandleValueEditElementValueChanged (this);};
                            onpaste = function () {HandleValueEditElementValueChanged (this);};
                            onkeypress = function () {HandleValueEditElementValueChanged (this);};

                            switch (GetTokenizedVersionOf (tmpPreference.ValueEditElementWidth,true,true))
                            {
                                case 'small': style.width = '40px'; break;
                                case 'mediumsmall': style.width = '70px'; break;
                                case 'medium': style.width = '100px'; break;
                                case 'mediumlarge': style.width = '175px'; break;
                                case 'large': style.width = '400px'; break;
                                default:
                                    style.width = '60px';
                            }

                            switch (tmpPreference.ValueEditElementType)
                            {
                                case 'text':
                                    if (tmpPreference.ValueType == 'color')
                                    {
                                        style.backgroundColor = tmpPreference.Value;
                                        style.width = '70px';
                                    }
                                    break;
                                case 'textarea':
                                    style.verticalAlign = 'top';
                                    break;
                                case 'select-one':
                                case 'select-multiple':
                                    style.width = (parseInt (style.width) + 25) + 'px';
                                    break;
                            }
                            tmpPreference.PreferenceDiv.appendChild (tmpPreference.ValueEditElement);
                        }
                    }            
                }
            }
        }
    }
}

function BuildPreferencesDiv ()
{
    PreferencesDiv = document.createElement ('div');
    with (PreferencesDiv)
    {
        id = MachinaModule + 'PreferencesDiv';
        style.display = 'none';
        style.width = '100%';
//        style.border = 'thin solid black';
        style.background = 'none';
        style.color = 'black';
        style.fontFamily = 'arial';
        style.fontSize = '12px';
        style.fontWeight = 'bold';
        style.marginTop = '15px';
        style.marginBottom = '30px';
        style.paddingLeft = '5px';
        style.paddingRight = '10px';
    }
    
    PreferencesTitleDiv = document.createElement ('div');
    PreferencesDiv.appendChild (PreferencesTitleDiv);
    with (PreferencesTitleDiv)
    {
        appendChild (document.createTextNode (MachinaModule + ' Preferences'));
        style.backgroundColor = 'white',
        style.border = 'thin solid black',
        style.fontSize = '16px';
        style.paddingLeft = '5px';
        style.marginTop = '2px';
    }
    PreferencesTitleDiv.appendChild (document.createElement ('br'));

    ShowAllSectionsLink = AddLinkElement ('Show all','',{FontSize: '14px'});
    PreferencesTitleDiv.appendChild (ShowAllSectionsLink);
    with (ShowAllSectionsLink)
    {
        onclick = function ()
        {
            for (var c = 0; c < PreferencesSectionsArray.length; c ++)
                {
                var tmpSection = PreferencesSectionsArray [c];
                if (tmpSection.DisplayAsRoot)
                    tmpSection.Collapsed = false;
            }
            RefreshSectionDivs ();
            return false;
        }
    }

    HideAllSectionsLink = AddLinkElement ('Hide all','',{FontSize: '14px'});
    PreferencesTitleDiv.appendChild (HideAllSectionsLink);
    with (HideAllSectionsLink)
    {
        style.marginLeft = '25px';
        onclick = function ()
        {
            for (var c = 0; c < PreferencesSectionsArray.length; c ++)
                {
                var tmpSection = PreferencesSectionsArray [c];
                if (tmpSection.DisplayAsRoot)
                    tmpSection.Collapsed = true;
            }
            RefreshSectionDivs ();
            return false;
        };
    }

    ShowPreferencesAsStringsLink = AddLinkElement ('Import/export','',{FontSize: '14px'});
    PreferencesTitleDiv.appendChild (ShowPreferencesAsStringsLink);
    with (ShowPreferencesAsStringsLink)
    {
        style.marginLeft = '25px';
        onclick = function ()
        {
            if (PreferencesAsStringsDiv.style.display == 'none')
            {
                PreferencesAsStringsDiv.style.display = 'block';
                ShowPreferencesAsStringsLink.innerHTML = 'Hide import/export';
            }
            else
            {
                PreferencesAsStringsDiv.style.display = 'none';
                ShowPreferencesAsStringsLink.innerHTML = 'Import/export';
            }
            return false;
        }
    }

    ResetAllPreferencesLink = AddLinkElement ('Reset all','',{FontSize: '14px'});
    PreferencesTitleDiv.appendChild (ResetAllPreferencesLink);
    with (ResetAllPreferencesLink)
    {
        style.marginLeft = '25px';
        onclick = function () {ResetAllPreferencesToDefaultValues (); return false};
    }

    ApplyChangesLink = AddLinkElement ('Save changes','',{FontSize: '14px', FontColor: 'red'});
    PreferencesTitleDiv.appendChild (ApplyChangesLink);
    with (ApplyChangesLink)
    {
        style.display = 'none';
        style.marginLeft = '25px';
        onclick = function () {ApplyPreferencesChangesAndReloadPage (); return false};
    }

    DiscardChangesLink = AddLinkElement ('Discard changes','',{FontSize: '14px', FontColor: 'maroon'});
    PreferencesTitleDiv.appendChild (DiscardChangesLink);
    with (DiscardChangesLink)
    {
        style.display = 'none';
        style.marginLeft = '25px';
        onclick = function () {alert ('Preferences changes have been discarded - page will now be reloaded'); location.reload (); return false};
    }

    ClosePreferencesDivLink = AddLinkElement ('Close','',{FontSize: '14px', FontColor: 'maroon'});
    PreferencesTitleDiv.appendChild (ClosePreferencesDivLink);
    with (ClosePreferencesDivLink)
    {
        style.marginLeft = '25px';
        onclick = function () {
            var tmpConfirm = true;
            if (HaveAnyPreferencesBeenEditedSincePreferencesDivOpened)
                tmpConfirm = (confirm ('You have made unsaved changes. Close anyway?') == true);
            if (tmpConfirm)
                PreferencesDiv.style.display = 'none';
            return false;
        };
    }

    PreferencesAsStringsDiv = document.createElement ('div');
    PreferencesDiv.appendChild (PreferencesAsStringsDiv);
    with (PreferencesAsStringsDiv)
    {
        style.display = 'none';
        style.fontSize = '14px';
        style.marginTop = '10px';
        style.marginBottom = '10px';
        style.border = 'thin solid black';
        style.backgroundColor = 'white';
        style.paddingLeft = '10px';
        style.paddingRight = '10px';
        appendChild (document.createTextNode (MachinaModule + ' Preferences as text'));
    }

    ClearPreferencesTextLink = AddLinkElement ('Clear text','',{FontSize: '12px'});
    PreferencesAsStringsDiv.appendChild (ClearPreferencesTextLink);
    with (ClearPreferencesTextLink)
    {
        style.marginLeft = '20px';
        onclick = function () {PreferencesAsStringsEdit.value = ''; SetPreferencesFromTextLink.style.color  = PreferencesAsStringsDiv.style.color; return false;};
    }

    RefreshPreferencesTextLink = AddLinkElement ('Export preferences to text','',{FontSize: '12px'});
    PreferencesAsStringsDiv.appendChild (RefreshPreferencesTextLink);
    with (RefreshPreferencesTextLink)
    {
        style.marginLeft = '20px';
        onclick = function () {RefreshPreferencesTextLink.style.color = PreferencesAsStringsDiv.style.color; SetPreferencesFromTextLink.style.color  = PreferencesAsStringsDiv.style.color; RefreshPreferencesAsStringsEdit (); return false;};
    }

    SetPreferencesFromTextLink = AddLinkElement ('Import preferences from text','',{FontSize: '12px'});
    PreferencesAsStringsDiv.appendChild (SetPreferencesFromTextLink);
    with (SetPreferencesFromTextLink)
    {
        style.marginLeft = '20px';
        onclick = function () {
            var tmpStrings = PreferencesAsStringsEdit.value.split ('\n');
            LoadPreferences (psStrings,tmpStrings);
            SavePreferences (RootPreferencesSection,psLocalStorage);
            alert ('Preferences have been imported from text - page will now be reloaded');
            location.reload ();
            return false;
        };
    }

    PreferencesAsStringsEdit = document.createElement ('textarea');
    PreferencesAsStringsDiv.appendChild (PreferencesAsStringsEdit);
    with (PreferencesAsStringsEdit)
    {
        value = '';
        placeholder = 'To export preferences:\n  1. Click "Export preferences to text".\n  2. Select and copy to clipboard the text that appears here.\n  3. Paste from clipboard wherever you want the preferences text.'
        + '\n\nTo import preferences:\n  1. Click "Clear text".\n  2. Type or paste the text to import into this text area.\n  3. Click "Import preferences from text".\nOnly preferences included in the text will be updated, so you can delete any preferences from the text before importing that you don\'t want to update.'
        + '\n\nTo transfer preferences from one server to another:\n  1. Open preferences on the "From" server.\n  2. Export preferences (as above).\n  3. Open preferences on the "To" server.\n  4. Import preferences (as above).';
        style.width = '100%';
        style.height = '300px';
        style.fontFamily = 'arial';
        style.fontSize = '13px';
        style.marginTop = '5px';
        style.marginRight = '10px';
        onchange = function () {HandlePreferencesAsStringsEdit (this);};
        oninput = function () {HandlePreferencesAsStringsEdit (this);};
        onpaste = function () {HandlePreferencesAsStringsEdit (this);};
    }

    PreferencesDivRootSection = AddPreferencesSection ('PreferencesDiv',{AsCloneOf: RootPreferencesSection, AddToRoot: true, ShowTitleInPreferencesDiv: false});
    PreferencesDivRootSection.Name = RootPreferencesSection.Name;
    PreferencesDivRootSection.CalculateFullName ();

    BuildDivsForSection (PreferencesDivRootSection,0);
    RefreshPreferencesDiv ();
//    RefreshPreferencesAsStringsEdit ();
}

function OpenPreferencesDiv (AppendToThisElement)
{
    if (IsPreferencesDivOpen ())
        return;
    if (PreferencesDiv == null)
    {
        BuildPreferencesDiv ();
        AppendToThisElement.appendChild (PreferencesDiv);
    }
    PreferencesDiv.style.display = 'block';
}

function HandleResetLinkClick (ResetLink)
{
    var tmpSection = findObjectInArray (PreferencesSectionsArray,'ResetLink',ResetLink);
    
    if (tmpSection)
        ResetPreferencesSectionToDefaultValues (tmpSection);
}

function HandleShowHideLinkClick (ShowHideLink)
{
    var tmpSection = findObjectInArray (PreferencesSectionsArray,'ShowHideLink',ShowHideLink);
    
    if (tmpSection)
        {
        tmpSection.Collapsed = !tmpSection.Collapsed;
        RefreshDivForSection (tmpSection);
    }
}

function ResetPreferencesSectionToDefaultValues (thisSection)
{
    var ConfirmationStr = '';
    
    if (thisSection == RootPreferencesSection)
        ConfirmationStr = 'Reset all preferences to default values?';
    else
        ConfirmationStr = 'Reset ' + thisSection.Name + ' preferences to default values?';
    
    if (confirm (ConfirmationStr) == true)
    {
        SavePreferences (thisSection,psLocalStorage,null,{DeleteItems: true});
        alert ('Preferences have been reset to defaults - page will now be reloaded');
        location.reload ();
    }
}

function ResetAllPreferencesToDefaultValues ()
{
    ResetPreferencesSectionToDefaultValues (RootPreferencesSection);
}

function InitialisePreference (SectionName,Name,PreferenceType,Enabled,Value,Notes)
{
    var tmpSection = GetPreferencesSection (SectionName);
    if (tmpSection == null)
        tmpSection = AddPreferencesSection (SectionName);
    NewPreference = tmpSection.AddPreference (Name,PreferenceType,Enabled,{DefaultValue: Value});
    return NewPreference;
}

function test1 ()
{
    ConvertMachinaCSSToPureCSS ('family=arial;size=12;bold=true; fontcolor=green');
    var tmpE = document.getElementById ('filter0');
//    $(tmpE).css ('color','red');
//    $(tmpE).css ('font-family','courier new');
    $(tmpE).css ({'font-family':'courier new','color':'red'});
}

function InitialisedKeyValuePair (Key,Value)
{
    this.Key = Key || '';
    this.Value = Value || '';
}

function ExtractKeyValuePairs (FromThisString,KeyValueSeperator,PairSeperator)
{
    var KVPArray = [];

    var tmpKVPStrArray = FromThisString.split (PairSeperator);
    
    for (cKVP = 0; cKVP < tmpKVPStrArray.length; cKVP ++)
    {
        var tmpstr = tmpKVPStrArray [cKVP];
        var tmpArray = tmpstr.split (KeyValueSeperator);
        if (tmpArray.length != 2)
            continue;
        var KVP = new InitialisedKeyValuePair (Trim (tmpArray [0]),tmpArray [1]);
        KVPArray.push (KVP);
    }

    return KVPArray;
}

function ReplaceAnyOfTheseStringsWithNewString (SourceString,TheseStrings,NewString)
{
    var tmpParsedArray = TheseStrings.match (new RegExp (SourceString+'(?:\\W|$)',''));
    if (tmpParsedArray)
        {
//        console.log (SourceString + ' converted to ' + NewString);
        return NewString;
    }
    else
        return SourceString;
}

function ConvertMachinaCSSToPureCSS (MachinaCSS)
{
    var CSSArray = ExtractKeyValuePairs (MachinaCSS,'=',';');
    
    for (cCSS = 0; cCSS < CSSArray.length; cCSS ++)
    {
        var CSSObject = CSSArray [cCSS];
        var TokenizedKey = GetTokenizedVersionOf (CSSObject.Key,true);
//        console.log (CSSObject.Key + '=' + CSSObject.Value);
        ReplaceAnyOfTheseStringsWithNewString (TokenizedKey,'font,name,fontname,family','font-family');
        ReplaceAnyOfTheseStringsWithNewString (TokenizedKey,'fontcolor,textcolor,ink,inkcolor','color');
    }
}

function ApplyPreferenceSectionToElement (SectionName,ThisElement)
{
    var ThisSection = GetPreferencesSection (SectionName);
    if (!ThisSection)
        {
        console.log ('Error: cannot find section "'+ SectionName + '"');
        return;
    }
    if (!ThisSection.Enabled ())
        return;

    if (ThisElement instanceof jQuery)
    {
        // font
        if (IsPreferenceEnabled (ThisSection.FullName,'Font'))
            ThisElement.css ('font-family',GetPreferenceValue (ThisSection.FullName,'Font'));
        if (IsPreferenceEnabled (ThisSection.FullName,'Size'))
            ThisElement.css ('font-size',GetPreferenceValue (ThisSection.FullName,'Size'));
        if (IsPreferenceEnabled (ThisSection.FullName,'Bold'))
            ThisElement.css ('font-weight','bold');

        // other
        if (IsPreferenceEnabled (ThisSection.FullName,'Remove underlines from links'))
            ThisElement.css ('text-decoration','none');
    }
    else
    {
        // font
        if (IsPreferenceEnabled (ThisSection.FullName,'Font'))
            ThisElement.style.fontFamily = GetPreferenceValue (ThisSection.FullName,'Font');
        if (IsPreferenceEnabled (ThisSection.FullName,'Size'))
            ThisElement.style.fontSize = GetPreferenceValue (ThisSection.FullName,'Size');
        if (IsPreferenceEnabled (ThisSection.FullName,'Bold'))
            ThisElement.style.fontWeight = 'bold';

        // other
        if (IsPreferenceEnabled (ThisSection.FullName,'Remove underlines from links'))
            ThisElement.style.textDecoration = 'none';
    }
}

function SetElementColors (ThisElement,BackgroundColorPreference,FontColorPreference)
{
    if (ThisElement instanceof jQuery)
    {
        if (BackgroundColorPreference && IsPreferenceEnabled (BackgroundColorPreference))
            ThisElement.css ('background-color',GetPreferenceValue (BackgroundColorPreference));
        if (FontColorPreference && IsPreferenceEnabled (FontColorPreference))
            ThisElement.css ('color',GetPreferenceValue (FontColorPreference));
    }
    else
    {
        if (BackgroundColorPreference && IsPreferenceEnabled (BackgroundColorPreference))
            ThisElement.style.backgroundColor = GetPreferenceValue (BackgroundColorPreference);
        if (FontColorPreference && IsPreferenceEnabled (FontColorPreference))
            ThisElement.style.color = GetPreferenceValue (FontColorPreference);
    }
}

function ApplyPreferencesToTableFormatting (ThisTable)
{
    ApplyPreferenceSectionToElement ('Table style',ThisTable);
    ApplyPreferenceSectionToElement ('Table style.Font',ThisTable);
    SetElementColors (ThisTable,'Table style.Colors.Background','Table style.Colors.Standard text');

    ThisTable.css('border-collapse','collapse');    
    if (!IsPreferenceEnabled ('Table style','Show borders between columns'))
        ThisTable.attr('border', '0');
    ThisTable.css('border','medium solid black');    
    ThisTable.find ('tr:eq(0)').css('border','medium solid black');    

    ThisTable.find ('td,th').each (function(){
        $(this).css('padding', '1px 5px');
        $(this).css('border-bottom', 'thin solid silver');
        $(this).css ('white-space','nowrap');
    });
}

function TestPreferences ()
{
    InitialisePreferencesModule ();
    with (AddPreferencesSection ('General'))
    {
        AddPreference ('Refresh page every (this many) minutes',PreferenceTypeOnOffPlusValue,true,{DefaultValue: '5', ValueEditElementWidth: 'Small'});
    }

    with (AddPreferencesSection ('Automated message processing'))
    {
        with (AddSection ('Mark messages as read'))
        {
            AddPreference ('If subject contains any of',PreferenceTypeValue,true,{ValueEditElementWidth: 'Large'});
            AddPreference ('But does not contain any of',PreferenceTypeValue,true,{ValueEditElementWidth: 'Large'});
        }

        AddSection ('Delete messages',{Enabled: false, AsCloneOf: 'Automated message processing.Mark messages as read'});
        AddSection ('Show message content',{Enabled: false, AsCloneOf: 'Automated message processing.Mark messages as read'});
    }

    with (AddPreferencesSection ('Table Style',{AsCloneOf: 'Default table style'}))
    {
    }

    LoadPreferences (psLocalStorage);
    OpenPreferencesDiv (ScriptControlPanel);
}

function InitialiseRootAndTemplatePreferences ()
{
    PreferencesSectionsArray.length = 0;
    if (MachinaModule)
        RootPreferencesSection = AddPreferencesSection (MachinaModule + '.Preferences');
    else
        RootPreferencesSection = AddPreferencesSection ('Preferences');

    with (AddPreferencesSectionTemplate ('Default font template'))
    {
        AddPreference ('Font',PreferenceTypeOnOffPlusValue,true,{DefaultValue: 'Arial', ValueEditElementWidth: 'Medium'});
        AddPreference ('Size',PreferenceTypeOnOffPlusValue,true,{DefaultValue: '12px', SelectValueFrom: '6px|7px|8px|9px|10px|11px|12px|13px|14px|15px|16px|18px|20px|22px|24px|26px|28px|30px|32px',ValueEditElementWidth: 'Small'});
        AddPreference ('Bold',PreferenceTypeOnOff,true);
    }

    with (AddPreferencesSectionTemplate ('Default colors template'))
    {
        AddPreference ('Background',PreferenceTypeOnOffPlusValue,true,{ValueType: 'color', DefaultValue: '#F4EFDF'});
        AddPreference ('Standard text',PreferenceTypeOnOffPlusValue,true,{ValueType: 'color', DefaultValue: '#606060'});
        AddPreference ('Important text',PreferenceTypeOnOffPlusValue,true,{ValueType: 'color', DefaultValue: 'Black'});
    }

    with (AddPreferencesSectionTemplate ('Default style template'))
    {
        AddSection ('Font',{AsCloneOf: 'Default font template', ShowPreferencesAsInline: true});
        AddSection ('Colors',{AsCloneOf: 'Default colors template', ShowPreferencesAsInline: true});
        AddPreference ('Remove underlines from links',PreferenceTypeOnOff,true,{});
    }

    with (AddPreferencesSectionTemplate ('Default table style template',{AsCloneOf: 'Default style template'}))
    {
//        AddPreference ('Show borders between columns',PreferenceTypeOnOff,false,{});
    }
}

function InitialisePreferencesModule ()
{
    console.log ('Initialising Preferences module ..');
    InitialiseRootAndTemplatePreferences ();
    console.log ('Preferences module initialised.');
}
