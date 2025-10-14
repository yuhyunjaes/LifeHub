import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

function Write({ user, csrfToken }) {
    const [emptyNotepad, setEmptyNotepad] = useState(false);
    const [noteId, setNoteId] = useState(0);
    const [notes, setNotes] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [updateNoteTitle, setUpdateNoteTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    const quillRef = useRef(null);
    const quillInstance = useRef(null);
    const noteIdRef = useRef(0);
    const csrfRef = useRef(csrfToken);
    const modalRef = useRef(null);
    const modalInstance = useRef(null);

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
            const targetNote = notes.find(n => Number(n.id) === Number(id));
            if (targetNote) setUpdateNoteTitle(targetNote.title);
        }

        setNotes(prev =>
            prev.map(n =>
                Number(n.id) === Number(id)
                    ? { ...n, title: value }
                    : n
            )
        );
    };


    const resetNoteTitleEvent = (e, id) => {
        if (updateNoteTitle) {
            setNotes(prev =>
                prev.map(n =>
                    Number(n.id) === Number(id)
                        ? { ...n, title: updateNoteTitle } // 원래 제목 복원
                        : n
                )
            );
            setUpdateNoteTitle(''); // 초기화
        }
    };

    const updateNoteTitleEvent = async (e, id) => {
        if (e.key === 'Enter') {
            const newTitle = e.target.value.trim();
            if (!newTitle) return;

            setNotes(prevNotes =>
                prevNotes.map(n =>
                    Number(n.id) === Number(id)
                        ? {...n, title: newTitle}
                        : n
                )
            );
            setUpdateNoteTitle('');

            try {
                await fetch(`/api/notepads/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfRef.current
                    },
                    body: JSON.stringify({ title: newTitle })
                });
            } catch (err) {
                console.error(err);
            }
        }
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
                setNotes(prev => [
                    {
                        id: data.id,
                        title: noteTitle,
                        content: '',
                        created_at: data.created_at,
                    },
                    ...prev
                ]);
                setIsWriting(true);
                if (quillInstance.current)
                    quillInstance.current.root.innerHTML = '';
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectNote = (note) => {
        setNoteId(note.id);
        setIsWriting(true);
        if (quillInstance.current)
            quillInstance.current.root.innerHTML = note.content || '';
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
                setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id));
                if (noteIdRef.current === note.id) {
                    setIsWriting(false);
                    setNoteId(0);
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

        async function updateNotepad() {
            if (!noteIdRef.current) return;
            const html = quill.root.innerHTML;
            try {
                const res = await fetch(`/api/notepads/${noteIdRef.current}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfRef.current
                    },
                    body: JSON.stringify({ text: html })
                });
                const data = await res.json();
                if (data.success) {
                    setNotes(prevNotes =>
                        prevNotes.map(note =>
                            note.id === noteIdRef.current
                                ? { ...note, content: html }
                                : note
                        )
                    );
                }
            } catch (err) {
                console.error(err);
            }
        }

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
        const loadNotes = async () => {
            if (!user?.id) return;
            try {
                const res = await fetch(`/api/notepads/${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setNotes(data.notepads.map(n => ({
                        id: n.id,
                        title: n.title,
                        content: n.content || '',
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
        <div className="note-container h-100 d-flex gap-3 p-5">
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

            <div ref={modalRef} className="modal fade" id="myModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header m-0">
                            <h5 className="modal-title m-0">새 메모 등록</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
                                onChange={(e) =>
                                    setNoteTitle(e.target.value)}
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
        </div>
    );
}

export default Write;
