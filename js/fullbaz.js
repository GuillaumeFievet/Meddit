//variables globales de l'appli
var element_lien_start, width, height ;
var is_valid_image = false ;
var is_responsive = false ;
var media_width_value = 0 ;
var doctype = false ;
var nb_variable = 0 ;
var image_clicked_real_width, image_clicked_real_height ;
var image_clicked_width, image_clicked_height ;
var image_wanted_width, image_wanted_height ;
var jcrop_api = false ;
var imageClicked = false ;
var imageClickedUrl = false ;
var osdToken ;
var containerwidth;

/* On surcharge la fonction du plugin jquery validate qui vérifie si une url est correcte.
   On encode l'url pour permettre d'utiliser des caractères spéciaux */
var urlFunctionPtr = $.validator.methods["url"];
$.validator.methods["url"] = function() {
    if(arguments.length > 0) {
        arguments[0] = encodeURI(arguments[0]);
    }

    return urlFunctionPtr.apply(this, arguments);
};

$(document).ready(function() {
	
	//active / désactive les variables utm en fonction de la checkbox
	$('#modify_utm').click(function() {
		if($(this).is(':checked')) {
			$('#utm_list').removeClass('dnone') ;
			$('.utm_variable').attr('disabled', false) ;
		} else {
			$('#utm_list').addClass('dnone') ;
			$('.utm_variable').attr('disabled', true) ;
		}
	}) ;
	
	//selectall sur le click d'un input avec une certaine classe
	$(".selectAll").click(function() {
	    if(!$(this).hasClass("selectedAll")) {
	        $(this).select();
	        $(this).addClass("selectedAll");
	    }
	});
	
	$(".selectAll").blur(function() {
	    if($(this).hasClass("selectedAll")) {
	        $(this).removeClass("selectedAll");
	    }
	});
	
	//ouverture modal pour importer une newsletter
	$('#open_importer').click(function() {
		location.hash = 'pop_importer' ;
	}) ;
	
	//ouverture modal pour exporter une newsletter
	$('#open_exporter').click(function() {
		location.hash = 'pop_add_utm' ;
	}) ;
	
	//ouvre un modal pr importer le code html d'une newsletter
	$('#open_import_html').click(function() {
		location.hash = 'pop_import_html' ;
	}) ;
	
	//quand on ferme les modaux, on vide les textarea
	$('.empty_pop').click(function() {
		$('#txtarea_code_html_import').val('') ;
		$('#txtarea_code_html_export').val('') ;
	}) ;
	
	//quand on ajoute le code html
	$('#add_import_html').click(function() {
		displayNewsletter($('#txtarea_code_html_import').val()) ;
		openDashboard() ;
	}) ;
	
	//ouvre un modal pr exporter le code html d'une newsletter
	$('#open_export_html').click(function() {
		$('#txtarea_code_html_export').val(getCleanedNewsletter($('#newsletter').clone())) ;
		location.hash = 'pop_export_html' ;
	}) ;
	
	//lorsqu'on valide le form d'ajout de variable dans les urls
	$('#form_add_utm').submit(function() {
		
		//on ajoute les utms renseignés
		if($('#modify_utm').is(':checked')) {
			$("a").each(function() {
  				$( this ).find('EREC-');
			});
			console.log($('#utm_source').val());
			console.log($('#utm_campaign').val());
		}
		
		location.hash = 'pop_exporter' ;
		
		return false ;
	}) ;
	
	//ajout d'un scrollbar
	$("#htmlContainer").mCustomScrollbar({
		scrollInertia : 0
	});
	
	//création d'un cookie pr stocker le nom temporaire de la newsletter
	var fileName = new Date().getTime() + '' + Math.floor(Math.random() * 1000000) ;
	if(!$.cookie('gn_tmp')) {
		$.cookie('gn_tmp', fileName, { expires: 365, path: '/' }) ;
	} else {
		//récupère et affiche le code html de la dernière newsletter modifiée si on le souhaite
		$('#open_last_news').click(function() {
			//affiche le bouton pour charger la dernière newsletter sauvegardée
			addLoadNewsletterButton() ;
			//affiche le bouton pour afficher la newsletter
			addDisplayNewsletterButton() ;
			//récupère le code html grâce au cookie
			calltemplate($.cookie('gn_tmp')) ;
		}) ;
		//on affiche l'overlay
		location.hash = 'pop_open_newsletter' ;
	}
	
	//charge un template depuis un fichier
	$('.import_file').fileupload({
		url: 'server/displayNewsletter.php'
	}).bind('fileuploaddone', function(e, data) {
		displayNewsletter(data.result) ;
		openDashboard() ;
		location.hash = '' ;
	}) ;
	
	//lorsqu'on modifie la newsletter
	$('#validator').click(function() {
		//on traite le contenu du textarea
		var html = $('#replacor').val()
								 .replace(/\r\n|\r|\n/g, '<br>')
								 .replace(/\s(.)$/, '&nbsp;$1') ;
		
		//on modifie la newsletter avec le contenu du textarea
		modifyTemplate(html) ;
	}) ;
	
	$('#save_newsletter').click(function() {
		//qd on sauvegarde la newsletter en mode responsive, c'est la version non responsive
		//qui est enregistrée (pr garder le max width)
		if(is_responsive) {
			//on duplique les éléments pour ne pas modifier la newsletter affichée
			var newsletter_non_responsive = $('#newsletter').clone() ;
			var style_non_responsive = $('#newsletter style').clone() ;
			//on modifie le max width du clone pr simuler une newsletter normale
			modifyMediaMaxWidth(style_non_responsive, media_width_value, false) ;
			$('style', newsletter_non_responsive).html(style_non_responsive.html()) ;
			//on sauvegarde la newsletter
			saveNewsletter(getCleanedNewsletter(newsletter_non_responsive)) ;
		} else {
			saveNewsletter(getCleanedNewsletter($('#newsletter').clone())) ;
		}
		//on affiche le bouton pour charger la dernière newsletter sauvegardée
		addLoadNewsletterButton() ;
		//on affiche le bouton pour afficher la newsletter
		addDisplayNewsletterButton() ;
	}) ;
	
	//téléchargement de la newsletter
	$("button[id^='download_']").click(function() {
		downloadNewsletter($(this).attr('id').substr(9)) ;
	}) ;
	
	//lorsqu'on ajoute une image : on la télécharge et on l'affiche
	$('#add_image').fileupload({
		url: 'server/displayImageFromInputFile.php'
	}).bind('fileuploaddone', function(e, data) {
		displayImageToCrop(data) ;
	}) ;
	
	//on reset tous les fomulaires
	resetToolBox() ;
	
	//message d'erreur
	$('#add_new_image_input_text').validate({
		messages: {
			new_image_url: "Cette URL est invalide"
		}
	}) ;
	
	//lorsqu'on se barre de l'input d'ajout d'image, on submit le formulaire
	$('#new_image_url').blur(function() {
		if($('#add_new_image_input_text').valid()) {
			$('#add_new_image_input_text').submit() ;
		}
	}) ;
}) ;

