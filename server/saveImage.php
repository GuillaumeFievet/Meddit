<?php

//décommenter pour afficher les erreurs
//	ini_set('display_errors', 1) ;
//	error_reporting(E_ALL) ;

	require_once 'libs/storeEngine.php' ;
	alert('ok');
	
	//initialisation de variables pour copier l'image croppée correctement
	$img_quality = 100 ;
	$info = new SplFileInfo($_POST['pathOfBigImage']) ;
	$src = $_POST['pathOfBigImage'] ;
	$dst = str_replace('.' . $info->getExtension(), '_cropped.' . $info->getExtension(), $src) ;
	list($r_width, $r_height) = getimagesize($src) ;
	$w_width = $_POST['wanted_w'] ;
	$w_height = $_POST['wanted_h'] ;
	
	//on récupère les coordonnées exact en fonction de la vrai taille de l'image
	$x1 = round($_POST['x1'] / $_POST['displayed_w'] * $r_width) ;
	$y1 = round($_POST['y1'] / $_POST['displayed_h'] * $r_height) ;
	$width = round($_POST['w'] / $_POST['displayed_w'] * $r_width) ;
	$height = round($_POST['h'] / $_POST['displayed_h'] * $r_height) ;
	
	//on récupère le contenu de l'image et on en crée une ressource gd
	$string_img = file_get_contents($src) ;
	$img_r = imagecreatefromstring($string_img) ;
	
	//création de la ressource image
	$dst_r = imagecreatetruecolor($w_width, $w_height) ;
	
	//on récupère l'image cropée grâce à la sélection
	imagecopyresampled($dst_r, $img_r, 0, 0, $x1, $y1,
	    $w_width, $w_height, $width, $height) ;
	
	//enregistrement de l'image cropée sur le serveur en fonction de l'extension
	switch(exif_imagetype($src)) {
//		case IMAGETYPE_BMP : 'format non accepté' ; break ;
		case IMAGETYPE_JPEG : imagejpeg($dst_r, $dst, $img_quality) ; break ;
		case IMAGETYPE_GIF : imagegif($dst_r, $dst) ; break ;
		case IMAGETYPE_PNG : imagejpeg($dst_r, $dst, $img_quality) ; break ;
	}
	
	//copie de l'image nouvellement créée sur le ftp
	$storeEngine = new storeEngine() ;
	$url = $storeEngine->storeImage($dst) ;
	//suppression des images temporaires liées au cropage
	unlink($src) ;
	unlink($dst) ;
?>

<script type="text/javascript">
	parent.addNewImage('<?php echo $url ; ?>') ;
</script>