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

	public function show(int $id)
	{
		return view('news.show', [
			'id' => $id
		]);
	}
	public function getData(){
		return view('news.data');
	  }
}
