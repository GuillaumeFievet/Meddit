<?php

	require('/fonctions/filter_data.php') ;
	
	$html = filter_data($_POST['contenu_newsletter']) ;
	$file_type = filter_data($_POST['file_type']) ;
	$file_name = filter_data($_POST['file_name']) ;
	
	$fileName = $file_name . '.' . $file_type ;
	$file = str_replace('server', 'template', __DIR__) . '/tmp/' . $fileName ;
	
	$fp = fopen($file, 'w') ;
	fwrite($fp, $html) ;
	fclose($fp) ;
	
	if (file_exists($file)) {
	    header('Content-Description: File Transfer');
	    header('Content-Type: application/octet-stream');
	    header('Content-Disposition: attachment; filename=' . basename($file));
	    header('Expires: 0');
	    header('Cache-Control: must-revalidate');
	    header('Pragma: public');
	    header('Content-Length: ' . filesize($file));
	    ob_clean();
	    flush();
	    readfile($file);
	    exit;
	}