//affiche l'image ajoutée en prévisualisation pour la croper
var displayImageToCrop = function(datas) {
	//on récupère le chemin et url de l'image en json et on décode
	var result = jQuery.parseJSON(datas.result) ;
	//reset des informations de l'image d'avant
	resetImage() ;
	
	//si l'image pour la prévisualisation n'existe pas, on la crée
	if($('#imageDisplayed').length == 0) {
		$('#crop').prepend('<img id="imageDisplayed" />') ;
	}
	
	//affichage de l'image
	$('#imageDisplayed').one('load', function() {
		
		//si l'image est plus grande que son conteneur, on ajuste sa taille
		if($('#imageDisplayed').width() > $('#crop').width()) {
			$('#imageDisplayed').addClass('w100') ;
		}
		
		//informations à propos de l'image uploadée
		image_wanted_width = $('#imageDisplayed').width() ;
		image_wanted_height = $('#imageDisplayed').height() ;
		
		//on force la taille de l'image dans le DOM pour éviter que Jcrop n'en initialise une mauvaise
		$('#imageDisplayed').attr('width', image_wanted_width) ;
		$('#imageDisplayed').attr('height', image_wanted_height) ;
		
		//on envoie la taille affichée de l'image au formulaire
		$('#displayed_w').val(image_wanted_width) ;
		$('#displayed_h').val(image_wanted_height) ;
		
		//on envoie la taille voulue de l'image au formulaire
		$('#wanted_w').val(image_clicked_real_width) ;
		$('#wanted_h').val(image_clicked_real_height) ;
		
		//ajout du pluggin pour crop sur l'image
		jcrop_api = $.Jcrop('#imageDisplayed') ;
		
		jcrop_api.setOptions({
			aspectRatio: image_clicked_real_width / image_clicked_real_height,
			setSelect: [0, 0, image_clicked_width, image_clicked_height],
			onChange: showCoords,
			onSelect: showCoords
		}) ;
		
	}).attr('src', result.url) ;
	
	//mise en place de la prévisualisation
	imageClicked.wrap('<div style="width:' + image_clicked_width + 'px;height:' + image_clicked_height + 'px;overflow:hidden;"></div>') ;
	imageClicked.attr('src', result.url) ;
	
	$('#pathOfBigImage').val(result.path) ;
	
	is_valid_image = true ;
}

