<?php
	
	$file = $_FILES['files']['tmp_name'][0] ;
	$fileName = $_FILES['files']['name'][0] ;
	
	$fileName = str_replace('.png', '.jpeg', $fileName) ;
	
	if (file_exists($file)) {
		$tmpPath = dirname(dirname(__FILE__)) . '/img/tmp/' . $fileName ;		
		if(move_uploaded_file($file, $tmpPath)) {
			$url = $_SERVER['HTTP_REFERER'] . 'img/tmp/' . $fileName ;
			echo json_encode(array('url' => $url, 'path' => $tmpPath)) ;
		}
	}