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
    const [editRoomId, setEditRoomId] = useState("");
    const [baseTop, setBaseTop] = useState(0);
    const [baseScroll, setBaseScroll] = useState(0);

    const [alertSwitch, setAlertSwitch] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus] = useState(false);

    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null);
    const editRoomRef = useRef(null);

    const modalRef = useRef(null);
    const modalInstance = useRef(null);

    useEffect(() => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    useEffect(() => {
        if (modalRef.current) {
            modalInstance.current = new bootstrap.Modal(modalRef.current);
        }
    }, []);

    const handleOpenModal = () => {
        modalInstance.current?.show();
    }

    const handleCloseModal = () => {
        document.activeElement?.blur();
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
        if(e.target.classList.contains('room-edit-btn') || e.target.classList.contains('fa-solid')) return;

        const id = String(room.room_id);
        if (String(chatId) === id) return;
        navigate(`/gemini/${id}`);
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
                    navigate('/gemini');
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
                const titleRes = await fetch("/gemini/title", {
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
                    navigate(`/gemini/${currentRoomId}`);
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
        <div className="gemini-container container-fluid p-0 overflow-hidden d-flex position-relative" onClick={(e)=> {
            if (
                e.target.classList.contains('room-edit-btn') ||
                e.target.classList.contains('edit-room-btn') ||
                e.target.closest('.room-edit-btn')
            ) return;

            if(editRoom && !e.target.classList.contains('edit-room')) {
                setEditRoom(false);
                setEditRoomId("");
            }
        }}>
            <div className="gemini-side-bar h-100 overflow-x-hidden overflow-y-auto position-relative" onScroll={(e) => {
                const delta = e.target.scrollTop - baseScroll;
                editRoomRef.current.style.top = `${baseTop - delta}px`;
            }}
            >
                <div className="w-100 position-sticky top-0 bg-white">
                    <button
                        onClick={() => {
                            setChatId(null);
                            setMessages([]);
                            setPrompt("");
                            navigate("/gemini");
                            textareaRef.current.focus();
                        }}
                        className="btn d-flex justify-content-start align-items-center w-100 px-0 py-2"
                    >
                        <i className="fa-solid fa-pen-to-square m-0 ms-3"></i>
                        <span className="ms-2">새 채팅</span>
                    </button>
                </div>

                <div className="w-100 mt-3">
                    <span className="form-label small-font ms-3 w-100">채팅</span>
                    {rooms.map((room) => (
                        <div
                            onClick={(e) => changeRoom(room, e)}
                            key={room.room_id}
                            className={`btn room-btn d-flex justify-content-between align-items-center w-100 px-0 py-2 ${
                                chatId === room.room_id ? "text-white bg-primary" : ""
                            }`}
                            style={{cursor: "pointer"}}
                        >
                            <span className="m-0 overflow-hidden d-block room-title ms-3 text-start">
                                {room.title}
                            </span>

                            <button className={`btn room-edit-btn  p-0 me-3 ${editRoomId === room.room_id ? 'opacity-100' : ''}`} onClick={(e)=> {
                                setEditRoomId(room.room_id);

                                setEditRoom(true);
                                const y = e.currentTarget.getBoundingClientRect().y - (e.currentTarget.offsetHeight * 2);
                                editRoomRef.current.style.top = `${y}px`;

                                setBaseTop(y);
                                setBaseScroll(e.currentTarget.closest('.gemini-side-bar').scrollTop);
                            }}>
                                <i className={`fa-solid edit-room-btn fa-ellipsis ${chatId === room.room_id ? 'text-white' : ''}`}></i>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="w-100 position-sticky bg-white border-top bottom-0 p-0 py-4"></div>
            </div>

            <div className="gemini-main h-100 d-flex flex-column bg-light position-relative">
                {alertSwitch && (
                    <div
                        className={`alert-message alert alert-${alertStatus ? "success" : "danger"} position-fixed z-2 end-0 m-0`}
                    >
                        {alertMessage}
                    </div>
                )}

                <div
                    ref={chatContainerRef}
                    className="w-100 chat-container d-flex flex-column-reverse overflow-x-hidden overflow-y-auto"
                >
                    {chatId && (
                        <div className="prompt-width py-5">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`d-flex chat-item ${
                                        msg.role === "user"
                                            ? "justify-content-end"
                                            : "justify-content-start position-relative"
                                    }`}
                                >
                                    <div
                                        className={`p-3 mx-0 rounded-4 shadow-sm ${
                                            msg.role === "user"
                                                ? "bg-primary text-white"
                                                : "bg-white text-dark border"
                                        }`}
                                        style={{
                                            maxWidth: "70%",
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                            borderRadius: "1.25rem",
                                        }}
                                    >
                                        {msg.text}
                                    </div>

                                    {msg.id && msg.role === "model" && (
                                        <div
                                            className="position-absolute chat-control start-0 w-100 d-flex justify-content-start align-items-center">
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

                <div className={`w-100 prompt-container p-3 ${chatId ? "position-relative" : ""}`}>
                    <div
                        className={`w-100 d-flex justify-content-center align-items-end position-absolute start-0 ${
                            chatId ? "bottom-0 mb-3" : "bottom-50"
                        }`}
                    >
                        {!chatId && <h2 className="position-absolute top-title">새로운 채팅을 시작하세요.</h2>}
                        <div className="prompt-width bg-white rounded-5 shadow-sm p-2 d-flex align-items-end">
                            <textarea
                                ref={textareaRef}
                                className="form-control prompt border-0 text-dark bg-transparent flex-grow-1 overflow-y-auto overflow-x-hidden"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="AI에게 물어볼 내용을 입력하세요"
                                disabled={loading}
                                rows="1"
                                style={{
                                    resize: "none",
                                    minHeight: "40px",
                                    maxHeight: "150px",
                                    lineHeight: "1.5",
                                    fontSize: "1rem",
                                }}
                                onInput={(e) => {
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                            />

                            <button
                                onClick={handleSubmit}
                                className="prompt-btn bg-light shadow-sm rounded-circle border-0 px-3 ms-2 d-flex justify-content-center align-items-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="spinner-border spinner-border-sm text-secondary"
                                         role="status"></div>
                                ) : (
                                    <i className="fa-solid small-font fa-arrow-up text-dark"></i>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={editRoomRef} className="position-absolute edit-room py-5 bg-light shadow rounded" style={{width: '170px', display: `${editRoom ? 'block' : 'none'}`,  left: '200px'}}></div>

            <div ref={modalRef} className="modal fade" onClick={handleCloseModal} id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel"
                 aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header m-0">
                            <h1 className="modal-title fs-5 m-0" id="exampleModalLabel">채팅방 삭제</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body w-100">
                            채팅방을 정말 삭제 하시겠습니까?
                        </div>
                        <div className="modal-footer w-100">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                            <button type="button" className="btn btn-primary">삭제</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GeminiChat;
