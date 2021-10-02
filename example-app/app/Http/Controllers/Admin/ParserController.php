<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ParserService;
use App\Contract\Parser;
use Illuminate\Http\Request;
use App\Models\News;

class ParserController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function __invoke(Request $request, Parser $service)
    {
       // dd($service->parse('https://news.yandex.ru/music.rss')['news']);
        $news = $service->parse('https://news.yandex.ru/music.rss')['news'];
        foreach($news as $item){
            $item['category_id'] = 1;
            $elem = News::create($item);
        }

    }
}
