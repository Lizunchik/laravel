@extends('layouts.main')
@section('content')

    <div class="col-lg-8">

        <!-- Nested row for non-featured blog posts-->
        <div class="row">
            <div class="col-lg-6">
                @forelse($newsList as $news)
                <div class="card mb-4">
                    <a href="{{ route('news.show', ['id' => $news->id]) }}">
                    <img class="card-img-top" src="@if($news->image) {{ Storage::disk('public')->url($news->image) }} @else https://dummyimage.com/700x350/dee2e6/6c757d.jpg @endif" alt="..." /></a>
                    <div class="card-body">
                        <div class="small text-muted">{{ $news->created_at->format('d-m-Y H:i') }}</div>
                        <h2 class="card-title h4">{{ $news->title }}</h2>
                        <p class="card-text">{!! $news->description !!}</p>
                        <a class="btn btn-primary" href="{{ route('news.show', ['id' => $news->id]) }}">Читать далее →</a>
                    </div>
                </div>

                @empty
                    <h2>Записей нет</h2>
                @endforelse

            </div>

        </div>
        <!-- Pagination-->
        <nav aria-label="Pagination">
            <hr class="my-0" />
            {{ $newsList->links() }}
        </nav>
    </div>

@endsection
