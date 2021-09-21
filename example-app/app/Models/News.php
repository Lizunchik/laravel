<?php declare(strict_types=1);

namespace App\Models;

use Faker\Factory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

class News extends Model
{
   protected $table = "news";


   protected $fillable = [
	   'category_id', 'title', 'author', 'description'
   ];

   public function category(): BelongsTo
   {
	   return $this->belongsTo(Category::class, 'category_id', 'id');
   }
}