//fonction appelée après l'ajout d'une nouvelle image
//on affiche l'image choisie dans la newsletter
var addNewImage = function(url) {
	
	//si le lien de l'ancienne image est présente dans le css de la newsletter, on le remplace pour l'url de la nouvelle
	var new_style = $('#newsletter style').html().replace(imageClickedUrl, url) ;
	$('#newsletter style').html(new_style) ;
	
	//on met à jour le lien de l'image et sa balise alt
	imageClicked.attr('src', url) ;
	imageClickedUrl = url ;
	
	//on reset les infos utilisées pour le changement d'image
	resetImage() ;
	//on supprime l'iframe qui permet d'ajouter des images
	if($('#saveImage').length > 0) $('#saveImage').remove() ;
}

var modifyTemplate = function(html) {
	
	//on vérifie si il n'y a qu'un seul a dans le span
	if($("span.active").contents().length == 1 &&
	   $("span.active").children().length > 0 &&
	   $("span.active").children()[0].tagName == 'A') {
			//si oui, on met à jour le contenu du a
			$("span.active").children().html(html) ;
	} else {
			//sinon, le contenu du span
			$("span.active").html(html) ;
	}
	
	//message d'erreur
	$('#form_add_link').validate({
		messages: {
			linkreplacor: "Cette URL est invalide"
		}
	}) ;
	
	//si l'élément est dans un lien et qu'on le modifie par un lien valide, on le met à jour sinon on s'arrête là
	if(element_lien_start && $('#form_add_link').valid()) updateUrl() ;
	else return false ;
	
	//on met à jour l'image de la news
	if(is_valid_image) {
		//on récupère l'image cliquée ou alors l'image caché d'un lien (responsive)
		image = $("a.active").length == 0 ? $("img.active") : $("a.active").children() ;
		updateImage(image) ;
	}
	
	//si on modifie la balise alt de l'image, on la remplace
	if($('#alt_image').val().length > 0) {
		imageClicked.attr('alt', $('#alt_image').val()) ;
	}
	
	resetToolBox() ;
	
	//on enleve les classes css pour l'édition
	$('.active').removeClass("active addwiggle") ;
}

