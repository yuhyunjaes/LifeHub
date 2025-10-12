import React, {useState} from 'react';

function Calendar() {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const lastDate = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) calendarDays.push(null);

    for (let d = 1; d <= lastDate; d++) calendarDays.push(d);

    function minusMonth() {
        setMonth(prevMonth => {
            if (prevMonth === 0) {
                setYear(prevYear => prevYear - 1);
                return 11;
            }
            return prevMonth - 1;
        });
    }

    function plusMonth() {
        setMonth(prevMonth => {
            if (prevMonth === 11) {
                setYear(prevYear => prevYear + 1);
                return 0;
            }
            return prevMonth + 1;
        });
    }

    return (
        <div className="calendar-container d-flex h-100 gap-3 p-5">
            <div>
                <div className="w-100 application-header">
                    <h3 className="border-start border-3 ps-3 border-primary m-0">메모 캘린더</h3>
                </div>
                <div className="w-100 application-body bg-white rounded shadow-sm">

                </div>
            </div>
            <div>
                <div className="calendar-control d-flex justify-content-center align-items-center">
                    <div className="d-flex justify-content-center align-items-center">
                        <button onClick={minusMonth} className="date-btn bg-white m-0 rounded-circle mx-5 border-dark border">
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <h5 className="m-0">{year}년 {month + 1}월</h5>
                        <button onClick={plusMonth} className="date-btn bg-white m-0 rounded-circle mx-5 border-dark border">
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                <div className="day-title rounded-top d-flex">
                    {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => {
                        const isSunday = idx % 7 === 0;
                        const isSaturday = (idx + 1) % 7 === 0;
                        return (
                            <div key={idx}
                                 className={`day w-100 text-center ${isSaturday ? 'text-primary' : ''} ${isSunday ? 'text-danger' : ''}`}>
                                {day ? day : ''}
                            </div>
                        );
                    })}
                </div>
                <div className="calendar w-100 d-grid gap-0 border rounded-bottom">
                    {calendarDays.map((day, idx) => {
                        const isSunday = idx % 7 === 0;
                        const isSaturday = (idx + 1) % 7 === 0;
                        return (
                            <div
                                className={`day bg-white w-100 position-relative border text-center ${isSaturday ? 'text-primary' : ''} ${isSunday ? 'text-danger' : ''}`}
                                key={idx}>
                                <span className="position-absolute start-0 top-0 mt-3 ms-3">{day ? day : ''}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Calendar;
