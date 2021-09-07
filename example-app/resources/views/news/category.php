<?php foreach($categoryList as $category): ?>
  <div>
      <h2><a href="<?=route('news.showNewsByCategory', ['id' => $category])?>"><?=$category?></a></h2>
  </div><br>
<?php endforeach; ?>