//ajoute le bouton pour charger la dernière newsletter sauvegardée
var addLoadNewsletterButton = function () {
	//si le bouton n'est pas déjà présent...
	if($('#load_newsletter').length == 0) {
		//...on l'ajoute dans le menu...
		$('#tools').append('<div class="mb20 pointer pa5 hovtool rad3" id="load_newsletter"><img src="img/loadfile.png" class="vamiddle"><span class="vamiddle ml5 fcf txtbold fs14">Charger</span></div>') ;
		//...et charge la dernière newsletter quand on clique dessus
		$('#load_newsletter').click(function() {
			calltemplate($.cookie('gn_tmp')) ;
		}) ;
	}
}

//ajoute le bouton pour afficher la dernière newsletter sauvegardée
var addDisplayNewsletterButton = function() {
	//si le bouton n'est pas déjà présent...
	if($('#display_newsletter').length == 0) {
		//...on l'ajoute dans le menu...
		$('#open_exporter').after('<div class="mb20 pointer pa5 hovtool rad3" id="display_newsletter" style="margin-top:60px;"><img src="img/loupe.png" class="vamiddle"><span class="vamiddle ml5 fcf txtbold fs14">Sauver&nbsp;&&nbsp;Afficher</span></div>') ;
		//...et on affiche la dernière newsletter sauvegardée quand on clique dessus
		$('#display_newsletter').click(function() {
			$('#save_newsletter').trigger('click') ;
			window.open(window.location.origin  + '/template/tmp/' + $.cookie('gn_tmp') + '.html') ;
		}) ;
	}
}

//vide tous les champs
var resetToolBox = function() {
	$('#replace_links').attr('checked', true) ;
	$('#replacor').val('') ;
	$('#linkreplacor').val('') ;
	$('#url_bold').attr('checked', false) ;
	$('#url_underline').attr('checked', false) ;
	$('#url_color').val('') ;
	$('#url_href').val('') ;
	$('#alt_image').val('') ;
	$('.buttonBalise').removeAttr('disabled') ;
	$('#previ_img').remove() ;
	$('#ratio_info').text('') ;
	$('#txtarea_code_html_import').val('') ;
	
	//on reset l'affichage des blocs
	$('#add_link').addClass('hide') ;
	$('#add_content').addClass('hide') ;
	$('#add_image').addClass('hide') ;
	$('#button_validator').addClass('hide') ;
	$('#intro').removeClass('hide') ;
	$('#show_url_options').addClass('hide') ;
	$('#ratio_info').removeClass('bgT');
	$('#ratio_info').removeClass('bgR');
	$('#toolBalise').removeClass('hide');
	$('#balise_url').removeClass('hide') ;
	
	//on reset la variable de validation de l'image
	is_valid_image = false ;
}

//ajoute le loader dans le dom
var loader = function() {
	$('body').append("<div id='load'></div>");
}

var openDashboard = function() {
	setTimeout(function() {
		$("#htmlContainer").removeClass('w0').addClass("w60");
	  	$('.asideMenu').children(".mt80").removeClass('mt80').addClass('mt20');
	  	$(".asideMenu #posLogo").removeClass("mt80").addClass("mt20");
	  	$(".asideMenu #posLogo .makeitflip").removeClass('makeitflip');
	  	$(".asideMenu #posLogo .logo").css('background-position','left center');
	
	  	$("#display_content").removeClass('w30').addClass('w80');
	  	$(".asideMenu .deleteMe").animate({
	  		opacity: 0
	  	}, 400, function() {
	  		setTimeout(function() {
	  			$(".asideMenu .deleteMe").remove();
	  			$("#tools_box").removeClass('hide') ;
	  			$("#tools").removeClass('hide') ;
	  		}, 500);
	  	});
	  	
	    $("#load").fadeOut("normal", function() {
	        $(this).remove();
	    });
	}, 500);
}

//affiche la nouvelle image ajoutée
var updateImage = function(image) {
	$('#add_new_image_input_file').submit() ;
}

