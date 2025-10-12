import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Weather from './components/Weather';
import Notepad from './components/Notepad';
import MyPage from './components/MyPage';

function App() {
    const [user, setUser] = useState(undefined); // undefined = 아직 서버 확인 전
    const [csrfToken, setCsrfToken] = useState("");
    const [coords, setCoords] = useState({ lng: null, lat: null });

    useEffect(() => {
        // geolocation 처리
        let watchId;

        if ("geolocation" in navigator) {
            // 처음 위치 가져오기
            navigator.geolocation.getCurrentPosition((pos) => {
                const { longitude, latitude } = pos.coords;
                setCoords({ lng: longitude, lat: latitude });
            });

            // 움직일 때마다 위치 갱신
            watchId = navigator.geolocation.watchPosition((pos) => {
                const { longitude, latitude } = pos.coords;
                setCoords({ lng: longitude, lat: latitude });
            });
        }

        // 사용자 정보, CSRF 토큰 가져오기
        (async () => {
            try {
                const userRes = await fetch('/user');
                const userData = await userRes.json();
                setUser(userData.success ? userData.user : null);

                const tokenRes = await fetch('/csrf-token');
                const tokenData = await tokenRes.text();
                setCsrfToken(tokenData);
            } catch (err) {
                console.error(err);
            }
        })();

        // cleanup: 컴포넌트 언마운트 시 watchPosition 중지
        return () => {
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, []);

    if (user === undefined) return (
        <div className="loading-container position-relative d-block">
            <div className="rotate-box position-absolute top-50 start-50 translate-middle">
                <i className="fa-solid fa-spinner fs-1 text-dark"></i>
            </div>
        </div>
    );

    return (
        <BrowserRouter>
            <Header csrfToken={csrfToken} user={user} setUser={setUser} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/weather" element={<Weather user={user} coords={coords} csrfToken={csrfToken} />} />
                <Route path="/notepad/*" element={<Notepad user={user} coords={coords} csrfToken={csrfToken} />} />
                <Route path="/mypage" element={<MyPage />} />
            </Routes>
        </BrowserRouter>
    );
}

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
