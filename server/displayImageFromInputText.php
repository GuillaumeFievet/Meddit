<?php
	
	$new_image_url = $_POST['new_image_url'] ;
	$fileName = basename($new_image_url) ;
	?>console.log(<?php echo $filename; ?>)<?php
	
	//si il y a un paramètre après l'extension du fichier, on l'enlève
	if(strpos($fileName, '?') !== false) {
		$part = explode('?', $fileName) ;
		$fileName = $part[0] ;
	}
	
	//chemin de la nouvelle image sur le serveur
	$tmpPath = dirname(dirname(__FILE__)) . '/img/tmp/' . $fileName ;
	
	//on copie l'image distante sur le serveur et on retourne son url & path
	if(copy($new_image_url, $tmpPath)) {
		$url = $_SERVER['HTTP_REFERER'] . 'img/tmp/' . $fileName ;
		$datas = json_encode(array('url' => $url, 'path' => $tmpPath)) ;
	}
?>

<script type="text/javascript">
	parent.displayImageToCrop({result:'<?php echo $datas ; ?>'}) ;
</script>