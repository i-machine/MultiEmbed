var PreferencesSectionsArray = [];
var PreferencesArray = [];
var PreferencesDivCopyOfPreferencesArray = [];
var PreferencesDiv;
var PreferenceTypeOnOff = 1;
var PreferenceTypeValue = 2;
var PreferenceTypeOnOffPlusValue = 3;
var LoadPreferenceDetailsAfterInitialising = true;
var RootPreferencesSection = null;

function InitialisedPreferencesSection (Name,Enabled,ParentSection)
{
    this.Name = Name;
    this.ParentSection = ParentSection || null;
    this.Sections = [];
    this.Preferences = [];
    this.SectionsAndPreferences = [];
    this.IsRoot = false;
    this.IsTemplate = false;
    this.ShowInPreferencesDiv = true;
    this.FullName = this.Name;
    this.SectionDiv = null;
    this.SectionPreferencesDiv = null;
    this.OverridesEnabled = Enabled;

    this.Enabled = function () {
        if (this.ParentSection != null && !this.ParentSection.Enabled ())
            return false;
        else
            return this.OverridesEnabled;
    };

    this.AddSection = function (Name,Enabled,CreateAsCloneOfThisSection)
    {
        var newSection = new InitialisedPreferencesSection (Name,Enabled,this);
        newSection.FullName = this.FullName + '.' + newSection.Name;
        if (this == RootPreferencesSection)
            newSection.IsRoot = true;
        this.Sections.push (newSection);
        this.SectionsAndPreferences.push (newSection);
        PreferencesSectionsArray.push (newSection);

        if (CreateAsCloneOfThisSection)
        {
//            console.log ('Adding Subsection "' + newSection.FullName + '" as clone of "' + CreateAsCloneOfThisSection.Name + '"');
            for (var cSOP = 0; cSOP < CreateAsCloneOfThisSection.SectionsAndPreferences.length; cSOP ++)
            {
                var tmpSectionOrPreference = CreateAsCloneOfThisSection.SectionsAndPreferences [cSOP];
                if (CreateAsCloneOfThisSection.Sections.indexOf (tmpSectionOrPreference) != -1)
                    newSection.AddSection (tmpSectionOrPreference.Name,tmpSectionOrPreference.OverridesEnabled,tmpSectionOrPreference);
                else
                    newSection.AddPreference (tmpSectionOrPreference.Name,tmpSectionOrPreference.PreferenceType,tmpSectionOrPreference.OverrideEnabled,{DefaultValue: tmpSectionOrPreference.DefaultValue, AllowedValues: tmpSectionOrPreference.AllowedValues, Inline: tmpSectionOrPreference.Inline, ValueEditWidth: tmpSectionOrPreference.ValueEditWidth});
            }
        }
        else
        {
//            console.log ('Adding Subsection "' + newSection.FullName + '"');
        }
        return newSection;
    };
    
    this.GetSection = function (Name)
    {
        var result = findObjectInArray (this.Sections,'Name',Name);
        return result;
    };

    this.AddPreference = function (Name,PreferenceType,Enabled,Options)
    {
//        console.log ('Adding preference "' + Name + '" to section "' + this.FullName + '"');
        var newPreference = new InitialisedPreference (Name,PreferenceType,Enabled,Options);
        newPreference.ParentSection = this;
        this.Preferences.push (newPreference);
        this.SectionsAndPreferences.push (newPreference);
        return newPreference;
    };
    
    this.GetPreference = function (Name)
    {
        return findObjectInArray (this.Preferences,'Name',Name);
    };
}

function AddPreferencesSection (Name,Enabled,CreateAsCloneOfThisSection)
{
    if (RootPreferencesSection == null)
    {
//        console.log ('Setting Root section "' + Name + '"');
        RootPreferencesSection = new InitialisedPreferencesSection (Name,Enabled,null);
        RootPreferencesSection.IsRoot = true;
        PreferencesSectionsArray.push (RootPreferencesSection);
        return RootPreferencesSection;
    }
    else
    {
        var result = RootPreferencesSection.AddSection (Name,Enabled,CreateAsCloneOfThisSection);
        result.IsRoot = true;
        return result;
    }
}

function AddPreferencesSectionTemplate (Name,Enabled,CreateAsCloneOfThisSection)
{
//    console.log ('Adding Section template "' + Name + '"');
    var result = AddPreferencesSection (Name,Enabled,CreateAsCloneOfThisSection);
    result.IsTemplate = true;
    result.ShowInPreferencesDiv = false;
    return result;
}

