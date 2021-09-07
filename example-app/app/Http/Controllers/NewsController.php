<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index()
	{
		return view('news.index', [
			'newsList' => $this->getNews()
		]);
	}
	public function main()
	{
		return view('news.main', [
			'newsList' => $this->getNews()
		]);
	}

	public function show(int $id)
	{
		return view('news.show', [
			'id' => $id
		]);
	}
	

	public function showNewsByCategory(int $id){
		return view('news.showNewsByCategory', [
			'newsList' => $this->getNewsByCategory($id)
		]);
	}

	public function showCategory(){
		return view('news.category', [
			'categoryList' => $this->getNewsByCategories()
		]);
	}
}