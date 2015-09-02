$(document).ready(function() {
	//mise en place des événements sur les balises
	$('.buttonBalise').click(function() {
		
		if(this.id == 'balise_url') {
			displayBlocUrl() ;
		} else {
			ajout_balise($('#replacor'), this);
		}
	}) ;
	
	$('#colorSelector').ColorPicker({
		color: '#0000ee',
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide: function (colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$('#colorSelector div').css('backgroundColor', '#' + hex) ;
			$('#url_previ').css('color', '#' + hex) ;
		}
	}) ;
	
	$('#add_url_options').submit(function() {
		
		var options = new Array() ;
		if($('#colorSelector div').css('backgroundColor')) options.push('color:' + $('#colorSelector div').css('backgroundColor') + ';') ;
		if($('#url_bold').is(':checked')) options.push('font-weight:bold;') ;
		if($('#url_underline').is(':checked')) options.push('text-decoration:underline;')
		else options.push('text-decoration:none;')
		
		ajout_balise($('#replacor'), document.getElementById('balise_url'), options) ;
		
		return false ;
	}) ;
	
	$('#annuler_url_options').click(function() {
		$('#toolBalise').removeClass('hide') ;
		$('#show_url_options').toggleClass('hide') ;
	}) ;
	
	//quand on coche la checkbox, on met à jour la prévisualisation
	$('#url_bold').bind('click', function() {
		if($(this).is(':checked')) {
			$('#url_previ').css('font-weight', 'bold') ;
		} else {
			$('#url_previ').css('font-weight', '') ;
		}
	}) ;
	
	//quand on coche la checkbox, on met à jour la prévisualisation
	$('#url_underline').bind('click', function() {
		if($(this).is(':checked')) {
			$('#url_previ').css('text-decoration', 'underline') ;
		} else {
			$('#url_previ').css('text-decoration', 'none') ;
		}
	}) ;
	
	$('#url_href').blur(function() {
		$('#url_previ').attr('href', $(this).val()) ;
	}) ;
}) ;

var displayBlocUrl = function() {
	$('#show_url_options').toggleClass('hide') ;
	//$('.buttonBalise').attr('disabled', 'disabled') ;
	$('#toolBalise').addClass('hide');
	
	$('#replacor').mouseup(function() {
		var selection = $(this).selection() ;		
		$('#url_previ').text(selection) ;
	}) ;
}

