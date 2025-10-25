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
        <header className="h-[70px] w-screen flex justify-between">
            <div className="h-full flex justify-start items-center m-0">
                <Link className="w-[100px] h-[40px] m-0 text-4xl flex justify-center items-center ml-3" to="/">
                    <img
                        src="/asset/images/logo.png"
                        alt="logo-img"
                        title="logo-img"
                        className="size-full object-contain"
                    />
                </Link>
                <ul className="m-0 p-0 ml-5 flex">
                    <li className="mx-3">
                        <Link className="text-black" to="/lifebot">LifeBot</Link>
                    </li>
                    <li className="mx-3">
                        <Link className="text-black" to="/notepad/write">메모장</Link>
                    </li>
                </ul>
            </div>
            <div className="h-full flex justify-end items-center m-0">{user ? (
                <div className="m-0 mr-3 auth relative">
                    <input type="checkbox" name="auth-box" id="auth-box" className="peer hidden"/>
                    <label htmlFor="auth-box"
                           className="w-[40px] h-[40px] flex justify-center items-center rounded-full bg-blue-500 text-white border-0">
                        <i className="fa-regular fa-user"></i>
                    </label>
                    <div className="w-[200px] right-0 top-[40px] hidden absolute bg-gray-50 rounded-2xl shadow z-[3] peer-checked:block">
                        <div className="p-3 w-full">
                            <div className="w-full mb-2">
                                <Link className="flex w-full justify-start items-center" to="/mypage">
                                    <div
                                        className="w-[40px] h-[40px] flex justify-center m-0 items-center rounded-full bg-blue-500 text-white border-0">
                                        <i className="fa-regular fa-user"></i>
                                    </div>
                                    <span className="ms-3 text-black">{user.name}</span>
                                </Link>
                            </div>
                            <div className="w-full mb-2">
                                <button onClick={handleLogout} className="btn btn-primary w-full">
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="m-0 mr-3 auth">
                    <a href="/login" className="btn mr-1 btn-primary">로그인</a>
                    <a href="/register" className="btn ml-1 btn-outline-primary">회원가입</a>
                </div>
            )}
            </div>
        </header>
    );
}

export default Header;
