<?php declare(strict_types=1);

namespace App\Contract;

use Laravel\Socialite\Contracts\User;

interface Social
{
	public function socialLogin(User $user): string;
}