function ajout_balise(textarea, balise, options) {
	
	var position ;
	var attributes = '' ;
	
	for(var key in options) {
		
		if(key == 0) attributes = ' style="' ;
		attributes += options[key] ;
		if(key == options.length -1) attributes += '"' ;
	}
	
	//si il s'agit d'un lien, on ajout un target _blank
	if(balise.name == 'a') {
		
		var href = $('#url_href').val() ;
		if(href && !href.match(/^http(s)?:\/\//i)) href = 'http://' + href ;
		attributes += ' target="_blank" href="' + href + '"' ;
	}
	
	//si le navigateur supporte l'objet selection (IE)
	if(document.selection)
	{
		textarea.focus();
		var range = document.selection.createRange().text;
		
		//si il n'y a pas de texte selectionné
		if(range.length == 0)
		{
			//variable contenant l'expression régulière : caractère 'étoile' est présent
			var expression = /\*/;
		
			//si la valeur de la balise contient une étoile ...
			if(expression.test(balise.val()))
			{
				//  ... on l'enlève ...
				balise.val() = balise.val().replace(/\*/, "");
				
				// ... et on ajoute une balise fermante dans le textarea ...
				document.selection.createRange().text = "</"+balise.name+">";
			}
			// ... sinon ...
			else
			{
				//...si il s'agit d'un lien
				if(balise.name == 'a') {
					// ... on ajoute une balise d'ouverture et de fermeture
					document.selection.createRange().text = "<" + balise.name + attributes + "></" + balise.name + ">" ;
				} else {
					// ... sinon on ajoute l'étoile ...
					balise.val() += "*";
					// ... et une balise d'ouverture
					document.selection.createRange().text = "<" + balise.name + attributes + ">" ;
				}
			}
		}
		else
		{
			document.selection.createRange().text = "<" + balise.name + attributes + ">" + range + "</" + balise.name + ">" ;
		}
	}
	//si le navigateur supporte l'objet selectionStart/End (FF)
	else if(textarea.getSelectionStart() || textarea.getSelectionEnd())
	{
		var start = textarea.getSelectionStart();
		var end   = textarea.getSelectionEnd();
		
		//si il n'y a pas de texte selectionné mais que le curseur n'est pas tout au début du textarea
		if(start == end)
		{
			//variable contenant l'expression régulière : caractère 'étoile' est présent
			var expression = /\*/;
		
			//si la valeur de la balise contient une étoile ...
			if(expression.test(balise.value))
			{
				//  ... on l'enlève ...
				balise.value = balise.value.replace(/\*/, "");
				
				// ... et on ajoute une balise fermante dans le textarea ...
				textarea.val(textarea.val().substr(0, start) 
								 + "</"+balise.name+">" + textarea.val().substr(end, textarea.val().length));
				
				//la position du curseur avant de 3 caractères + la taille du nom de la balise
				position = end + 3 + balise.name.length + attributes.length ;
			}
			// ... sinon ...
			else
			{
				//si il s'agit d'un lien...
				if(balise.name == 'a') {
					// ... on ajoute une balise d'ouverture et de fermeture
					textarea.val(textarea.val().substr(0, start) 
									 + "<" + balise.name + attributes + ">" + textarea.val().substr(end, textarea.val().length)
									 + "</" + balise.name + ">") ;
				} else {
					// ... sinon on ajoute l'étoile ...
					balise.value += "*";
					
					// ... on ajoute une balise d'ouverture
					textarea.val(textarea.val().substr(0, start) 
									 + "<" + balise.name + attributes + ">" + textarea.val().substr(end, textarea.val().length)) ;
				}
							
				//la position du curseur avant de 2 caractères + la taille du nom de la balise
				position = end + 2 + balise.name.length + attributes.length ;
			}
		}
		//si il y a du texte selectionné, on entoure la sélection de balise ouvrante / fermante
		else
		{
			textarea.val(textarea.val().substr(0, start) 
							 + "<" + balise.name + attributes + ">" + textarea.val().substring(start,end) + "</"+balise.name+">"
							 + textarea.val().substr(end, textarea.val().length));
							 
			position = end + 5 + 2 * balise.name.length + attributes.length ;
		}
		
		textarea.focus();
		textarea.setSelection(position,position);
	}
	//si le curseur est placé tout au début du textarea
	else
	{
		//variable contenant l'expression régulière : caractère 'étoile' est présent
		var expression = /\*/;
	
		//si la valeur de la balise contient une étoile ...
		if(expression.test(balise.value))
		{
			//  ... on l'enlève ...
			balise.value = balise.val().replace(/\*/, "");
			
			// ... et on ajoute une balise fermante dans le textarea ...
			textarea.val("</"+balise.name+">" + textarea.val());
			
			//la position du curseur avant de 3 caractères + la taille du nom de la balise
			position = 3 + balise.name.length;
		}
		// ... sinon ...
		else
		{
			// ... si il s'agit d'un lien ...
			if(balise.name == 'a') {
				// ... on ajoute une balise d'ouverture et de fermeture
				textarea.val("<" + balise.name + attributes + ">" + textarea.val() + "</" + balise.name + ">");
			} else {
			
				// ... on ajoute l'étoile ...
				balise.value += "*";
				// ... et une balise d'ouverture
				textarea.val("<"+balise.name + attributes + ">" + textarea.val());
			}
			
			//la position du curseur avant de 2 caractères + la taille du nom de la balise
			position = 2 + balise.name.length + attributes.length ;
		}
		
		textarea.focus();
		textarea.setSelection(position,position);
	}
}

$.fn.setSelection = function(selectionStart, selectionEnd) {
	
    if(this.lengh == 0) return this;
    input = this[0];

    if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    } else if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }

    return this;
}

$.fn.getSelectionStart = function(){
	if(this.lengh == 0) return -1;
	input = this[0];
	//alert(input.id);
	var pos = input.value.length;
	 
	if (input.createTextRange) {
	var r = document.selection.createRange().duplicate();
	r.moveEnd('character', input.val().length);
	if (r.text == '')
	pos = input.val().length;
	pos = input.val().lastIndexOf(r.text);
	} else if(typeof(input.selectionStart)!="undefined")
	pos = input.selectionStart;
	 
	return pos;
	}

$.fn.getSelectionEnd = function(){
	if(this.lengh == 0) return -1;
	input = this[0];
	 
	var pos = input.value.length;
	 
	if (input.createTextRange) {
	var r = document.selection.createRange().duplicate();
	r.moveStart('character', -input.val().length);
	if (r.text == '')
	pos = input.val().length;
	pos = input.val().lastIndexOf(r.text);
	} else if(typeof(input.selectionEnd)!="undefined")
	pos = input.selectionEnd;
	 
	return pos;
}