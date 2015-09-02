<?php

ini_set('display_errors', 1);
/**
 * @author Julien Morel
 * @desc Cette classe gère le stockage d'image sur un ftp externe
 */
class storeEngine {
	
	private $remote_folder_image_path ;
	private $image_path ;
	private $conn_id ;
	private $fileName ;
	private $extension ;
	private $remote_image_path ;
	private $remote_image_url ;
	private $host ;
	
	public function __construct() {
		//initialisation des chemins
		$this->remote_folder_image_path = '/img/' ;
		$this->image_path = dirname(dirname(__DIR__)) . '/img/tmp/' ;
		echo image_path;
		$this->host = 'http://www.guillaume-fievet.fr/img/' ;
		//on se connecte au ftp
		$this->connectToFtp() ;
	}
	
	public function storeImage($fileTmpName) {
		//on vérifie que le fichier est bien une image
		if(exif_imagetype($fileTmpName)) {
			//on récupère l'extension de l'image			
			$info = new SplFileInfo($fileTmpName) ;
			$this->extension = $info->getExtension() ;
			//création du path de l'image
			self::createFolders() ;
			//upload de l'image
			$upload = ftp_put($this->conn_id, $this->remote_image_path, $fileTmpName, FTP_BINARY) ;
			//fermeture de la connexion
			ftp_close($this->conn_id) ;
			
			return $upload ? $this->remote_image_url : "Le fichier n'a pas pu être uploadé." ;
			
		} else return "Le fichier n'est pas une image." ;
	}
	
	private function connectToFtp() {
		//variables de connexion
		$ftp_server = "ftp.guillaume-fievet.fr" ;
		$ftp_user_name = "guillaume-fievet.fr" ;
		$ftp_user_pass = "session59" ;
		
		//connexion au serveur
		$this->conn_id = ftp_connect($ftp_server) or die(alert("nullllll")) ;
		//identification fpt
		ftp_login($this->conn_id, $ftp_user_name, $ftp_user_pass) ;
		//activation du mode passif
		ftp_pasv($this->conn_id, true) ;
	}
	
	private function createFolders() {
		//récupère le chemin où l'image sera stockée
		$folderName = self::getFolders() ;
		
		//on récupère le nom de chaque dossiers du chemin de l'image
		$folders = explode("/", $folderName) ;
		$path = $this->remote_folder_image_path ;
		
		//on créé chaque sous dossier avec un fichier vide
		foreach($folders as $folder ) {
			$path .= $folder . "/" ;
			ftp_mkdir($this->conn_id, $path) ;
			$this->addEmptyFile($path) ;
		}
		
		//on initialise les chemin complets de l'image (path et url)
		$this->remote_image_path = $path . $this->fileName ;
		$this->remote_image_url = $this->host . $folderName . '/' . $this->fileName ;
	}
	
	public function getFolders() {
		//initialisation de la variable qui va contenir le md5 du moment de création de l'image
		$md5 = md5(microtime(true)) ;
		//on coupe le md5 en 2 parties de 8 caractères chacunes
		$folders = str_split($md5, 8);
		//génération de la suite des dossiers où sera stockée l'image
		$folderName = $folders[0] . "/" . $folders[1] ;
		//on stocke le nom de l'image
		$this->fileName = $folders[2] . $folders[3] . '.' . $this->extension ;
		
		return $folderName ;
	}

	/**
	 * @desc Création d'un fichier index.html contenant les balises minimales + no-index, no-follow
	 * @param string $path : chemin où le fichier sera créé
	 */
	public function addEmptyFile($path) {
		$full_path = $path . "index.html" ;
		ftp_put($this->conn_id, $full_path, $this->image_path . 'index.html', FTP_ASCII) ;
	}
}