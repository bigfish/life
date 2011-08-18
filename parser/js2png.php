<?php

$filename = "metadata.js";

if (file_exists($filename)) {

	$iFileSize = filesize($filename);
	
	$iWidth = ceil(sqrt($iFileSize / 1));
	$iHeight = $iWidth;

	$im = imagecreatetruecolor($iWidth, $iHeight);

	$fs = fopen($filename, "r");
	$data = fread($fs, $iFileSize);
	fclose($fs);

	$i = 0;

	for ($y=0;$y<$iHeight;$y++) {
		for ($x=0;$x<$iWidth;$x++) {
			$ord = ord(substr($data, $i, 1));
			imagesetpixel($im, 
				$x, $y,
				imagecolorallocate($im,
					$ord,
					$ord,
					$ord
				)
			);
			$i++;
		}
	}

	header("Content-Type: image/png");
	imagepng($im);
	imagedestroy($im);
}

?>

