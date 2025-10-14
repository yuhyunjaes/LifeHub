// components/Home.jsx
import React, { useEffect } from 'react';
import { Link, useLocation, Route, Routes  } from 'react-router-dom';
import Calendar from './Notepad/Calendar';
import Write from './Notepad/Write';

function Notepad({coords, user, csrfToken}) {
    const Location = useLocation();
    const isNotePage = Location.pathname === '/notepad';
    const isCalPage = Location.pathname === '/notepad/calendar';

    useEffect(() => {
        if (!user) {
            alert('로그인 후 이용할 수 있습니다.');
            location = '/login';
        }
    }, [user]);

    return (
        <div className="container-fluid notepad-container p-0 d-flex">
            <aside className="notepad-side-bar h-100">
                <ul className="m-0 p-0">
                    <li>
                        <Link className={`btn d-flex justify-content-start align-items-center w-100 py-2 rounded-0 rounded-start-5 ${isNotePage ? 'text-primary bg-light' : ''}`} to="/notepad">
                            <i className="fa-solid fa-clipboard m-0 ms-3"></i>
                            <span className="ms-2">메모</span>
                        </Link>
                        <Link className={`btn d-flex justify-content-start align-items-center w-100 py-2 rounded-0 rounded-start-5 ${isCalPage ? 'text-primary bg-light' : ''}`} to="/notepad/calendar">
                            <i className="fa-solid m-0 ms-3 fa-calendar-days"></i>
                            <span className="ms-2">메모 캘린더</span>
                        </Link>
                    </li>
                </ul>
            </aside>
            <main className="notepad-main h-100 bg-light">
                <Routes>
                    <Route path="" element={<Write user={user} csrfToken={csrfToken}/>} />
                    <Route path="calendar" element={<Calendar />} />
                </Routes>

            </main>
        </div>
    );
}

export default Notepad;
