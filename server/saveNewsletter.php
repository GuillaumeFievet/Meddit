<?php

	require('../server/fonctions/filter_data.php') ;

	$html = filter_data($_POST['html']) ;
	$fileName = filter_data($_POST['fileName']) ;
	$file = str_replace('server', 'template', __DIR__) . '/tmp/' . $fileName . '.html' ;
	
	$fp = fopen($file, 'w') ;
	fwrite($fp, $html) ;
	fclose($fp) ;