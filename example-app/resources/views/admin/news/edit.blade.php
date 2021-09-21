@extends('layouts.admin')
@section('title') Редактировать новость - @parent @stop

@section('content')
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Редактировать новость</h1>

    </div>
    <div class="row">
        <div class="col-md-12">
            @include('inc.messages')



            <form method="post" action="{{ route('admin.news.update', ['news' => $news]) }}">
                @csrf
                @method('put')
                <div class="form-group">
                    <label for="category_id">Категория</label>
                    <select class="form-control" name="category_id">
                        @foreach($categories as $category)
                            <option value="{{ $category->id }}"
                                    @if($news->category_id === $category->id) selected @endif>{{ $category->title }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="form-group">
                    <label for="title">Заголовок</label>
                    <input type="text" class="form-control" name="title" id="title" value="{{ $news->title }}">
                </div>
                <div class="form-group">
                    <label for="author">Автор</label>
                    <input type="text" class="form-control" name="author" id="author" value="{{ $news->author }}">
                </div>

                <div class="form-group">
                    <label for="description">Описание</label>
                    <textarea class="form-control" name="description" id="description">{!! $news->description !!}</textarea>
                </div>
                <br>
                <button type="submit" class="btn btn-success">Сохранить</button>
            </form>
        </div>
    </div>

@endsection