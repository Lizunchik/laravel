@extends('layouts.admin')
@section('title') Добавить категорию - @parent @stop

@section('content')
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Добавить категорию</h1>

    </div>
    <div class="row">
        <div class="col-md-12">
            @include('inc.messages')

            <form method="post" action="{{ route('admin.categories.store') }}">
                @csrf

                <div class="form-group">
                    <label for="title">Заголовок</label>
                    <input type="text" class="form-control" name="title" id="title" value="{{ old('title') }}">
                </div>


                <div class="form-group">
                    <label for="description">Описание</label>
                    <textarea class="form-control" name="description" id="description">{!! old('description') !!}</textarea>
                </div>
                <br>
                <button type="submit" class="btn btn-success">Сохранить</button>
            </form>
        </div>
    </div>

@endsection