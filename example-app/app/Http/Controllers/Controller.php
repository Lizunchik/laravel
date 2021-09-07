<?php

namespace App\Http\Controllers;

use Faker\Factory;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
	use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
	protected $news;

	protected function createNews(): array
	{
		$faker = Factory::create('ru_RU');
		$data = [];
		$countNumber = mt_rand(5, 15);
		for ($i = 0; $i < $countNumber; $i++) {
			$data[] = [
				'id' => $i + 1,
				'category_id' => mt_rand(0, 15),
				'title' => $faker->jobTitle(),
				'description' => $faker->sentence(3),
				'author' => $faker->name(),
				'created_at' => now()
			];
		}
		return $data;
	}

	protected function getNews()
	{
		if (isset($this->news)) {
			return $this->news;
		} else {
			$this->news = $this->createNews();
		}

		return $this->news;
	}

	protected function getNewsByCategory(int $category_id): array{
		$result=[];
		if(!isset($this->news)) $this->news=$this->createNews();
		foreach ($this->news as $item) {
			if ($item['category_id']!=$category_id) continue;
			$result[]=$item;
		}
		return $result;
	}
	protected function getNewsByCategories(): array{
		$result=[];
		if(!isset($this->news)) $this->news=$this->createNews();
		foreach ($this->news as $item) {
			$result[]=$item['category_id'];
		}
		return $result;
	}

}