/* bouton pour responsiver */
var responsiveit = function() {
	
	//on récupère le max-width de la newsletter actuel
	var mediaquery = $('#newsletter style').text() ;
	var re = new RegExp("@media .*","gi") ;
	//on récupère la taille de #newsletter à l'initiatlisation
	containerwidth = $('#newsletter').width();
	
	//si il y a le max width pour le responsive, on enclenche le bouton pour pouvoir l'afficher
	if(mediaquery.match(re)){
		//on récupère la valeur du max width
		media_width_value = mediaquery.match(re)[0].match(/max-width( )*?:( )*?[0-9]+/gi)[0].match(/[0-9]+$/g);
		//on ajoute le bouton pour responsiver si il n'existe pas déjà
		if($('#responsiveit').length == 0) {
			$('#tools').prepend('<div id="responsiveit" class="mb20 pointer pa5 hovtool rad3"><img src="img/responsive.png" class="vamiddle"><span class="vamiddle ml5 fcf txtbold fs14">Responsive</span></div>') ;
			//qd on clique sur le bouton, on modifie le max-width pour simuler l'affichage sur mobile de la newsletter
			$('#responsiveit').click(function() {
				modifyMediaMaxWidth($('#newsletter style'), media_width_value) ;
			});
		}
	} else {
		//on supprime le bouton pour responsiver
		$('#responsiveit').remove() ;
	}
};

var modifyMediaMaxWidth = function (style, media_width_value, modifyResponsive) {
	//option pour savoir si on doit modifier le visuel de la newsletter
	if(modifyResponsive == undefined) modifyResponsive = true ;
	//regexp qui match avec le max-width actuel pour le remplacer par celui du mobile
	var re2 = new RegExp("(@media .*max-width( )*?:( )*?)" + media_width_value, "gi") ;
	//regexp qui match avec le max-width mobile (10 000px) pour le remplacer par celui d'origine
	var re3 = new RegExp("(@media .*max-width( )*?:( )*?)" + 10000, "gi") ;
	//on récupère le code html du style de la newsletter
	var mediasize = style.html() ;
	//on met à jour la variable max-width
	if(!is_responsive) {
		style.html(mediasize.replace(re2, "$1" + 10000)) ;
		if(modifyResponsive) is_responsive = true ;
		$('#newsletter').animate({'width':'320px'});
	} else {
		style.html(mediasize.replace(re3, "$1" + media_width_value)) ;
		if(modifyResponsive) is_responsive = false ;
		$('#newsletter').animate({'width':containerwidth});
	}
}

