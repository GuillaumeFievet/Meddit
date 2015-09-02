<?php
	
	$file = $_FILES['files']['tmp_name'][0] ;
	
	if (file_exists($file)) {		
		readfile($file) ;
	}