function GetPreferencesSection (FullName)
{
    var result = findObjectInArray (PreferencesSectionsArray,'FullName',FullName);
    if (result == null)
        result = findObjectInArray (PreferencesSectionsArray,'FullName',RootPreferencesSection.FullName + '.' + FullName);
    return result;
}

function InitialisedPreference (Name,PreferenceType,Enabled,Options)
{
    this.Name = Name;
    this.PreferenceType = PreferenceType;
    this.OverrideEnabled = Enabled;
    this.ParentSection = null;
    this.DefaultValue = Options.DefaultValue || '';
    this.AllowedValues = Options.AllowedValues || '';
    this.Notes = Options.Notes || '';
    this.Section_and_Name = '';
    this.RequiresThesePreferencesToBeEnabled = [];
    this.Value = this.DefaultValue;
    this.Inline = Options.Inline || false;
    this.ValueEditWidth = Options.ValueEditWidth || 'Medium';

    this.Enabled = function () {
        if (!this.AreAllRequiredPreferencesEnabled ())
            return false;
        else
            {
            if (this.ParentSection != null && !this.ParentSection.Enabled ())
                return false;
            else
                return this.OverrideEnabled;
        }
    };

    this.AreAllRequiredPreferencesEnabled = function () {
        for (var c = 0; c < this.RequiresThesePreferencesToBeEnabled.length; c++)
        {
            var tmpRP = this.RequiresThesePreferencesToBeEnabled [c];
            if (!tmpRP.Enabled ())
                return false;
        }
        return true;
    };
}

function GetPreference (FullSectionName,PreferenceName)
{
    var tmpSection = GetPreferencesSection (FullSectionName);
    if (tmpSection == null)
        return null;
    return tmpSection.GetPreference (PreferenceName);
}

function IsPreferenceEnabled (Section,PreferenceName)
{
    var tmpPreference = GetPreference (Section,PreferenceName);
    
    if (!tmpPreference)
        return false;
    
    if (tmpPreference.PreferenceType == PreferenceTypeValue)
        return (true);
    
    return (tmpPreference.Enabled() == true);
}

function GetPreferenceValue (Section,PreferenceName)
{
    var tmpPreference = GetPreference (Section,PreferenceName);
    
    if (!tmpPreference || !tmpPreference.Value)
        return '';
    
    return (tmpPreference.Value);
}

function SetPreferenceEnabled (Section,PreferenceName,Value)
{
    var tmpPreference = GetPreference (Section,PreferenceName);
    
    if (!tmpPreference)
        return false;
    
    if (isDefined (Value))
        tmpPreference.OverrideEnabled = Value;
    else
        tmpPreference.OverrideEnabled = PreferenceName;
}

function SetPreferenceValue (Section,PreferenceName,Value)
{
    var tmpPreference = GetPreference (Section,PreferenceName);
    
    if (!tmpPreference)
        return '';
    
    if (isDefined (Value))
        tmpPreference.Value = Value;
    else
        tmpPreference.Value = PreferenceName;
}

