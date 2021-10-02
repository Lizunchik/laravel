<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@section('title') GeekBlog @show</title>

    <!-- Custom fonts for this template-->
    <link href="{{ asset('assets/vendor/fontawesome-free/css/all.min.css') }}" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

    <link href="{{ asset('assets/css/sb-admin-2.css') }}" rel="stylesheet">

</head>

<body id="page-top">
    <div>
        <h3>Привет, {{ Auth::user()->name }}</h3>
        @if(Auth::user()->avatar)
        <br>
        <img src="{{ Auth::user()->avatar }}" style="width:200px;">
        @endif
        <br>
        <form method="post" action="{{ route('admin.roles.update', ['role' => Auth::user()] )}}">
            @csrf
            @method('put')
            <input type="checkbox" id="is_admin">
            <label for="is_admin">Стать админом</label>
            <button type="submit" class="btn btn-success">Сохранить</button>
        </form>
        @if(Auth::user()->is_admin)
        <a href="{{ route('admin.index') }}" style="color: red;">В админку</a>

        @endif
        <br>
        <a href="{{ route('logout') }}">Выход</a>
    </div>
</body>