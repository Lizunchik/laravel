<?php declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;

class UploadService
{
	/**
	 * @param UploadedFile $file
	 * @param string $path
	 * @return string
	 * @throws \Exception
	 */
  public function upload(UploadedFile $file, string $path = 'news'): string
  {
     $originalExtension = $file->getClientOriginalExtension();
	 $fileName = uniqid("u_") . "." . $originalExtension;

	 if($filePath = $file->storeAs($path, $fileName, 'public')) {
		 return $filePath;
	 }

	 throw new \Exception("File not uploaded");
  }
}