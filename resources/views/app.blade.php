<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>라이프허브</title>
    @vitereactrefresh
    @vite('resources/js/app.jsx')
    <link rel="stylesheet" href="{{ asset('asset/bootstrap/bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('asset/fontawesome-free-7.0.1-web/css/all.css') }}">
    <link rel="stylesheet" href="{{ asset('asset/css/style.css') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet">
    <link rel="icon" href="{{ asset('asset/images/main.png') }}">
</head>
<body>
    <div id="app" class="position-relative">
        @include("layout.alert")
    </div>

    <script src="{{ asset('asset/bootstrap/bootstrap.bundle.min.js') }}"></script>
</body>
</html>
