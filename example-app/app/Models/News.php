<?php declare(strict_types=1);

namespace App\Models;

use Faker\Factory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
   public static function getNews(): array
   {
	   $faker = Factory::create('ru_RU');
	   $data = [];
	   $countNumber = mt_rand(5,15);
	   for($i=0; $i<$countNumber; $i++) {
		   $data[] = [
			   'id' => $i+1,
			   'title' => $faker->jobTitle(),
			   'description' => "<strong>" . $faker->sentence(3) . "</strong>",
			   'author' => $faker->name(),
			   'created_at' => now()
		   ];
	   }
       

	   return $data;
   }
}