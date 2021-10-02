<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\Admin\IndexController as AdminController;
use App\Http\Controllers\Account\IndexController as AccountController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Admin\RolesController as AdminRolesController;
use App\Http\Controllers\SocialController as SocialController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
	return view('welcome');
});

//auth
Route::group(['middleware' => 'auth'], function () {
	Route::get('/account', AccountController::class)
		->name('account');
	Route::get('/logout', function () {
		Auth::logout();
		return redirect()->route('login');
	})->name('logout');

	//admin
	Route::group(['prefix' => 'admin', 'as' => 'admin.', 'middleware' => 'admin'], function () {
		Route::get('/', AdminController::class)
			->name('index');
		Route::resource('categories', AdminCategoryController::class);
		Route::resource('news', AdminNewsController::class);
		Route::resource('roles', AdminRolesController::class);

		Route::get('/parser', App\Http\Controllers\Admin\ParserController::class)
			->name('parser');
	});
});




//news
Route::get('/news', [NewsController::class, 'index'])
	->name('news');
Route::get('/news/{id}', [NewsController::class, 'show'])
	->where('id', '\d+')
	->name('news.show');

Route::group(['middleware' => 'guest'], function () {
	Route::get('/vk/start', [SocialController::class, 'start'])
		->name('vk.start');
	Route::get('/vk/callback', [SocialController::class, 'callback'])
		->name('vk.callback');
});


Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])
	->name('home');
