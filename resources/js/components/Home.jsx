// components/Home.jsx
import React, { useEffect } from "react";
import $ from "jquery";
import "slick-carousel";

// Slick CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Home() {
    useEffect(() => {
        $(".home-slider").slick({
            slidesToShow: 1,        // 한 번에 한 개만 보여줌 (Single Item)
            slidesToScroll: 1,      // 한 번에 한 장씩 이동
            autoplay: true,         // 자동 재생
            autoplaySpeed: 2500,    // 2.5초마다 변경
            dots: true,             // 하단 점 네비게이션
            arrows: true,           // 좌우 화살표
            infinite: true,         // 무한 반복
            pauseOnHover: true,     // 마우스 올리면 일시정지
        });
    }, []);

    return (
        <div className="container mt-5">

            <div className="home-slider">
                <div><img src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTI7re8wwi55xWdUKAilK7xLvOy2A8JcMAPrM-aVZsdDkAMjkjPGwAW8oN_284fCU55fH4ZSv_U3z4yvYdiHytQyr7JztIRBDr5XkXX-v27hA" alt="slide1" className="w-100 rounded" /></div>
                <div><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwCwaANs5tjhfC7CBQ1PO01Y-qI9nlmu2XcULZvJ2ZsSLY1HvU4x6453Vvyv92Rf-Zm1YJa-WS8dN6BTJNf2hO0kgd5GvJjsMtdX7Aau3zcw" alt="slide2" className="w-100 rounded" /></div>
                <div><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwFhjlKaGUfgN4Xu9OE63C0ItL59iqSfbZ4roeO1QJkL0uaKpedgwzOQUATn6x8bexdaQFFi1y0dl63AgYPCh3t7SW1G7amXYRE_EVieUW" alt="slide3" className="w-100 rounded" /></div>
            </div>
        </div>
    );
}

export default Home;
