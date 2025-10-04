@extends('layout.auth')

@section('section')
    <form method="POST" action="{{ route('register.submit') }}" id="form" class="w-50 bg-light p-5 rounded shadow-sm">
        @csrf
        <div class="auth-title d-flex justify-content-center position-relative align-items-center mb-5">
            <a href="/" class="phone-home-btn btn btn-primary position-absolute start-0">
                <i class="fa-solid fa-home"></i>
            </a>
            <h3 class="mb-0">회원가입</h3>
        </div>

        <div class="mb-2">
            <label for="user_id" class="form-label">아이디</label>
            <div class="input-group">
                <input type="text" name="user_id" id="user_id" class="form-control" placeholder="아이디를 입력해주세요.">
                <button onclick="checkId()" type="button" class="btn btn-primary">중복확인</button>
            </div>
            <p id="user-id-text" class="form-text mb-0">

            </p>
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
        <div class="mb-2">
            <label for="password_confirmation" class="form-label">비밀번호 확인</label>
            <div class="form-control p-0 position-relative d-flex justify-content-center align-items-center">
                <input type="password" name="password_confirmation" id="password_confirmation" class="form-control" placeholder="비밀번호를 다시 입력해주세요.">
                <button id="password-confirmation-show-btn" type="button" class="btn position-absolute end-0 me-3 p-0">
                    <i class="fa-solid fa-eye"></i>
                </button>
            </div>
            <p id="password-confirm-text" class="form-text text-danger mb-0">

            </p>
        </div>
        <div class="mb-2">
            <label for="name" class="form-label">이름</label>
            <input type="text" name="name" id="name" class="form-control" placeholder="이름을 입력해주세요.">
        </div>
        <div class="mb-2">
            <label for="email" class="form-label">이메일</label>
            <div class="input-group">
                <input type="email" id="email" name="email" autocomplete="email" class="form-control" placeholder="이메일을 입력해주세요.">
                <button id="email-check-btn" type="button" class="btn btn-primary">인증코드 전송</button>
            </div>
            <p id="email-text" class="form-text mb-0">

            </p>
        </div>
        <div class="mb-2 email-auth-item overflow-hidden">
            <label for="email-auth" class="form-label">이메일 인증</label>
            <div class="input-group">
                <input type="number" name="email-auth" id="email-auth" class="form-control" placeholder="인증번호를 입력해주세요.">
                <button id="email-auth-btn" type="button" class="btn btn-primary">인증하기</button>
            </div>
            <p id="email-auth-text" class="form-text mb-0">

            </p>
        </div>
        <button type="submit" class="btn btn-primary w-100 my-3">회원가입</button>
        <div class="text-center">
            <a href="/login">로그인</a>
        </div>
    </form>

    <div id="loading-container" class="loading-container position-fixed top-0 start-0 bg-dark bg-opacity-10 z-1 w-100">
        <div class="rotate-box position-absolute top-50 start-50 translate-middle">
            <i class="fa-solid fa-spinner fs-1 text-dark"></i>
        </div>
    </div>

    <script src="{{ asset('asset/js/register.js')  }}"></script>
@endsection
