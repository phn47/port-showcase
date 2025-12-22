import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    label?: string;
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    height?: string;
    className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    label,
    value,
    onChange,
    placeholder,
    height = '300px',
    className = '',
}) => {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'clean'],
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list',
        'color', 'background',
        'link'
    ];

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500">
                    {label}
                </label>
            )}
            <div className="admin-quill-editor" style={{ height }}>
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                    className="h-full bg-white/5 border border-white/10 rounded-lg overflow-hidden"
                />
            </div>
            <style>{`
                .admin-quill-editor .ql-toolbar {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
                .admin-quill-editor .ql-container {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-top: none;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                    font-family: inherit;
                    color: white;
                }
                .admin-quill-editor .ql-editor {
                    min-height: 100px;
                }
                .admin-quill-editor .ql-editor.ql-blank::before {
                    color: rgba(255, 255, 255, 0.3);
                    font-style: normal;
                }
                .admin-quill-editor .ql-stroke {
                    stroke: #9ca3af;
                }
                .admin-quill-editor .ql-fill {
                    fill: #9ca3af;
                }
                .admin-quill-editor .ql-picker {
                    color: #9ca3af;
                }
                .admin-quill-editor .ql-picker-options {
                    background: #1a1a1a;
                    border-color: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};
