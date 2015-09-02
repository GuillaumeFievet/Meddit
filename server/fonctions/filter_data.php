<?php

	function filter_data($data) {
		
    	$data = str_replace(chr(226).chr(130).chr(172), "&euro;", $data) ;
    	$data = str_replace(chr(197).chr(147), "&oelig;", $data) ;
    	$data = str_replace(chr(197).chr(146), "&OElig;", $data) ;
    	$data = str_replace(chr(226).chr(128).chr(153), "'", $data) ;
    	$data = str_replace(chr(133), "...", $data) ;
	    
    	return $data ;
	}