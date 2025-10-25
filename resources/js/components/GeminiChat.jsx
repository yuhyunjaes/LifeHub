import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { TITLE_PROMPT, DEFAULT_PROMPT, HISTORY_PROMPT } from "../../../config/prompt.js";

function GeminiChat({ user, csrfToken }) {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(null);

    const [editRoom, setEditRoom] = useState(false);
    const [saveRoomTitle, setSaveRoomTitle] = useState("");
    const [editRoomStatus, setEditRoomStatus] = useState(false);
    const [editRoomCheck, setEditRoomCheck] = useState(false);

    const [editRoomId, setEditRoomId] = useState("");
    const [baseTop, setBaseTop] = useState(0);
    const [baseScroll, setBaseScroll] = useState(0);

    const [modal, setModal] = useState(false);


    const [alertSwitch, setAlertSwitch] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus] = useState(false);

    const titleInputRef = useRef(null);

    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null);
    const editRoomRef = useRef(null);

    useEffect(() => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    useEffect(() => {
        if (editRoomStatus && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [editRoomStatus]);


    const handleChangeType = (id) => {
        const EditId = String(id);
        if(!EditId) return;
        setEditRoomStatus(true);
        setSaveRoomTitle(rooms.find(item => item.room_id === EditId).title);
    }

    const resetRoom = () => {
        setChatId(null);
        setMessages([]);
        setPrompt("");
        navigate("/lifebot");
        textareaRef.current?.focus();
    }

    const updateRoom = async (title) => {
        if(!editRoomId || !title) return;

        try {
            const res = await fetch(`/api/rooms/${editRoomId}`, {
                method: 'PUT',
                headers : {
                    "Content-Type" : "application/json",
                    "X-CSRF-TOKEN" : csrfToken
                },
                body : JSON.stringify({ title : title })
            });
            const data = await res.json();
            if(data.success) {
                showAlert(data.message, true);
                setEditRoomCheck(false);
            } else {
                showAlert(data.message, false);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const deleteRoom = async (id) => {
        if(!id) return;
        const room_id = id;

        try {
            const res = await fetch(`/api/rooms/${room_id}`, {
                method : "DELETE",
                headers : {
                    "Content-Type" : "application/json",
                    "X-CSRF-TOKEN" : csrfToken
                }
            });
            const data = await res.json();

            if(data.success) {
                if(room_id === roomId) {
                    resetRoom();
                }
                setRooms(prevRooms => prevRooms.filter(item => item.room_id !== room_id));
                setEditRoom(false);
                setEditRoomCheck(false);
                setEditRoomStatus(false);
                showAlert(data.message, true);
                setEditRoomId("");
                setModal(false);
            } else {
                showAlert(data.message, false);
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (!user) {
            location = "/login";
        }

        const getRooms = async () => {
            authCheck();
            try {
                const res = await fetch(`/api/rooms/${user.id}`);
                const data = await res.json();
                if (data.success) setRooms(data.rooms);
            } catch (err) {
                console.error(err);
            }
        };

        getRooms();
    }, [user]);

    function authCheck() {
        fetch('/api/auth/check')
            .then(res => res.json())
            .then(data => {
                if(data.error) {
                    alert("로그인 후 이용할 수 있습니다.");
                    location = "/login";
                }
            })
            .catch(() => location.href = "/login");
    }

    useEffect(() => {
        if (!roomId) {
            setChatId(null);
            setMessages([]);
            setPrompt("");
            return;
        }
        setChatId(roomId || null);
    }, [roomId]);

    const changeRoom = (room, e) => {
        if(e.target.classList.contains('room-edit-btn') || e.target.classList.contains('fa-solid') || e.target.classList.contains('form-control')) return;

        const id = String(room.room_id);
        if (String(chatId) === id) return;
        navigate(`/lifebot/${id}`);
        setMessages([]);
    };

    const showAlert = (msg, status) => {
        setAlertMessage(msg);
        setAlertStatus(status);
        setAlertSwitch(true);
    };

    useEffect(() => {
        if (alertSwitch) {
            const timer = setTimeout(() => setAlertSwitch(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [alertSwitch]);

    useEffect(() => {
        if (!chatId) return;

        const getMessages = async () => {
            try {
                const res = await fetch(`/api/messages/${chatId}`);
                const data = await res.json();
                if (data.success) {
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const newMsgs = data.messages.filter(m => !existingIds.has(m.id));
                        return [...prev, ...newMsgs];
                    });
                } else {
                    showAlert(data.message, false);
                    navigate('/lifebot');
                    setChatId(null);
                    setMessages([]);
                }
            } catch (err) {
                console.error("메시지 불러오기 오류:", err);
            }
        };

        getMessages();
    }, [chatId]);

    const START_API = import.meta.env.VITE_GEMINI_API_START;
    const END_API = import.meta.env.VITE_GEMINI_API_END;
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const MODEL_NAME = import.meta.env.VITE_GEMINI_API_MODEL;

    const handleSubmit = async () => {
        if (!prompt.trim()) return;
        authCheck();
        setLoading(true);

        const titlePrompt = `
    USER_TEXT***${prompt}***
    ${TITLE_PROMPT}
    `;

        try {
            let currentRoomId = chatId;

            if (!chatId && !currentRoomId) {
                const titleRes = await fetch("/lifebot/title", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({
                        model_name: MODEL_NAME,
                        prompt: titlePrompt,
                    }),
                });

                const titleData = await titleRes.json();
                const title =
                    titleData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
                    prompt.trim();

                const roomRes = await fetch(`/api/rooms`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        title,
                        model_name: MODEL_NAME,
                    }),
                });

                const roomData = await roomRes.json();
                if (roomData.success) {
                    currentRoomId = roomData.room_id;
                    setChatId(currentRoomId);
                    const roomList = { room_id: roomData.room_id, title: roomData.title };
                    setRooms((room) => [roomList, ...room]);

                    await new Promise((r) => setTimeout(r, 100));
                    navigate(`/lifebot/${currentRoomId}`);
                }
            }

            if (!currentRoomId) {
                showAlert("채팅방 생성에 실패했습니다.", false);
                setLoading(false);
                return;
            }

            const userText = prompt;
            setMessages((prev) => [
                ...prev,
                { role: "user", text: userText },
                { role: "model", text: "" },
            ]);
            setPrompt("");
            textareaRef.current.style.height = "40px";

            const historyText =
                messages && messages.length > 0
                    ? JSON.stringify(messages)
                        .replace(/\\/g, "\\\\")
                        .replace(/`/g, "\\`")
                    : "empty-message";

            const aiRes = await fetch(`${START_API}${MODEL_NAME}${END_API}${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: DEFAULT_PROMPT },
                                { text: HISTORY_PROMPT },
                                { text: `HISTORY-JSON***${historyText}***` },
                                { text: `USER-TEXT***${prompt}***` },
                            ],
                        },
                    ],
                    generationConfig: { temperature: 0.8, maxOutputTokens: 5120 },
                }),
            });

            const reader = aiRes.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let fullText = "";
            let aiCode = "";
            let combined = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk
                    .split("\n")
                    .filter((line) => line.trim().startsWith("data: "));

                for (const line of lines) {
                    if (line.includes("[DONE]")) continue;
                    try {
                        const json = JSON.parse(line.replace(/^data: /, ""));
                        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

                        if (text) {
                            combined += text;

                            const patternStart = combined.indexOf("***{");
                            const patternEnd = combined.lastIndexOf("}***");
                            let cleaned = combined;

                            if (patternStart !== -1 && patternEnd !== -1 && patternEnd > patternStart) {
                                cleaned =
                                    combined.slice(0, patternStart) + combined.slice(patternEnd + 4);
                            }

                            fullText = cleaned.trim();
                            if (fullText.includes('***{')) break;

                            setMessages((prev) => {
                                const updated = [...prev];
                                updated[updated.length - 1].text = fullText;
                                return updated;
                            });
                        }
                    } catch (err) {
                        console.warn("파싱 오류:", err);
                    }
                }
            }

            const startIdx = combined.indexOf("***{");
            const endIdx = combined.lastIndexOf("}***");

            if (startIdx !== -1 && endIdx !== -1) {
                aiCode = combined.slice(startIdx + 3, endIdx + 1).trim();
                fullText = (combined.slice(0, startIdx) + combined.slice(endIdx + 4)).trim();
            }

            if (fullText.trim().length === 0) {
                showAlert("AI 응답이 비어있습니다.", false);
                setLoading(false);
                return;
            }

            let aiArr = [];

            if (aiCode) {
                try {
                    aiArr = [JSON.parse(aiCode)];

                    if (aiArr[0].chat_id) {
                        aiArr = aiArr.map(obj => {
                            const { chat_id, ...rest } = obj;
                            return { id: chat_id, ...rest };
                        });
                    }
                } catch {
                    console.warn("AI JSON 파싱 실패:", aiCode);
                }
            }

            if (aiArr.length > 0) {
                if (aiArr[0].id) {
                    await handleNotepad(aiArr[0]);
                }
                await saveMessageToDB(currentRoomId, userText, fullText, !aiArr[0].id ? aiArr : '');
            } else {
                await saveMessageToDB(currentRoomId, userText, fullText, '');
            }

        } catch (err) {
            console.error("handleSubmit 오류:", err);
            showAlert("AI 응답 처리 중 오류가 발생했습니다.", false);
        } finally {
            setLoading(false);
        }
    };


    const saveMessageToDB = async (roomId, userText, aiText, arr) => {
        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    room_id: roomId,
                    user_message: userText,
                    ai_message: aiText,
                }),
            });
            const data = await res.json();
            if (data.success) {
                if(arr) {
                    arr[0].id = data.ai_id;
                    await handleNotepad(arr[0]);
                }
                setMessages((prev) => {
                    const updated = [...prev];
                    if (updated[updated.length - 2]) updated[updated.length - 2].id = data.user_id;
                    if (updated[updated.length - 1]) updated[updated.length - 1].id = data.ai_id;
                    return updated;
                });
            }
        } catch (err) {
            console.error("메시지 저장 오류:", err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !loading) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleNotepad = async (msg) => {
        const content = msg.text;
        const chat_id = msg.id;
        const user_id = user.id;

        if(!content || !chat_id || !user_id) return;

        const res = await fetch("/api/notepads", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({
                content: content,
                chat_id: chat_id,
                user_id: user_id,
            }),
        });
        const data = await res.json();
        if (data.success) {
            navigate(`/notepad/write/${data.id}`);
        }
    };

    return (
        <div className="w-screen h-[calc(100vh-70px)] overflow-hidden flex relative" onClick={(e)=> {
            if (
                e.target.classList.contains('room-edit-btn') ||
                e.target.classList.contains('edit-room-btn') ||
                e.target.closest('.room-edit-btn') ||
                e.target.closest('.modal') ||
                e.target.closest('.edit-room') ||
                e.target.closest('.edit-room-title')
            ) return;

            if(editRoom) {
                setEditRoom(false);
                setEditRoomId("");
                setEditRoomStatus(false);
                setSaveRoomTitle("");
            }
        }}>
            <div className="lifeBot-side-bar w-[250px] h-full overflow-x-hidden overflow-y-auto relative" onScroll={(e) => {
                if(!editRoomRef.current) return;
                const delta = e.target.scrollTop - baseScroll;
                editRoomRef.current.style.top = `${baseTop - delta}px`;
            }}
            >
                <div className="w-full sticky top-0 bg-white">
                    <button
                        onClick={resetRoom}
                        className="btn flex justify-start items-center w-full px-0 py-2 hover:bg-gray-100"
                    >
                        <i className="fa-solid fa-pen-to-square m-0"></i>
                        <span className="ml-2">새 채팅</span>
                    </button>
                </div>

                <div className="w-full mt-3">
                    <span className="text-xs ml-3 w-full">채팅</span>
                    {rooms.map((room) => (
                        <div
                            onClick={(e) => changeRoom(room, e)}
                            key={room.room_id}
                            className={`btn group room-btn transition-colors duration-300 [&:not(.bg-blue-500):hover]:bg-gray-100 flex justify-between items-center w-full px-0 py-2 cursor-pointer ${
                                chatId === room.room_id ? "text-white bg-blue-500" : ""
                            }`}
                        >
                            {(editRoomStatus && editRoomId === room.room_id) ? (
                                <input ref={titleInputRef} type="text" name="" id="" className="edit-room-title" value={room.title}
                                       onKeyDown={(e) => {
                                           if(e.key === 'Enter') {
                                               if(room.title.trim().length <= 0) return;
                                               setEditRoomCheck(true);
                                               setEditRoomStatus(false);
                                               setEditRoomId("");
                                               setEditRoom(false);

                                               updateRoom(room.title);
                                           }
                                       }}

                                       onChange={(e) => {
                                           const newTitle = e.target.value;
                                           setRooms(prevRooms =>
                                               prevRooms.map(roomItem =>
                                                   roomItem.room_id === room.room_id
                                                       ? { ...roomItem, title: newTitle }
                                                       : roomItem
                                               )
                                           );
                                       }}

                                       onBlur={()=> {
                                           if(!editRoomCheck) {
                                               setRooms(prevRooms =>
                                                   prevRooms.map(roomItem =>
                                                       roomItem.room_id === room.room_id
                                                           ? { ...roomItem, title: saveRoomTitle }
                                                           : roomItem
                                                   )
                                               );
                                           }
                                           setEditRoomCheck(false);
                                       }}

                                />
                            ) : (
                                <span className="m-0 overflow-hidden block room-title w-[60%] whitespace-nowrap text-ellipsis text-left">
                                {room.title}
                            </span>
                            )}

                            <button className={`!p-0 btn room-edit-btn active:border-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300 mr-3 ${editRoomId === room.room_id ? 'opacity-100' : 'opacity-0'}`} onClick={(e)=> {
                                setEditRoomId(room.room_id);

                                setEditRoom(true);
                                const y = e.currentTarget.getBoundingClientRect().y - (e.currentTarget.offsetHeight * 2);
                                editRoomRef.current.style.top = `${y}px`;

                                setBaseTop(y);
                                setBaseScroll(e.currentTarget.closest('.lifeBot-side-bar').scrollTop);
                            }}>
                                <i className={`fa-solid edit-room-btn fa-ellipsis ${chatId === room.room_id ? 'text-white' : ''}`}></i>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="w-full sticky bg-white border-t border-gray-100 bottom-0 p-0 py-5"></div>
            </div>
            <div className="w-[calc(100%-250px)] h-full flex flex-col bg-gray-50 relative">
                {alertSwitch && (
                    <div
                        className={`alert ${alertStatus ? "alert-success" : "alert-danger"}`}
                    >
                        {alertMessage}
                    </div>
                )}

                <div
                    ref={chatContainerRef}
                    className="w-full h-[calc(100%-80px)] flex flex-col-reverse overflow-x-hidden overflow-y-auto"
                >
                    {chatId && (
                        <div className="w-[768px] mx-auto py-5">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex chat-item mb-[100px] transition-opacity duration-300 ${
                                        msg.role === "user"
                                            ? "justify-end"
                                            : "justify-start relative"
                                    }`}
                                >
                                    <div
                                        className={`p-3 mx-0 rounded-[0.75rem] shadow-sm max-w-[70%] whitespace-pre-wrap break-words ${
                                            msg.role === "user"
                                                ? "bg-blue-500 text-white"
                                                : "bg-white text-black border border-gray-50"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>

                                    {msg.id && msg.role === "model" && (
                                        <div
                                            className="absolute h-[50px] bottom-[-50px] left-0 w-full flex justify-start items-center">
                                            <button
                                                className="btn"
                                                title="복사"
                                                onClick={() => {
                                                    window.navigator.clipboard.writeText(msg.text);
                                                    showAlert("복사가 완료되었습니다.", true);
                                                }}
                                            >
                                                <i className="fa-solid fa-copy"></i>
                                            </button>
                                            <button
                                                className="btn"
                                                title="메모장 저장"
                                                onClick={() => handleNotepad(msg)}
                                            >
                                                <i className="fa-solid fa-clipboard"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`w-full h-[80px] p-3 ${chatId ? "relative" : ""}`}>
                    <div
                        className={`w-full flex justify-center items-end absolute left-0 ${
                            chatId ? "bottom-0 mb-3" : "bottom-[50%]"
                        }`}
                    >
                        {!chatId && <h2 className="absolute !top-[-150%] text-3xl">새로운 채팅을 시작하세요.</h2>}
                        <div className="w-[768px] bg-white rounded-[2rem] shadow-sm p-2 flex items-end overflow-hidden">
                            <textarea
                                ref={textareaRef}
                                className="leading-[40px] ms-2 min-h-[40px] max-h-[150px] placeholder-black focus:bg-transparent border-0 text-black bg-transparent flex-grow overflow-y-auto overflow-x-hidden resize-none "
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="AI에게 물어볼 내용을 입력하세요"
                                disabled={loading}
                                rows="1"
                                onInput={(e) => {
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                            />

                            <button
                                onClick={handleSubmit}
                                className="w-[40px] h-[40px] bg-gray-50 shadow-sm rounded-full border-0 px-3 ml-2 flex justify-center items-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="animate-spin m-0 p-0 w-[1rem] h-[1rem] flex justify-center items-center">
                                        <i className="fa-solid fa-spinner"></i>
                                    </div>
                                ) : (
                                    <i className="fa-solid text-xs fa-arrow-up text-black"></i>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={editRoomRef} className={`absolute edit-room p-2 bg-gray-50 shadow-sm left-[200px] rounded w-[170px] ${editRoom ? 'block' : 'hidden'}`}>
                <button className="btn w-full flex hover:bg-gray-100 cursor-pointer justify-start items-center" onClick={() => {
                    handleChangeType(editRoomId);
                }}>
                    <i className="fa-solid fa-pen m-0"></i>
                    <span className="m-0 ml-2">이름 바꾸기</span>
                </button>
                <button className="btn w-full flex justify-start hover:bg-gray-100 cursor-pointer items-center text-red-600" onClick={() => {setModal(true)}}>
                    <i className="fa-solid fa-trash-can m-0"></i>
                    <span className="m-0 ml-2">삭제하기</span>
                </button>
            </div>

            {modal && (
                <div className="modal-area" onClick={() => {setModal(false)}}>
                    <div className="modal">
                        <div className="modal-content top-modal" onClick={(e) => {e.stopPropagation()}}>
                            <div className="modal-header">
                                <h1 className="text-xl m-0">채팅방 삭제</h1>
                                <button onClick={() => {setModal(false)}}>
                                    <i className="fa-solid fa-x text-gray-500 hover:text-black cursor-pointer"></i>
                                </button>
                            </div>
                            <div className="modal-body">
                                <span>"{rooms.find(item => item.room_id === editRoomId).title}" 채팅방을 정말 삭제 하시겠습니까?</span>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => {setModal(false)}} className="btn bg-gray-400 hover:bg-gray-500 active:bg-gray-600 text-white mr-2">닫기</button>
                                <button className="btn btn-primary" onClick={() => {deleteRoom(editRoomId)}}>삭제</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GeminiChat;
