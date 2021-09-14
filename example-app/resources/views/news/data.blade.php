@extends('layouts.data')
@section('content')
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Выгрузить данные</h1>

    </div>
    <div class="row">
        <div class="col-md-12">
            @if($errors->any())
                @foreach($errors->all() as $error)
                    <div class="alert alert-danger">{{ $error }}</div>
                @endforeach
            @endif
            <form method="post" action="{{ route('admin.news.store') }}">
                @csrf
                <div class="form-group">
                    <label for="name">Имя</label>
                    <input type="text" class="form-control" name="name" id="name" value="{{ old('name') }}">
                </div>
                <div class="form-group">
                    <label for="phone">Номер телефона</label>
                    <input type="text" class="form-control" name="phone" id="phone" value="{{ old('phone') }}">
                </div>

                <div class="form-group">
                    <label for="email">Email-адрес</label>
                    <textarea class="form-control" name="email" id="email">{!! old('email') !!}</textarea>
                </div>
                <br>
                <div class="form-group">
                    <label for="query">Что требуется</label>
                    <textarea class="form-control" name="query" id="query">{!! old('query') !!}</textarea>
                </div>
                <br>
                <button type="submit" class="btn btn-success">Сохранить</button>
            </form>
        </div>
    </div>
    @endsection