//on retourne le code HTML propre de la newsletter
var getCleanedNewsletter = function(html) {
	//on vire tous les éléments d'édition
	html.find('*').not('style').contents().filter( function () {
		if($(this).parent('.editable').length > 0) $(this).unwrap() ;
	}) ;
	
	html.find(".editable").remove() ;
	//on supprime les classes css spécial pour l'édition
	html.find('.active').removeClass("active addwiggle") ;
	
	//on ne garde que le code html pur
	html = html.html() ;
	
	//on remet les balises d'origine
	html = html.replace(/<htmlfb/gi, '<html').replace(/<\/htmlfb/gi, '</html')
			   .replace(/bodyfb\[/gi, "body[").replace(/<bodyfb/gi, "<body").replace(/<\/bodyfb/gi, "</body")
			   .replace(/<headfb/gi, "<head").replace(/<\/headfb/gi, "</head")
			   .replace(/&amp;/g, '&') ;
	
	if(doctype) html = doctype + html ;
	
	return html ;
}

//on replace les balises html précédemment remplacées
var addBalises = function() {
	$("#newsletter *").html(function () {
		return $(this).html().replace(/\[br\]/gi, '<br>')
							 .replace(/{a\b([^{]*)}/gi, '<a$1>')
							 .replace(/{\/a}/gi, '</a>')
							 .replace(/\(b\)/gi, '<b>')
							 .replace(/\(\/b\)/gi, '</b>')
							 .replace(/\(u\)/gi, '<u>')
							 .replace(/\(\/u\)/gi, '</u>')
							 .replace(/\(i\)/gi, '<i>')
							 .replace(/\(\/i\)/gi, '</i>')
							 .replace(/\(s\)/gi, '<s>')
							 .replace(/\(\/s\)/gi, '</s>') ;
	}) ;
};

//ajout de la classe 'editable' sur tous les 'text node' de la newsletter
var addwrapeditable = function() {
	var title ;
	
	$('#newsletter *').not('style').contents().filter( function () {
		//si il y a un title, on garde la valeur
		if($(this)[0].tagName == 'TITLE') {
			title = $(this).text() ;
		}
		
		//pour chaque contenu, on l'entoure d'un élément spécial pour éditer
	    if (this.nodeType == Node.TEXT_NODE &&
	    	$.trim($(this).text()).length > 0) {
	    		$(this).wrap("<span class='editable'></span>")
	    }
	});
	
	//on remplace le title modifié par le title d'origine
	if(title) {
		$('#newsletter title').text(title) ;
	}
};

var updateUrl = function() {
	
	var nb_lien_identique = nbLiensIdentiques(element_lien_start) ;
	//on récupére l'url du textarea
	var url_end = $("#linkreplacor").val().replace(/&amp;/g, '&') ;
	
	//si l'url de départ et celle du textarea sont différentes...
	if(element_lien_start.attr('href') != url_end) {
		//...on ajoute le http:// si il n'est pas présent dans le lien...
		var lien_start = element_lien_start.attr('href') ;
		
		//...et si on veut tout remplacer...
		if($('#replace_links').is(':checked') && nb_lien_identique > 0) {
			//...on modifie tous les liens
			$('a').each(function() {
				if($(this).attr('href') == lien_start) {
					$(this).attr('href', url_end) ;
				}
			}) ;
		//...sinon uniquement le lien sélectionné
		} else {
			element_lien_start.attr('href', url_end) ;
		}
	}
}

var saveNewsletter = function(html) {
	//on affiche le loader
	loader() ;
	//on sauvegarde la newsletter
	$.ajax({
		type: 'POST',
		url: '/server/saveNewsletter.php',
		data: { html : html, fileName : $.cookie('gn_tmp') }
	})
	//si ça réussit ou échoue, on vire le loader
	.then(function() {
		$("#load").fadeOut("normal", function() {
	        $(this).remove();
	    });
	}) ;
}

var downloadNewsletter = function(type) {
	$('#contenu_newsletter').val(getCleanedNewsletter($('#newsletter').clone())) ;
	$('#file_type').val(type) ;
	$('#file_name').val($.cookie('gn_tmp')) ;
	$('#form_download_file').submit() ;
}

var displayNewsletter = function(data) {
	//on affiche le loader
	loader() ;
	//on stocke le doctype si besoin est
	if(data.match(/<!doctype[^>]+>/gi)) doctype = data.match(/<!doctype[^>]+>/gi)[0] ;
	else doctype = false ;
	
	data = data
			//on vire tous les sauts de ligne, retours chariot, tabulations...
			.replace(/[\r\n\t\v]/g, '')
			.replace(/<html/gi, "<htmlfb").replace(/<\/html/gi, "</htmlfb")
			.replace(/body\[/gi, "bodyfb[").replace(/<body/gi, "<bodyfb").replace(/<\/body/gi, "</bodyfb")
			.replace(/<head/gi, "<headfb").replace(/<\/head/gi, "</headfb")
			//on remplace les br par d'autres balises pour récupérer correctement le texte complet
			.replace(/<br\s*[\/]?>/gi,"[br]")
			//on remplace les <a par des {a sauf si il y a une image ou un span dedans pour placer correctement l'élément pour éditer par la suite
			.replace(/<a\b([^>]*)>(((?!<a\b|<img\b|<span\b).)*)<\/a>/gi, '{a$1}$2{/a}')
			.replace(/<b>(((?!<b>).)*)<\/b>/gi, '(b)$1(/b)')
			.replace(/<u>(((?!<u>).)*)<\/u>/gi, '(u)$1(/u)')
			.replace(/<s>(((?!<s>).)*)<\/s>/gi, '(s)$1(/s)')
			.replace(/<i>(((?!<i>).)*)<\/i>/gi, '(i)$1(/i)') ;
	
	//ajout du code html dans la page
	$("#newsletter").html(data) ;
	
	//ajout de la classe pour éditer sur les text nodes
	addwrapeditable();
	
	//mise en place du bouton responsive 
	responsiveit();
	
	//on remet les balises html comme avant
	addBalises();
	
	//on stop la redirection des éléments a de la newsletter
	$('#newsletter').on('click', 'a', function() {
		//si il y a une image invisible dans le a et que le a possède une image en background,
		//c'est pour le responsive, donc faut pouvoir modifier l'image quand même
		if($(this).children().length > 0 &&
		   $(this).children()[0].tagName == 'IMG' &&
		   $(this).css('background-image') != 'none') {
			if(!$(this).children().is(":visible")) {
				modifyImage($(this), $(this).children()) ;
			}
		}
		return false;
	});
	
	//qd on clique sur du texte editable
	$('.editable').click(function() {
		//on vide tous les champs
		resetToolBox() ;
		//on annule la sélection de l'image précédente au cas où
		resetImage() ;
		
		//l'élément actif devient celui qu'on a cliqué
		$('.active').removeClass("active addwiggle");
		$(this).addClass("active addwiggle");
		
		//on affiche les blocs correspondant
		$("#add_image").addClass('hide') ;
		$("#add_link").addClass('hide') ;
		$("#add_content").removeClass('hide') ;
		$("#intro").addClass('hide') ;
		$("#button_validator").removeClass('hide') ;
		
		//si dans l'élément actif il y a du texte vide, on le supprime
		$(this).contents().each(function(index, item) {
			if(item.nodeName == '#text' && item.nodeValue.trim().length == 0) {
				item.remove() ;
			}
		}) ;
		
		//on vérifie si il n'y a qu'un seul a dans le span
		if($(this).contents().length == 1 &&
		   $(this).children().length > 0 &&
		   $(this).children()[0].tagName == 'A') {
				var element = $(this).children() ;
		} else {
				var element = $(this) ;
		}
		
		//on affiche le contenu du texte sélectionné dans le textarea
		$("#replacor")
	    	.val($.trim(element.html()
		    	.replace(/\s{2,}/g, ' ')
		    	.replace(/&amp;/g, '&'))) ;
		
		//on affiche les informations sur le lien du text sélectionné si il y en a un
		displayClickedUrl(element) ;
		
		//si l'élément cliqué se trouve dans un lien, on enlève la balise URL de l'édition
		if(element_lien_start.length > 0) {
			$('#toolBalise').addClass('hide') ;
		}
	});
	
	//qd on clique sur les images
	$('#newsletter img').click(function() {
		modifyImage($(this), $(this)) ;
	}) ;
}

var modifyImage = function (item, image) {
	
	//on vide tous les champs
	resetToolBox() ;
	//on annule la sélection de l'image précédente au cas où
	resetImage() ;
	
	//on crée l'iframe qui permet d'ajouter la nouvelle image sur le serveur
	if($('#saveImage').length == 0) {
		$('#add_new_image_input_file').after('<iframe name="saveImage" id="saveImage" class="dnone"></iframe>') ;
	}
	
	//on stock l'image cliquée dans une variable globale
	imageClicked = image ;
	imageClickedUrl = image.attr('src') ;
	
	//on affiche les blocs correspondant
	$("#add_image").removeClass('hide') ;
	$("#add_link").addClass('hide') ;
	$("#add_content").addClass('hide') ;
	$("#intro").addClass('hide') ;
	$("#button_validator").removeClass('hide') ;
	
	//l'élément actif devient celui qu'on a cliqué
	$('.active').removeClass("active addwiggle");
	item.addClass("active addwiggle");
	
	//on affiche les informations sur le lien de l'image si il y en a un
	displayClickedUrl(image) ;
	
	//on récupère la taille affichée de l'image
	image_clicked_width = image.width() ;
	image_clicked_height = image.height() ;
	
	//on crée une image temporaire pour récupérer la taille exacte de l'image sur laquelle on a cliqué
	var tmp_img = new Image() ;
	tmp_img.src = imageClickedUrl ;
	tmp_img.onload = function() {
		//on affiche les informations de l'image
		image_clicked_real_width = this.width ;
		image_clicked_real_height = this.height ;
		$('#taille_image_mini').text(image_clicked_real_width + ' x ' + image_clicked_real_height) ;
	} ;
	
	//on affiche la balise alt de l'image dans le formulaire
	$('#alt_image').val(image.attr('alt')) ;
}

//on reset tous ce qui touche à l'ancienne image
var resetImage = function () {
	
	//si il y a déjà une instance de jcrop...
	if(jcrop_api) {
		//...on la supprime de l'ancienne image
		jcrop_api.destroy() ;
		
		//reset de la position de l'ancienne image
		imageClicked.css({
			width: '',
			height: '',
			marginLeft: '',
			marginTop: ''
		}) ;
		
		//suppression de la prévisualisation de l'image
		$('#imageDisplayed').remove() ;
		
		//reset des informations de l'ancienne image
		$('#pathOfBigImage').val('') ;
		image_wanted_width = false ;
		image_wanted_height = false ;
		
		//si l'image ajoutée n'a pas été validée, on remet l'url précédente
		if(imageClicked.attr('src') != imageClickedUrl) {
			imageClicked.attr('src', imageClickedUrl) ;
		}
		
		//si l'image a été ajouté précédemment par l'upload, on vire le div qui l'entoure
		if(imageClicked.parent()[0].tagName == 'DIV') imageClicked.unwrap() ;
	}
}

//place les coordonnées de la sélection de l'image dans des champs cachés
var showCoords = function(c) {
	$('#x1').val(c.x) ;
	$('#y1').val(c.y) ;
	$('#w').val(c.w) ;
	$('#h').val(c.h) ;
	
	var rx = image_clicked_width / c.w ;
	var ry = image_clicked_height / c.h ;
	
	imageClicked.css({
		width: Math.round(rx * image_wanted_width) + 'px',
		height: Math.round(ry * image_wanted_height) + 'px',
		marginLeft: '-' + Math.round(rx * c.x) + 'px',
		marginTop: '-' + Math.round(ry * c.y) + 'px'
	}) ;
}

var calltemplate = function(fileName) {
	$.ajax({
		url : "template/tmp/" + fileName + ".html?" + new Date().getTime(),
		dataType: "text",
		success : function (data) {
			displayNewsletter(data) ;
		}
	}).done(function() {
		openDashboard() ;
	}) ;
}

//affiche dans le formulaire le lien + le nb de liens identiques
var displayClickedUrl = function (item) {
	element_lien_start = item.closest($('a')) ;
	
	if(element_lien_start.length > 0) {
		$('#add_link').removeClass('hide') ;
		$("#linkreplacor").val(element_lien_start.attr("href")) ;
		var nb = nbLiensIdentiques(element_lien_start) ;
		if(nb < 0) nb = 0 ;
		$('#nb_lien_identique').text(nb) ;
	}
}

var nbLiensIdentiques = function(lien) {
	var nb = 0 ;
	$('a').each(function() {
		if($(this).attr('href') == lien.attr('href')) {
			nb++ ;
		}
	}) ;
	return nb - 1 ;
}
