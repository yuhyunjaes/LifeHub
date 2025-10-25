import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useNavigate, useParams } from "react-router-dom";

function Write({ user, csrfToken }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [emptyNotepad, setEmptyNotepad] = useState(false);
    const [noteId, setNoteId] = useState("");
    const [notes, setNotes] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [updateNoteTitle, setUpdateNoteTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    const [noteLoading, setNoteLoading] = useState(false);

    const [modal, setModal] = useState(false);

    const [alertSwitch, setAlertSwitch] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus] = useState(false);

    const quillRef = useRef(null);
    const quillInstance = useRef(null);
    const noteIdRef = useRef(0);
    const csrfRef = useRef(csrfToken);

    useEffect(() => {
        if (!id) {
            setIsWriting(false);
            setNoteId("");
            return;
        }
        setNoteLoading(true);

        const getText = async () => {
            try {
                const res = await fetch(`/api/notepads/contents/${id}`);
                const data = await res.json();
                if (data.success && quillInstance.current) {
                    setNoteLoading(false);
                    quillInstance.current.clipboard.dangerouslyPasteHTML(data.content.content || '');
                    quillInstance.current.history.clear();

                    setIsWriting(true);
                } else {
                    navigate('/notepad/write');
                    setIsWriting(false);
                }
            } catch (err) {
                console.log(err);
            }
        };


        getText();
        setNoteId(String(id));
    }, [id]);

    const showAlert = (msg, status) => {
        setAlertMessage(msg);
        setAlertStatus(status)
        setAlertSwitch(true);
    };

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

    async function updateNotepad() {
        if (!noteIdRef.current || !quillInstance.current) return;
        const html = quillInstance.current.root.innerHTML;
        try {
            const res =  await fetch(`/api/notepads/${noteIdRef.current}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfRef.current
                },
                body: JSON.stringify({ text: html, onlyTitle: false })
            });
            const data = await res.json();
            // if(data.success) {
            //     showAlert(data.message, true);
            // }
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (alertSwitch) {
            const timer = setTimeout(() => setAlertSwitch(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [alertSwitch]);

    const filteredNotes = notes
        .filter(note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            return sortOrder === 'asc'
                ? new Date(a.created_at) - new Date(b.created_at)
                : new Date(b.created_at) - new Date(a.created_at);
        });

    useEffect(() => {
        noteIdRef.current = noteId;
    }, [noteId]);
    useEffect(() => {
        csrfRef.current = csrfToken;
    }, [csrfToken]);

    const updateNoteTitleTyping = (e, id) => {
        const value = e.target.value;

        if (!updateNoteTitle) {
            const targetNote = notes.find(n => String(n.id) === String(id));
            if (targetNote) setUpdateNoteTitle(targetNote.title);
        }

        setNotes(prev =>
            prev.map(n =>
                String(n.id) === String(id)
                    ? { ...n, title: value }
                    : n
            )
        );
    };

    const resetNoteTitleEvent = (e, id) => {
        if (updateNoteTitle) {
            setNotes(prev =>
                prev.map(n =>
                    String(n.id) === String(id)
                        ? { ...n, title: updateNoteTitle }
                        : n
                )
            );
            setUpdateNoteTitle('');
        }
    };

    const updateNoteTitleEvent = async (e, id) => {
        if (e.key === 'Enter') {
            const newTitle = e.target.value.trim();
            if (!newTitle) return;

            setNotes(prevNotes =>
                prevNotes.map(n =>
                    String(n.id) === String(id)
                        ? { ...n, title: newTitle }
                        : n
                )
            );
            setUpdateNoteTitle('');

            try {
                const res = await fetch(`/api/notepads/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfRef.current
                    },
                    body: JSON.stringify({ title: newTitle, onlyTitle: true })
                });
                const data = await res.json();
                if(data.success) {
                    showAlert(data.message, true);
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSubmitNote = async () => {
        if (!noteTitle.trim()) {
            const titleText = document.querySelector('.note-title-text');
            if (titleText) titleText.textContent = '제목을 입력해주세요.';
            return;
        }

        document.activeElement?.blur();
        if (!user?.id) return;

        try {
            const res = await fetch('/api/notepads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfRef.current
                },
                body: JSON.stringify({ user_id: user.id, note_title: noteTitle })
            });

            const data = await res.json();
            if (data.success) {
                setNoteTitle('');
                setModal(false);
                setNoteId(data.id);
                showAlert(data.message, true);
                setNotes(prev => [
                    {
                        id: data.id,
                        title: noteTitle,
                        created_at: data.created_at,
                    },
                    ...prev
                ]);
                setIsWriting(true);
                navigate(`/notepad/write/${data.id}`);
                if (quillInstance.current)
                    quillInstance.current.root.innerHTML = '';
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectNote = (note) => {
        navigate(`/notepad/write/${note.id}`);
    };

    const handleDeleteNote = async (note) => {
        try {
            const res = await fetch(`/api/notepads/${note.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken
                }
            });
            const data = await res.json();
            if (data.success) {
                showAlert(data.message, true);
                setNoteLoading(false);
                setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id));
                navigate(`/notepad/write`);
                if (noteIdRef.current === note.id) {
                    setIsWriting(false);
                    setNoteId("");
                    quillInstance.current?.setText('');
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (quillInstance.current) return;

        const toolbarOptions = [
            ['bold', 'italic', 'underline'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['clean'],
            ['image', 'divider']
        ];

        const quill = new Quill(quillRef.current, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        divider: function () {
                            const range = this.quill.getSelection();
                            if (range) this.quill.insertText(range.index, '\n———\n', Quill.sources.USER);
                        }
                    }
                }
            }
        });

        quillInstance.current = quill;

        let saveTimeout;
        quill.on('text-change', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(updateNotepad, 2000);
        });

        const handleSaveShortcut = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                e.stopPropagation();
                updateNotepad();
            }
        };

        window.addEventListener("keydown", handleSaveShortcut, { capture: true });
        return () => window.removeEventListener("keydown", handleSaveShortcut, { capture: true });
    }, []);

    useEffect(() => {
        setNoteLoading(true);

        const loadNotes = async () => {
            authCheck();
            if (!user?.id) return;
            try {
                const res = await fetch(`/api/notepads/${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setNoteLoading(false);
                    setNotes(data.notepads.map(n => ({
                        id: n.id,
                        title: n.title,
                        created_at: n.created_at,
                    })));
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadNotes();
    }, [user]);

    useEffect(() => {
        setEmptyNotepad(notes.length === 0);
    }, [notes]);

    return (
        <div className="note-container flex h-full gap-3 p-[2rem] relative">

            <div className="flex flex-col w-[25%]">
                <div className="h-[10%]">
                    <h3 className="border-l-4 border-blue-500 pl-3 text-3xl m-0">메모</h3>
                </div>

                <div className="w-full h-[90%] rounded-xl shadow-sm bg-white overflow-y-auto relative">
                    <div className="w-full bg-white shadow-sm p-3 sticky top-0 flex justify-between items-center">

                        <div className="w-full flex items-center gap-2">
                            <div>
                                <label htmlFor="search-note-title" className="block text-sm pl-1">검색</label>
                                <input onChange={(e) => setSearchTerm(e.target.value)}
                                       type="text"
                                       id="search-note-title"
                                       placeholder="제목을 입력해주세요."
                                       className="border h-[35px] border-gray-300 rounded px-2 py-1 w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label htmlFor="orderBy" className="block text-sm">정렬</label>
                                <select
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    id="orderBy"
                                    className="border border-gray-300 h-[35px] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="desc">내림차순</option>
                                    <option value="asc">오름차순</option>
                                </select>
                            </div>
                        </div>

                        <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md ml-3" onClick={() => {setModal(true)}}>
                            <i className="fa-solid fa-plus"></i>
                        </button>
                    </div>

                    {emptyNotepad && (
                        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 text-gray-500">
                            메모가 없습니다
                        </p>
                    )}

                    {filteredNotes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => handleSelectNote(note)}
                            className={`flex justify-between items-center w-full p-3 border-b border-b-gray-300 cursor-pointer
                            ${note.id === noteId ? 'bg-blue-500 text-white' : 'bg-white'}
                        `}
                        >
                            <input
                                readOnly={note.id !== noteId}
                                type="text"
                                className={`bg-transparent w-[70%] focus:outline-none
                                ${note.id === noteId ? 'text-white' : 'text-black'}
                            `}
                                disabled={noteLoading}
                                value={note.title}
                                onChange={(e) => updateNoteTitleTyping(e, note.id)}
                                onKeyDown={(e) => updateNoteTitleEvent(e, note.id)}
                                onBlur={(e) => resetNoteTitleEvent(e, note.id)}
                            />

                            <div className="flex items-center gap-2">
                            <span className="text-xs opacity-80">
                                {note.created_at.split(" ")[0]}
                            </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNote(note);
                                    }}
                                    className="bg-red-600 hover:bg-red-600 cursor-pointer text-white text-xs px-2 py-1 rounded"
                                >
                                    <i className="fa-solid fa-x"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`${isWriting ? "flex-1 bg-white shadow-sm rounded overflow-y-auto" : "hidden"}`}>
                <div ref={quillRef}></div>
            </div>

            {noteLoading && (
                <div className="absolute inset-0 bg-black/10 bg-opacity-10 flex items-center justify-center z-[999]">
                    <i className="fa-solid fa-spinner animate-spin text-3xl text-gray-600"></i>
                </div>
            )}

            {alertSwitch && (
                <div
                    className={`alert ${alertStatus ? "alert-success" : "alert-danger"}`}
                >
                    {alertMessage}
                </div>
            )}

            {modal && (
                <div className="modal-area" onClick={() => {setModal(false);setNoteTitle('');}}>
                    <div className="modal">
                        <div className="modal-content mid-modal" onClick={(e) => {e.stopPropagation()}}>
                            <div className="modal-header">
                                <h1 className="text-xl m-0">새 메모 등록</h1>
                                <button onClick={() => {setModal(false); setNoteTitle('');}}>
                                    <i className="fa-solid fa-x text-gray-500 hover:text-black cursor-pointer"></i>
                                </button>
                            </div>
                            <div className="modal-body">
                                <input type="text" name="" id="" className="border border-gray-300 w-full rounded py-2" onChange={(e) => {setNoteTitle(e.target.value);}} placeholder=" 제목을 입력해주세요."/>
                                <span className="note-title-text text-xs text-red-600"></span>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => {setModal(false); setNoteTitle('');}} className="btn bg-gray-400 hover:bg-gray-500 active:bg-gray-600 text-white mr-2">닫기</button>
                                <button className="btn btn-primary" onClick={handleSubmitNote}>등록</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

}

export default Write;
