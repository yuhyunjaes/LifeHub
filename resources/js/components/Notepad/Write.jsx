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

    const [alertSwitch, setAlertSwitch] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertStatus, setAlertStatus] = useState(false);

    const quillRef = useRef(null);
    const quillInstance = useRef(null);
    const noteIdRef = useRef(0);
    const csrfRef = useRef(csrfToken);
    const modalRef = useRef(null);
    const modalInstance = useRef(null);

    useEffect(() => {
        if (!id) return;
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
        if (modalRef.current) {
            modalInstance.current = new bootstrap.Modal(modalRef.current);
        }
    }, []);

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

    const closeModal = (e) => {
        if (e.target.classList.contains('form-control')) return;
        document.activeElement?.blur();
    };

    const handleNote = () => {
        setNoteTitle('');
        const titleText = document.querySelector('.note-title-text');
        titleText.textContent = '';
        modalInstance.current?.show();
    };

    const handleSubmitNote = async () => {
        if (!noteTitle.trim()) {
            const titleText = document.querySelector('.note-title-text');
            if (titleText) titleText.textContent = '제목을 입력해주세요.';
            return;
        }

        document.activeElement?.blur();
        modalInstance.current?.hide();
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
                updateNotepad();
            }
        };

        window.addEventListener("keydown", handleSaveShortcut);
        return () => window.removeEventListener("keydown", handleSaveShortcut);
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
        <div className="note-container h-100 d-flex gap-3 p-5 position-relative">
            <div>
                <div className="note-title">
                    <h3 className="border-start border-3 ps-3 border-primary m-0">메모</h3>
                </div>
                <div className="note-list rounded shadow-sm bg-white overflow-x-hidden overflow-y-auto position-relative">
                    <div className="w-100 bg-white shadow-sm p-3 position-sticky top-0 d-flex justify-content-between align-items-center">

                        <div className="w-100 d-flex justify-content-start align-items-center m-0">
                            <div className="m-0">
                                <label htmlFor="search-note-title" className="form-label ms-1">검색</label>
                                <input onChange={(e) => setSearchTerm(e.target.value)}
                                       type="text" name="search-note-title" id="search-note-title" className="form-control" placeholder="제목을 입력해주세요."/>
                            </div>
                            <div className="m-0 ms-2">
                                <label htmlFor="orderBy" className="form-label">정렬</label>
                                <select onChange={(e) => setSortOrder(e.target.value)} name="orderBy" id="orderBy" className="form-select">
                                    <option value="desc">등록일 기준 내림차순</option>
                                    <option value="asc">등록일 기준 오름차순</option>
                                </select>
                            </div>
                        </div>

                        <button onClick={handleNote} className="btn btn-primary ms-3">
                            <i className="fa-solid fa-plus"></i>
                        </button>
                    </div>

                    <div className={`${emptyNotepad ? 'd-block' : 'd-none'} position-absolute top-50 start-50 translate-middle`}>
                        메모가 존재하지 않습니다.
                    </div>

                    {filteredNotes.map(note => (
                        <div
                            key={note.id}
                            className={`note-item d-flex justify-content-between align-items-center position-relative w-100 p-3 border shadow-sm ${note.id === noteId ? 'bg-primary text-white' : ''}`}
                            onClick={() => handleSelectNote(note)}
                            style={{ cursor: 'pointer' }}
                        >
                            <input
                                type="text"
                                className={`m-0 title-form border-0 ${note.id === noteId ? 'text-white' : 'text-dark'}`}
                                value={note.title}
                                onChange={(e) => updateNoteTitleTyping(e, note.id)}
                                onKeyDown={(e) => updateNoteTitleEvent(e, note.id)}
                                onBlur={(e) => resetNoteTitleEvent(e, note.id)}
                            />
                            <div className="m-0">
                                <span className="date-box">
                                  {note.created_at.split(' ')[0]}
                                </span>

                                <button onClick={() => handleDeleteNote(note)} className="btn btn-primary ms-2 py-1">
                                    <i className="fa-solid fa-x small-font"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div
                className="notepad-write bg-white shadow-sm rounded overflow-x-hidden overflow-y-auto position-relative"
                style={{ display: isWriting ? 'block' : 'none' }}
            >
                <div ref={quillRef}></div>
            </div>

            <div ref={modalRef} className="modal fade" id="myModal" tabIndex="-1" aria-hidden="true" onClick={closeModal}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header m-0">
                            <h5 className="modal-title m-0">새 메모 등록</h5>
                            <button type="button" className="btn-close" onClick={closeModal} data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body m-0">
                            <label htmlFor="note-title" className="form-label">제목</label>
                            <input
                                type="text"
                                name="note-title"
                                id="note-title"
                                className="form-control"
                                placeholder="제목을 입력해주세요."
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                            />
                            <p className="note-title-text m-0 form-text text-danger"></p>
                        </div>
                        <div className="modal-footer m-0">
                            <button type="button" className="btn btn-primary" onClick={handleSubmitNote}>
                                등록
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {
                noteLoading ? (
                    <div className="note-loading-container top-0 w-100 end-0 position-absolute d-block bg-dark z-3 bg-opacity-10">
                        <div className="rotate-box position-absolute top-50 start-50 translate-middle">
                            <i className="fa-solid fa-spinner fs-1 text-dark"></i>
                        </div>
                    </div>
                ) : ''
            }
            {
                alertSwitch ? (
                        <div className={`note-alert-message alert alert-${alertStatus ? 'success' : 'danger'} position-fixed z-2 end-0 m-0`}>
                            {alertMessage}
                        </div>
                    )
                    : ''
            }
        </div>
    );
}

export default Write;
