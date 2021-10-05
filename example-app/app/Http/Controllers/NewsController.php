<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index()
	{
		return view('news.index', [
			'newsList' => News::paginate(
				config('news.paginate')
			)
		]);
	}

	public function show(int $id)
	{
		return view('news.show', [
			'id' => $id
		]);
	}
}