@extends('layout.auth')

@section('section')
    <form method="POST" action="{{ route('login.submit') }}" id="form" class="w-50 bg-light p-5 rounded shadow-sm">
        @csrf
        <div class="auth-title d-flex justify-content-center position-relative align-items-center mb-5">
            <a href="/" class="phone-home-btn btn btn-primary position-absolute start-0">
                <i class="fa-solid fa-home"></i>
            </a>
            <h3 class="mb-0">로그인</h3>
        </div>

        <div class="mb-2">
            <label for="user_id" class="form-label">아이디</label>
            <input type="text" name="user_id" id="user_id" class="form-control" placeholder="아이디를 입력해주세요.">
        </div>
        <div class="mb-2">
            <label for="password" class="form-label">비밀번호</label>
            <div class="form-control p-0 position-relative d-flex justify-content-center align-items-center">
                <input type="password" name="password" id="password" class="form-control" placeholder="비밀번호를 입력해주세요.">
                <button id="password-show-btn" type="button" class="btn position-absolute end-0 me-3 p-0">
                    <i class="fa-solid fa-eye"></i>
                </button>
            </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 my-3">로그인</button>
        <div class="text-center">
            <a href="/register">회원가입</a>
        </div>
    </form>

    <script src="{{ asset('asset/js/login.js')  }}"></script>
@endsection
