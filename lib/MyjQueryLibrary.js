// ---------------------------------------------
// prototypes begin p.begin p.b pb
// ---------------------------------------------

jQuery.fn.extend ({
	setVisible: function (value)
	{
		if (value)
			this.show ();
		else
			this.hide ();
	},
	toggleVisible: function ()
	{
		this.setVisible (!doWeWantToDisplayElement (this));
	},
	changeClass: function (fromClass,toClass)
	{
		if (this.hasClass (fromClass))
			this.removeClass (fromClass);

		this.addClass (toClass);
	},
	setConditionalClass: function (className,condition)
	{
		if (condition)
			this.addClass (className);
		else
			this.removeClass (className);
	},
	reverse: function ()
	{
		return this.pushStack(this.get().reverse(), arguments);
	},
	appendNewElement: function (pElementType,Options)
	{
		var newElement = createElement (pElementType,Options);
		newElement.appendTo (this);
		return newElement;
	},
	tagName: function ()
	{
		return this.prop ('tagName');
	},
	isChecked: function ()
	{
		return this.is (':checked');
	},
	prependNewElement: function (pElementType,Options)
	{
		var newElement = createElement (pElementType,Options);
		newElement.prependTo (this);
		return newElement;
	},
	getLinks: function (hrefFilterStr)
	{
		results = jQuery.makeArray ();
		
		var hrefFilterStrLC = (hrefFilterStr || '').toLowerCase ();

		this.find ('a').each (function () {
			var DoWeWantThisLink = true;
			if (hrefFilterStrLC.length)
			{
				var hrefLC = this.attr ('href').toLowerCase ();
				if (hrefLC != hrefFilterStrLC)
					DoWeWantThisLink = false;
			}
			if (DoWeWantThisLink)
				results.push (this);
		});

		return results;
	}
});

// ---------------------------------------------
// prototypes end p.end p.e pe 
// functions begin f.begin f.b fb 
// ---------------------------------------------

function createElement (pElementType,Options)
{
	var ElementType = GetTokenizedVersionOf (pElementType);

	if (isNotDefined (Options))
		Options = {};

	switch (ElementType)
	{
		case 'checkbox':
		case 'radio':
		case 'textinput':
		case 'button':
			Options.InputType = ElementType;
			ElementType = 'input';
			break;

		default:
			break;
	}

	var newElementHTML = '';

	if (Options.Label)
		newElementHTML += '<label>';

	newElementHTML += '<' + ElementType;

	if (ElementType == 'input' && Options.InputType)
		newElementHTML += ' type="' + Options.InputType + '"';

	if (Options.ID)
		newElementHTML += ' id="' + Options.ID + '"';

	if (Options.ClassNames)
		newElementHTML += ' class="' + Options.ClassNames + '"';

	if (Options.Checked)
		newElementHTML += ' checked';

	if (Options.Value)
		newElementHTML += ' value="' + Options.Value + '"';

	if (Options.Style)
		newElementHTML += ' style="' + Options.Style + '"';

	newElementHTML += '>';


	if (Options.Label)
		newElementHTML += Options.Label;

	if (ElementType != 'input')
		newElementHTML += '</' + ElementType + '>';

	if (Options.Label)
		newElementHTML += '<label>';

console.log (newElementHTML);

	var newElement = $(newElementHTML);
	return newElement;
}

function doWeWantToDisplayElement (pElement)
{
	return !($(pElement).css ('display') == 'none' );
}

function resolve$Selector (selector,contextOrContexts,doGlobalSearchIfNothingFoundInContext)
{
	if (!isDefined (selector))
		return undefined

	if (isFunction (selector))
		return selector (contextOrContexts)
	else if (isJQueryElement (selector))
		return selector
	else if (isHtmlElement (selector))
		return $(selector)
	else if (isString (selector))
	{
		if (isDefined (contextOrContexts))
		{
			var contexts = valueToArray (contextOrContexts)

			for (var c = 0; c < contexts.length; c ++)
			{
				var context = contexts [c]

				if (!isDefined (context)) continue

				var $el = $(selector,context)

				if ($el.length)
					return $el
			}
			if (doGlobalSearchIfNothingFoundInContext)
				return $(selector)
		}
		else
			return $(selector)
	}

	return null
}
