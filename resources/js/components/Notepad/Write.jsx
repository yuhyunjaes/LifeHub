import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import Notepad from "@/components/Notepad.jsx";

function Write({ user, csrfToken }) {
    const [noteId, setNoteId] = useState(0);
    const [notes, setNotes] = useState([]);
    const [isWriting, setIsWriting] = useState(false);

    const quillRef = useRef(null);
    const quillInstance = useRef(null);
    const noteIdRef = useRef(0);
    const csrfRef = useRef(csrfToken);

    // 최신 noteId를 ref에 저장
    useEffect(() => {
        noteIdRef.current = noteId;
    }, [noteId]);

    // 최신 CSRF를 ref에 저장
    useEffect(() => {
        csrfRef.current = csrfToken;
    }, [csrfToken]);

    const handleNote = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch('/api/notepads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfRef.current
                },
                body: JSON.stringify({ user_id: user.id })
            });
            const data = await res.json();
            if (data.success) {
                setNoteId(data.id);
                setNotes(prev => [...prev, { id: data.id, title: `메모 #${data.id}`, content: '' }]);
                setIsWriting(true);
                if (quillInstance.current) quillInstance.current.root.innerHTML = ''; // 새 메모 초기화
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectNote = (note) => {
        setNoteId(note.id);
        setIsWriting(true);
        if (quillInstance.current) quillInstance.current.root.innerHTML = note.content || '';
    };


    const handleDeleteNote = async (note) => {
        try {
            const res = await fetch(`/api/notepads/${note.id}`, {
                method:"DELETE",
                headers:{
                    "Content-Type":"application/json",
                    "X-CSRF-TOKEN":csrfToken
                }
            });
            const data = await res.json();
            if(data.success) {
                setNotes(prevNotes => prevNotes.filter(notepad => Number(note.id) !== Number(notepad.id)));

                if (Number(noteIdRef.current) === Number(note.id)) {
                    setIsWriting(false);
                    noteIdRef.current = 0;
                    setNoteId(0);
                    quillInstance.current?.setText('');
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Quill 한 번만 초기화
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

        // 자동 저장
        let saveTimeout;
        quill.on('text-change', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(async () => {
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
                    if(data.success) {
                        setNotes(prevNotes =>
                            prevNotes.map(note =>
                                Number(note.id) === Number(noteIdRef.current)
                                    ? { ...note, content: html }
                                    : note
                            )
                        );
                    }

                } catch (err) {
                    console.error(err);
                }
            }, 2000);
        });
    }, []);

    // 기존 노트 불러오기
    useEffect(() => {
        const loadNotes = async () => {
            if (!user?.id) return;
            try {
                const res = await fetch(`/api/notepads/${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setNotes(data.notepads.map(n => ({
                        id: n.id,
                        title: `메모 #${n.id}`,
                        content: n.content || ''
                    })));
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadNotes();
    }, [user]);

    return (
        <div className="note-container h-100 d-flex gap-3 p-5">
            <div>
                <div className="note-title">
                    <h3 className="border-start border-3 ps-3 border-primary m-0">메모</h3>
                </div>
                <div className="note-list rounded shadow-sm bg-white overflow-x-hidden overflow-y-auto position-relative">
                    <div className="w-100 bg-white shadow-sm p-3 position-sticky top-0 d-flex justify-content-end align-items-center">
                        <button onClick={handleNote} className="btn btn-primary">
                            <i className="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    {notes.map(note => (
                        <div
                            key={note.id}
                            className={`note-item d-flex justify-content-between align-items-center w-100 p-3 border shadow-sm ${Number(note.id) === Number(noteId) ? 'bg-primary text-white' : ''}`}
                            onClick={() => handleSelectNote(note)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="m-0">{note.title}</span>
                            <button onClick={() => handleDeleteNote(note)} className="btn btn-danger m-0 py-1">
                                <i className="fa-solid fa-trash small-font"></i>
                            </button>
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
        </div>
    );
}

export default Write;
