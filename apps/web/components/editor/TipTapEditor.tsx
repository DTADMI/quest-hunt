'use client';

import React, {useEffect} from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

type TipTapEditorProps = {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
};

export function TipTapEditor({value, onChange, placeholder, className}: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({openOnClick: true, autolink: true, linkOnPaste: true}),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: `prose prose-sm dark:prose-invert focus:outline-none min-h-[160px] ${className ?? ''}`,
            },
        },
        onUpdate: ({editor}) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Avoid loop: only set if content changed externally
            editor.commands.setContent(value || '', false);
        }
    }, [value]);

    if (!editor) return null;

    return (
        <div className="border rounded-md">
            <div className="flex flex-wrap gap-2 border-b p-2 text-sm">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="px-2 py-1 rounded hover:bg-muted"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="px-2 py-1 rounded hover:bg-muted italic"
                >
                    I
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className="px-2 py-1 rounded hover:bg-muted"
                >
                    • List
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className="px-2 py-1 rounded hover:bg-muted"
                >
                    1. List
                </button>
            </div>
            <div className="p-3">
                <EditorContent editor={editor}/>
                {placeholder && !value && (
                    <div className="pointer-events-none text-sm text-muted-foreground mt-2">
                        {placeholder}
                    </div>
                )}
            </div>
        </div>
    );
}
