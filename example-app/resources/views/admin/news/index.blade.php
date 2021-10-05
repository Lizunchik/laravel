@extends('layouts.admin')
@section('content')
@section('title') Список новостей - @parent @stop

	<!-- Page Heading -->
	<div class="d-sm-flex align-items-center justify-content-between mb-4">
		<h1 class="h3 mb-0 text-gray-800">Список новостей</h1>
		<a href="{{ route('admin.news.create') }}" class="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
					class="fas fa-plus fa-sm text-white-50"></i> Добавить новость</a>
		<br>
		<a href="{{ route('admin.parser') }}">Спарсить новости</a>
	</div>
<div class="row">
<div class="col-md-12">
	@include('inc.messages')
<div class="table-responsive">
 <table class="table table-bordered">
	<thead>
	 <tr>
	  <th>#ID</th>
	  <th>Категория</th>
	  <th>Заголовок</th>
	  <th>Описание</th>
	  <th>Дата добавления</th>
	  <th>Управление</th>
	 </tr>
	</thead>

		 <tbody>
		 @forelse($newsList as $news)
		 <tr>
			 <td>{{ $news->id }}</td>
			 <td>{{ optional($news->category)->title }}</td>
			 <td>{{ $news->title }}</td>
			 <td>{!! $news->description !!}</td>
			 <td>{{ $news->created_at }}</td>
			 <td>
				  <a href="{{ route('admin.news.edit', ['news' => $news->id]) }}">Ред.</a>
				  &nbsp;
				  <a href="javascript:;" class="delete" rel="{{ $news->id }}">Уд.</a>
			 </td>
		 </tr>
		 @empty
			 <h2>Новостей нет</h2>
		 @endforelse
		 </tbody>

 </table>

	{!! $newsList->links() !!}
</div>
</div>
</div>
@endsection

@push('js')
	<script type="text/javascript">
		$(function() {

			$(".delete").on('click', function() {
				var id = $(this).attr("rel");
			    if(confirm("Подтверждаете удаление записи с #ID " + id)) {
				  $.ajax({
					type: "delete",
					headers: {
					   'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
					},
					url: "/admin/news/" + id,
					success: function (response) {
						alert("Запись успешно удалена");
						console.log(response);
					},
					error: function (error) {
						console.log(error);
					}
				});
			   }
			});
		});
	</script>
@endpush