function InitialisePreference (SectionName,Name,PreferenceType,Enabled,Value,Notes)
{
    var tmpSection = GetPreferencesSection (SectionName);
    if (tmpSection == null)
        tmpSection = AddPreferencesSection (SectionName,true);
    NewPreference = tmpSection.AddPreference (Name,PreferenceType,Enabled,{DefaultValue: Value});
return;
    if (LoadPreferenceDetailsAfterInitialising)
    {
        var LocalStorageKey = GetLocalStorageKeyForPreference (NewPreference);
        var LocalStorageValue = localStorage.getItem (LocalStorageKey) || '';
        
        // if this preference has previously been saved, load it
        if (LocalStorageValue != '')
        {
            var PreferenceDetailsArray = LocalStorageValue.splitQuoted ();
            for (var cpd = 0; cpd < PreferenceDetailsArray.length; cpd++)
            {
                var PreferenceDetail = PreferenceDetailsArray [cpd].replace (/"/g,'');
                var PreferenceDetailKey = PreferenceDetail.split ('=') [0];
                var PreferenceDetailValue = PreferenceDetail.split ('=') [1];
                
                switch (PreferenceDetailKey)
                {
                    case 'Enabled':
                        if (NewPreference.PreferenceType == PreferenceTypeOnOff || NewPreference.PreferenceType == PreferenceTypeOnOffPlusValue)
                            NewPreference.OverrideEnabled = AreStringsBasicallyEqual (PreferenceDetailValue,'true');
                        break;
                    case 'Value':
                        if (NewPreference.PreferenceType == PreferenceTypeValue || NewPreference.PreferenceType == PreferenceTypeOnOffPlusValue)
                            NewPreference.Value = PreferenceDetailValue;
                        break;
                }
            }
        }
    }
    
    PreferencesArray.push (NewPreference);
    return NewPreference;
}

function GetLocalStorageKeyForPreference (Preference)
{
    var Key = '';
    
    Key = MachinaModule + '.Preferences.';
    if (Preference.Section != '')
        Key += Preference.Section + '.';
    Key += Preference.Name;
    
    return Key;
}

function SavePreferences ()
{
    for (var cPreference = 0; cPreference < PreferencesArray.length; cPreference++)
    {
        var Preference = PreferencesArray [cPreference];
        
        var LocalStorageKey = GetLocalStorageKeyForPreference (Preference);
        var LocalStorageValue = '';
        
        if (Preference.PreferenceType == PreferenceTypeOnOff || Preference.PreferenceType == PreferenceTypeOnOffPlusValue)
            LocalStorageValue += 'Enabled=' + Preference.OverrideEnabled;
        
        if (Preference.PreferenceType == PreferenceTypeValue || Preference.PreferenceType == PreferenceTypeOnOffPlusValue)
        {
            if (LocalStorageValue != '')
                LocalStorageValue += ',';
            LocalStorageValue += '"Value=' + Preference.Value + '"';
        }
        
        localStorage.setItem (LocalStorageKey,LocalStorageValue);
    }
}

function ApplyPreferencesChangesAndReloadPage ()
{
    CopyPreferencesDivValuesToPreferencesArray (PreferencesArray);
    SavePreferences ();
    location.reload ();
}

function ResetPreferencesChangesAndReloadPage ()

{
    if (confirm ('Reset preferences to defaults?') == true)
        {
        LoadPreferenceDetailsAfterInitialising = false;
        PreferencesArray.length = 0;
        InitialisePreferences ();
        SavePreferences ();
        location.reload ();
    }
}

function BuildDivsForSection (thisSection,DivIndent)
{
    thisSection.SectionDiv = document.createElement ('div');
    var tmpCheckBox = document.createElement ('input');
    tmpCheckBox.className = 'PreferencesSectionEnabledCheckBox';
    tmpCheckBox.type = 'checkbox';
    tmpCheckBox.style.marginRight = '5px';
//            tmpCheckBox.onclick = function () {HandlePreferenceEnabledCheckBoxClick ()};
    tmpCheckBox.checked = thisSection.OverridesEnabled;
    thisSection.SectionDiv.appendChild (tmpCheckBox);
    thisSection.SectionDiv.appendChild (document.createTextNode (thisSection.Name));

    thisSection.SectionPreferencesDiv = document.createElement ('div');
    thisSection.SectionPreferencesDiv.style.marginTop = '5px';
    thisSection.SectionDiv.appendChild (thisSection.SectionPreferencesDiv);

    if (thisSection.ParentSection == null)
    {
        PreferencesDiv.appendChild (thisSection.SectionDiv);
    }
    else
    {
//        thisSection.SectionDiv.style.marginLeft = '30px';
        thisSection.ParentSection.SectionPreferencesDiv.appendChild (thisSection.SectionDiv);
    }
    
    if (thisSection.IsRoot)
    {
        thisSection.SectionDiv.style.fontSize = '14px';
        thisSection.SectionDiv.style.marginTop = '12px';
        thisSection.SectionDiv.style.marginBottom = '30px';
//        thisSection.SectionDiv.style.border = 'thin solid silver';
        thisSection.SectionPreferencesDiv.style.marginTop = '5px';
    }
    else
    {
        thisSection.SectionDiv.style.position = 'relative';
        thisSection.SectionDiv.style.left = (20 * (DivIndent - 1)) + 'px';
        thisSection.SectionDiv.style.fontSize = '12px';
        thisSection.SectionDiv.style.marginTop = '15px';
        thisSection.SectionDiv.style.marginBottom = '10px';
    }

    for (var cSOP = 0; cSOP < thisSection.SectionsAndPreferences.length; cSOP ++)
    {
        var tmpSectionOrPreference = thisSection.SectionsAndPreferences [cSOP];
        if (thisSection.Sections.indexOf (tmpSectionOrPreference) != -1)
        {
            var tmpSection = tmpSectionOrPreference;
            
            if (tmpSection.ShowInPreferencesDiv)
                BuildDivsForSection (tmpSection,DivIndent + 1);

        }
        else
        {
            var tmpPreference = tmpSectionOrPreference;

            var PreferenceDiv = document.createElement ('div');
            thisSection.SectionPreferencesDiv.appendChild (PreferenceDiv);
            
            PreferenceDiv.style.fontSize = '12px';
            PreferenceDiv.style.marginBottom = '5px';
            if (tmpPreference.Inline)
                {
                PreferenceDiv.style.position = 'relative';
                PreferenceDiv.style.left = (20 * (DivIndent - 2)) + 'px';
                PreferenceDiv.style.marginLeft = '40px';
                PreferenceDiv.style.display = 'inline-block';
            }
            else
                {
                PreferenceDiv.style.position = 'relative';
                PreferenceDiv.style.left = (20 * (DivIndent)) + 'px';
                PreferenceDiv.style.display = 'block';
            }

            if (tmpPreference.PreferenceType == PreferenceTypeOnOff || tmpPreference.PreferenceType == PreferenceTypeOnOffPlusValue)
            {
                var tmpCheckBox = document.createElement ('input');
                tmpCheckBox.className = 'PreferenceEnabledCheckBox';
                tmpCheckBox.type = 'checkbox';
                tmpCheckBox.style.marginRight = '5px';
    //            tmpCheckBox.onclick = function () {HandlePreferenceEnabledCheckBoxClick ()};
                tmpCheckBox.checked = tmpPreference.OverrideEnabled;
                PreferenceDiv.appendChild (tmpCheckBox);
            }

            if (!tmpPreference.Enabled ())
                PreferenceDiv.appendChild (document.createTextNode (tmpPreference.Name + ' DISABLED '));
            else
                PreferenceDiv.appendChild (document.createTextNode (tmpPreference.Name));

            if (tmpPreference.PreferenceType == PreferenceTypeValue || tmpPreference.PreferenceType == PreferenceTypeOnOffPlusValue)
            {
                var tmpTextBox = document.createElement ('input');
                tmpTextBox.className = 'PreferenceValueTextBox';
                tmpTextBox.type = 'text';
                tmpTextBox.style.position = 'relative';
                tmpTextBox.style.left = '10px';
                switch (GetTokenizedVersionOf (tmpPreference.ValueEditWidth,true,true))
                {
                    case 'small': tmpTextBox.style.width = '40px'; break;
                    case 'medium': tmpTextBox.style.width = '110px'; break;
                    case 'large': tmpTextBox.style.width = '400px'; break;
                    default:
                        tmpTextBox.style.width = '60px';
                }
                tmpTextBox.value = tmpPreference.Value;
                PreferenceDiv.appendChild (tmpTextBox);
            }            
        }
    }
}

function BuildPreferencesDiv ()
{
    PreferencesDiv = document.createElement ('div');
    PreferencesDiv.style.width='800px';
    PreferencesDiv.id = MachinaModule + 'PreferencesDiv';
    
    PreferencesDiv.style.border = 'thin solid black';
    PreferencesDiv.style.background = '#FFFFD4';
    PreferencesDiv.style.color = 'black';
    PreferencesDiv.style.fontFamily = 'arial';
    PreferencesDiv.style.fontSize = '12px';
    PreferencesDiv.style.fontWeight = 'bold';
    PreferencesDiv.style.marginTop = '15px';
    
    var tmpDiv = document.createElement ('div');
    
    tmpDiv.appendChild(document.createTextNode(MachinaModule + ' Preferences'));
    PreferencesDiv.appendChild(tmpDiv);
    tmpDiv.style.fontSize = '16px';
    
    var ApplyChangesButton = document.createElement ('input');
    PreferencesDiv.appendChild (ApplyChangesButton);
    ApplyChangesButton.type = 'button';
    ApplyChangesButton.value = 'Apply changes and reload page';
    ApplyChangesButton.onclick = function () {ApplyPreferencesChangesAndReloadPage ()};

    var ResetPreferencesButton = document.createElement ('input');
    PreferencesDiv.appendChild (ResetPreferencesButton);
    ResetPreferencesButton.type = 'button';
    ResetPreferencesButton.value = 'Reset preferences to defaults';
    ResetPreferencesButton.onclick = function () {ResetPreferencesChangesAndReloadPage ()};

    BuildDivsForSection (RootPreferencesSection,0);
    
return;

    var LastSection = 'notthesameasfirstsectionsoweforceanewsectiondiv';
    var SectionDiv;
    
    for (var cPreference = 0; cPreference < PreferencesArray.length; cPreference++)
    {
        var Preference = PreferencesArray [cPreference];
        
        if (Preference.Section != LastSection)
        {
            SectionDiv = document.createElement ('div');
            PreferencesDiv.appendChild (SectionDiv);
            LastSection = Preference.Section;
            
            SectionDiv.style.fontSize = '14px';
            SectionDiv.style.marginTop = '20px';
            SectionDiv.style.marginBottom = '10px';
//            SectionDiv.style.marginLeft = '15px';
            
            SectionDiv.appendChild (document.createTextNode (Preference.Section));
        }
        
        var PreferenceDiv = document.createElement ('div');
        SectionDiv.appendChild (PreferenceDiv);
        Preference.PreferenceDiv = PreferenceDiv;
        
        PreferenceDiv.style.fontSize = '12px';
        PreferenceDiv.style.marginTop = '5px';
        PreferenceDiv.style.marginLeft = '30px';
        
        var tmpCheckBox = document.createElement ('input');
        PreferenceDiv.appendChild (tmpCheckBox);
        tmpCheckBox.className = 'PreferenceEnabledCheckBox';
        tmpCheckBox.type = 'checkbox';
        tmpCheckBox.style.marginRight = '5px';
        tmpCheckBox.onclick = function () {HandlePreferenceEnabledCheckBoxClick ()};
        tmpCheckBox.checked = Preference.OverrideEnabled;
        
        var tmpTextNode = document.createTextNode (Preference.Name);
        PreferenceDiv.appendChild (tmpTextNode);
        tmpTextNode.className = 'PreferenceNameTextNode';
        
        var tmpTextBox = document.createElement ('input');
        PreferenceDiv.appendChild (tmpTextBox);
        tmpTextBox.className = 'PreferenceValueTextBox';
        tmpTextBox.type = 'text';
        tmpTextBox.style.position = 'relative';
        tmpTextBox.style.left = '10px';
        tmpTextBox.value = Preference.Value;
    }
    
    PreferencesDivCopyOfPreferencesArray = PreferencesArray.slice (0);
    RefreshPreferenceDivs ();
}

function HandlePreferenceEnabledCheckBoxClick ()
{
    CopyPreferencesDivValuesToPreferencesArray (PreferencesDivCopyOfPreferencesArray);
    RefreshPreferenceDivs ();
}

function RefreshPreferenceDivForThisPreference (Preference)
{
    // make whole div enabled/disabled based on RequiresThesePreferencesToBeEnabled
    var DoWeWantToEnableThisDiv = true;
    for (var cRP = 0; cRP < Preference.RequiresThesePreferencesToBeEnabled.length; cRP++)
    {
        var RP = Preference.RequiresThesePreferencesToBeEnabled [cRP];
    }
    
    var tmpCheckBox = Preference.PreferenceDiv.getElementsByClassName ('PreferenceEnabledCheckBox') [0];
    var tmpTextBox = Preference.PreferenceDiv.getElementsByClassName ('PreferenceValueTextBox') [0];
    var tmpNameTextNode = Preference.PreferenceDiv.getElementsByClassName ('PreferenceNameTextNode') [0];
    
    if (Preference.AreAllRequiredPreferencesEnabled())
        Preference.PreferenceDiv.style.color = 'black';
    else
        Preference.PreferenceDiv.style.color = '#666666';
    
    if (Preference.PreferenceType == PreferenceTypeValue)
        tmpCheckBox.disabled = true;
    else
        tmpCheckBox.disabled = !Preference.AreAllRequiredPreferencesEnabled();
    
    if (Preference.PreferenceType == PreferenceTypeOnOff)
        tmpTextBox.style.visibility = 'hidden';
    
    if (Preference.PreferenceType == PreferenceTypeValue || Preference.PreferenceType == PreferenceTypeOnOffPlusValue)
        tmpTextBox.disabled = !Preference.Enabled();

    if (Preference.Value.length <= 3)
        tmpTextBox.style.width = '40px';
    else if (Preference.Value.length <= 15)
        tmpTextBox.style.width = '120px';
        else
        tmpTextBox.style.width = '300px';
}

function RefreshPreferenceDivs ()
{
    for (var cPreference = 0; cPreference < PreferencesDivCopyOfPreferencesArray.length; cPreference++)
    {
        var Preference = PreferencesDivCopyOfPreferencesArray [cPreference];
        RefreshPreferenceDivForThisPreference (Preference);
    }
}

function CopyPreferencesDivValuesToPreferencesArray (ThisPreferencesArray)
{
    for (var cPreference = 0; cPreference < ThisPreferencesArray.length; cPreference++)
    {
        var Preference = ThisPreferencesArray [cPreference];
        
        var PreferenceDiv = Preference.PreferenceDiv;
        
        if (Preference.PreferenceType == PreferenceTypeOnOff || Preference.PreferenceType == PreferenceTypeOnOffPlusValue)
        {
            var tmpCheckBox = PreferenceDiv.getElementsByClassName ('PreferenceEnabledCheckBox') [0];
            Preference.OverrideEnabled = tmpCheckBox.checked;
        }
        if (Preference.PreferenceType == PreferenceTypeValue || Preference.PreferenceType == PreferenceTypeOnOffPlusValue)
        {
            var tmpTextBox = PreferenceDiv.getElementsByClassName ('PreferenceValueTextBox') [0];
            Preference.Value = tmpTextBox.value;
        }
    }
}

/*
Usage:
  InitialisePreferences ();
  BuildPreferencesDiv ();
  document.getElementById ('content').appendChild (PreferencesDiv);
*/

function InitialiseRootAndTemplatePreferences ()
{
    PreferencesSectionsArray.length = 0;
    RootPreferencesSection = AddPreferencesSection (MachinaModule,true);

    with (AddPreferencesSectionTemplate ('Default font',true))
    {
        AddPreference ('Name',PreferenceTypeOnOffPlusValue,true,{DefaultValue: 'Arial', Inline: true, ValueEditWidth: 'Medium'});
        AddPreference ('Size',PreferenceTypeOnOffPlusValue,true,{DefaultValue: '12px', AllowedValues: '8px,9px,10px,11px,12px,14px,16px,18px,20px',Inline: true, ValueEditWidth: 'Small'});
        AddPreference ('Bold',PreferenceTypeOnOff,false,{Inline: true});
    }

    with (AddPreferencesSectionTemplate ('Default colors',true))
    {
        AddPreference ('Background',PreferenceTypeOnOffPlusValue,true,{DefaultValue: '#FBF2E1', Inline: true, ValueEditWidth: 'Medium'});
        AddPreference ('Important text',PreferenceTypeValue,true,{DefaultValue: 'Black', Inline: true, ValueEditWidth: 'Medium'});
        AddPreference ('Non-important text',PreferenceTypeValue,true,{DefaultValue: '#606060', Inline: true, ValueEditWidth: 'Medium'});
    }

    with (AddPreferencesSectionTemplate ('Default style',true))
    {
        AddSection ('Default colors',true,GetPreferencesSection ('Default colors'));
        AddSection ('Default font',true,GetPreferencesSection ('Default font'));
        AddPreference ('Remove underlines',PreferenceTypeOnOff,true,{});
    }
    
    with (AddPreferencesSectionTemplate ('Default table style',true,GetPreferencesSection ('Default style')))
    {
        AddPreference ('Show borders between columns',PreferenceTypeOnOff,false,{});
    }
}

function TestPreferences ()
{
    InitialiseRootAndTemplatePreferences ();

    with (AddPreferencesSection ('General',true))
    {
        AddPreference ('Refresh page every (this many) minutes',PreferenceTypeOnOffPlusValue,true,{DefaultValue: '5', ValueEditWidth: 'Small'});
    }

    with (AddPreferencesSectionTemplate ('Automated message processing',true))
    {
        AddPreference ('If subject contains any of',PreferenceTypeValue,true,{ValueEditWidth: 'Large'});
        AddPreference ('But does not contain any of',PreferenceTypeValue,true,{ValueEditWidth: 'Large'});
    }

    with (AddPreferencesSection ('Automated message processing',true))
    {
        AddSection ('Mark messages as read',true,GetPreferencesSection  ('Automated message processing'));
        AddSection ('Delete messages',false,GetPreferencesSection  ('Automated message processing'));
        AddSection ('Show message content',false,GetPreferencesSection  ('Automated message processing'));
    }

    with (AddPreferencesSection ('Table Style',true,GetPreferencesSection ('Default table style')))
    {
    }

    BuildAndShowPreferencesDiv ();
/*
    var tmpSection = GetPreferencesSection ('Table style.Default font');
    console.log (tmpSection.FullName);
*/
}
