<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>라이프허브</title>
    <link rel="icon" href="{{ asset('asset/images/main.png') }}">
    @include('layout.links')
</head>
<body>
    <div class="auth-container container-fluid d-flex justify-content-center align-items-center p-0 position-relative">
        <a href="/" class="home-btn btn btn-primary position-absolute start-0 top-0 m-5 z-2">
            <i class="fa-solid fa-home"></i>
        </a>
        @include('layout.alert')
        @yield('section')
    </div>
</body>
</html>
