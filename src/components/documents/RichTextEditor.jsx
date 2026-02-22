import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function RichTextEditor({ value, onChange, readOnly = false }) {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
            [{ 'align': [] }],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
    };

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'indent', 'link', 'align',
        'color', 'background'
    ];

    return (
        <div className="h-full flex flex-col">
            <ReactQuill
                value={value || ''}
                onChange={onChange}
                readOnly={readOnly}
                modules={readOnly ? { toolbar: false } : modules}
                formats={formats}
                className="flex-1 h-full"
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                theme="snow"
                placeholder="Start writing your document..."
            />
            
            <style jsx global>{`
                .ql-container {
                    flex: 1 !important;
                    height: auto !important;
                    min-height: 400px !important;
                }
                
                .ql-editor {
                    height: auto !important;
                    min-height: 400px !important;
                    max-height: none !important;
                    overflow-y: auto !important;
                    padding: 20px !important;
                    font-size: 16px !important;
                    line-height: 1.6 !important;
                }
                
                .ql-toolbar {
                    border-top: 1px solid #ccc !important;
                    border-left: 1px solid #ccc !important;
                    border-right: 1px solid #ccc !important;
                }
                
                .ql-container {
                    border-bottom: 1px solid #ccc !important;
                    border-left: 1px solid #ccc !important;
                    border-right: 1px solid #ccc !important;
                }
                
                /* Make sure the editor takes full height */
                .quill {
                    height: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                
                /* Ensure proper styling for read-only mode */
                .ql-editor.ql-blank::before {
                    font-style: italic;
                    color: #999;
                }
            `}</style>
        </div>
    );
}