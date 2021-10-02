<?php

namespace App\Http\Controllers;

use App\Contract\Social;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
class SocialController extends Controller
{
    public function start()
	{
		return Socialite::driver('vkontakte')->redirect();
	}

	public function callback(Social $service)
	{
		try {
			return redirect($service->socialLogin(
				Socialite::driver('vkontakte')->user()
			));
		}catch (\Exception $e) {
			Log::error($e->getMessage());
		}
	}
}