@extends('layouts.data')
@section('content')

    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Добавить источник</h1>

    </div>
    <div class="row">
        <div class="col-md-12">

            <form method="post" action="{{ route('admin.resources.store') }}">
                @csrf

                <div class="form-group">
                    <label for="resource">Источник</label>
                    <textarea class="form-control" name="resource" id="resource">{!! old('resource') !!}</textarea>
                </div>
                <br>
                <button type="submit" class="btn btn-success">Сохранить</button>
            </form>
        </div>
    </div>
    @endsection