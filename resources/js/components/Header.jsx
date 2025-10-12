// components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Header({ csrfToken, user, setUser }) {

    async function handleLogout() {
        try {
            const res = await fetch('/logout', {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "X-CSRF-TOKEN" : csrfToken
                }
            });
            const data = await res.json();
            if(data.success) {
                setUser(null);
            }

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <header className="header container-fluid p-0 d-flex">
            <div className="h-100 d-flex justify-content-start align-items-center m-0">
                <Link className="logo m-0 fs-1 d-flex justify-content-center align-items-center fw-bold ms-3" to="/">
                    <img
                        src="/asset/images/logo.png"
                        alt="logo-img"
                        title="logo-img"
                        className="w-100 h-100 object-fit-contain"
                    />
                </Link>
                <ul className="m-0 p-0 ms-5 d-flex">
                    <li className="mx-3">
                        <Link className="link-dark" to="/weather">날씨</Link>
                    </li>
                    <li className="mx-3">
                        <Link className="link-dark" to="/notepad">메모장</Link>
                    </li>
                </ul>
            </div>
            <div className="h-100 d-flex justify-content-center align-items-center m-0">
                <div className="input-group w-75">
                    <input type="text" name="search" id="search" className="form-control" placeholder="검색어를 입력해주세요." />
                    <button className="btn btn-primary">
                        <i className="fa-solid fa-search"></i>
                    </button>
                </div>
            </div>
            <div className="h-100 d-flex justify-content-end align-items-center m-0">{user ? (
                <div className="m-0 me-3 auth position-relative">
                    <input type="checkbox" name="auth-box" id="auth-box" className="d-none"/>
                    <label htmlFor="auth-box"
                           className="auth-btn d-flex justify-content-center align-items-center rounded-circle bg-primary text-white border-0">
                        <i className="fa-regular fa-user"></i>
                    </label>
                    <div className="position-absolute bg-light rounded shadow auth-control-box z-3">
                        <div className="p-3 w-100">
                            <div className="w-100 mb-2">
                                <Link className="d-flex w-100 d-flex justify-content-start align-items-center" to="/mypage">
                                    <div
                                        className="auth-btn d-flex justify-content-center m-0 align-items-center rounded-circle bg-primary text-white border-0">
                                        <i className="fa-regular fa-user"></i>
                                    </div>
                                    <span className="ms-3 text-dark">{user.name}</span>
                                </Link>
                            </div>
                            <div className="w-100 mb-2">
                                <button onClick={handleLogout} className="btn btn-primary w-100">
                                    <i className="fa-solid fa-right-from-bracket    "></i>
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="m-0 me-3 auth">
                    <a href="/login" className="btn me-1 btn-primary">로그인</a>
                    <a href="/register" className="btn ms-1 btn-outline-primary">회원가입</a>
                </div>
            )}
                <label htmlFor="side-menu-toggle" className="side-menu-toggle m-0 me-3">
                    <i className="fa-solid fa-bars fs-2"></i>
                </label>
            </div>

            <input type="checkbox" name="side-menu-toggle" id="side-menu-toggle" className="d-none"/>
            <div className="side-menu-container bg-dark bg-opacity-10 position-fixed top-0 start-0 w-100">
                <label htmlFor="side-menu-toggle" className="w-25 h-100 side-menu-empty position-absolute top-0 start-0"></label>
                <div className="w-75 h-100 side-menu-bar bg-white position-absolute top-0 end-0"></div>
            </div>
        </header>
    );
}

export default Header;
