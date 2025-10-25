// components/Home.jsx
import React, { useEffect } from 'react';
import { Link, useLocation, Route, Routes  } from 'react-router-dom';
import Calendar from './Notepad/Calendar';
import Write from './Notepad/Write';

function Notepad({ user, csrfToken}) {
    const Location = useLocation();
    const isNotePage = Location.pathname.includes('/notepad/write');
    const isCalPage = Location.pathname === '/notepad/calendar';

    useEffect(() => {
        if (!user) {
            location = '/login';
        }
    }, [user]);

    return (
        <div className="w-screen h-[calc(100vh-70px)] flex">
            <aside className="w-[250px] h-full">
                <ul className="m-0 p-0">
                    <li>
                        <Link className={`btn flex justify-start items-center w-full py-2 ${isNotePage ? 'bg-blue-500 text-white' : ''}`} to="/notepad/write">
                            <i className="fa-solid fa-clipboard m-0 ms-3"></i>
                            <span className="ml-2">메모</span>
                        </Link>
                        <Link className={`btn flex justify-start items-center w-full py-2 ${isCalPage ? 'bg-blue-500 text-white' : ''}`} to="/notepad/calendar">
                            <i className="fa-solid m-0 ms-3 fa-calendar-days"></i>
                            <span className="ml-2">메모 캘린더</span>
                        </Link>
                    </li>
                </ul>
            </aside>
            <main className="w-[calc(100%-250px)] h-full bg-gray-50">
                <Routes>
                    <Route path="write" element={<Write user={user} csrfToken={csrfToken} />} />
                    <Route path="write/:id" element={<Write user={user} csrfToken={csrfToken} />} />
                    <Route path="/calendar" element={<Calendar />} />
                </Routes>

            </main>
        </div>
    );
}

export default Notepad;
