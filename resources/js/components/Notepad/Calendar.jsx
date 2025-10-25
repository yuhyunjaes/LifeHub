import React, { useState } from 'react';

function Calendar() {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const lastDate = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let d = 1; d <= lastDate; d++) calendarDays.push(d);

    const minusMonth = () => {
        setMonth(prev => {
            if (prev === 0) {
                setYear(y => y - 1);
                return 11;
            }
            return prev - 1;
        });
    };

    const plusMonth = () => {
        setMonth(prev => {
            if (prev === 11) {
                setYear(y => y + 1);
                return 0;
            }
            return prev + 1;
        });
    };

    return (
        <div className="flex gap-3 h-full p-8">

            <div className="flex-[1]">
                <div className="h-[10%]">
                    <h3 className="text-3xl pl-3 border-l-4 border-blue-500 m-0">
                        메모 캘린더
                    </h3>
                </div>
                <div className="h-[90%] bg-white rounded shadow-sm"></div>
            </div>

            <div className="flex-[3]">
                <div className="flex justify-center items-center h-[10%]">
                    <button
                        onClick={minusMonth}
                        className="w-8 h-8 flex justify-center items-center rounded-full border mx-5 bg-white hover:bg-gray-100"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>

                    <h5 className="text-lg font-semibold m-0">
                        {year}년 {month + 1}월
                    </h5>

                    <button
                        onClick={plusMonth}
                        className="w-8 h-8 flex justify-center items-center rounded-full border mx-5 bg-white hover:bg-gray-100"
                    >
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

                <div className="flex h-[50px] bg-gray-200 rounded-t">
                    {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-1 justify-center items-center text-center
                                ${idx === 0 ? "text-red-500" : ""}
                                ${idx === 6 ? "text-blue-500" : ""}
                            `}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 border border-gray-300 rounded-b h-[calc(90%-50px)]">
                    {calendarDays.map((day, idx) => (
                        <div
                            key={idx}
                            className="border border-gray-300 flex justify-center items-start bg-white relative text-center"
                        >
                            <span
                                className={`
                                    absolute top-2 left-2 text-sm
                                    ${idx % 7 === 0 ? "text-red-500" : ""}
                                    ${(idx + 1) % 7 === 0 ? "text-blue-500" : ""}
                                `}
                            >
                                {day ?? ""}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Calendar;
