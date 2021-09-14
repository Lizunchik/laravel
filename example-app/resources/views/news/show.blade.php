@extends('layouts.main')
@section('content')
<!-- Featured blog post-->
<div class="col-lg-8">
<div class="card mb-4">
    <a href="#!">
        <img class="card-img-top" src="https://dummyimage.com/850x350/dee2e6/6c757d.jpg" alt="..." />
    </a>
    <div class="card-body">
        <div class="small text-muted">{{ $id }}</div>
        <h2 class="card-title">Featured Post Title</h2>
        <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis aliquid atque, nulla? Quos cum ex quis soluta, a laboriosam. Dicta expedita corporis animi vero voluptate voluptatibus possimus, veniam magni quis!</p>
        <a class="btn btn-primary" href="#!">Read more →</a>
    </div>
</div>
</div>
@endsection
@push('js')
    <script>
        alert("Hello!");
    </script>
@endpush