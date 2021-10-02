<?php declare(strict_types=1);

namespace App\Services;

use App\Contract\Social;
use App\Models\User as Model;
use Laravel\Socialite\Contracts\User;
use Illuminate\Support\Facades\Auth;

class SocialService implements Social
{
   public function socialLogin(User $user): string
   {
	   $checkUser = Model::where('email', $user->getEmail())->first();
	   if($checkUser) {
		   $checkUser->name = $user->getName();
		   $checkUser->avatar = $user->getAvatar();

		   if($checkUser->save()) {
			   Auth::loginUsingId($checkUser->id);
			   return route('account');
		   }
	   }

	   throw new \Exception("Error social login");
   }
}