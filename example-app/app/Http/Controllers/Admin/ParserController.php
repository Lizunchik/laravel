<?php

namespace App\Http\Controllers\Admin;

use App\Contract\Parser;
use App\Jobs\NewsJob;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Resources;

class ParserController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
	 */
    public function __invoke(Request $request, Parser $service)
    {
		dd(Resources::all());
		/*$urls = [
			'https://news.yandex.ru/auto.rss',
			'https://news.yandex.ru/auto_racing.rss',
			'https://news.yandex.ru/army.rss',
			'https://news.yandex.ru/gadgets.rss',
			'https://news.yandex.ru/index.rss',
			'https://news.yandex.ru/martial_arts.rss',
			'https://news.yandex.ru/communal.rss',
			'https://news.yandex.ru/health.rss',
			'https://news.yandex.ru/games.rss',
			'https://news.yandex.ru/internet.rss',
			'https://news.yandex.ru/cyber_sport.rss',
			'https://news.yandex.ru/movies.rss',
			'https://news.yandex.ru/cosmos.rss',
		];*/
		$urls=Resources::all();
		foreach($urls as $url) {
			dispatch(new NewsJob($url->resource));
		}

		return back()->with('success', 'Новости добавлены в очередь');
    }
}