// components/MyEditor.tsx
'use client';

import React from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"


export default function MyEditor({ data, onChange, id }: { id: string,data: string; onChange: (val: string) => void }) {
    const Editor = ClassicEditor as unknown as {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: (...args: any[]) => Promise<any>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        EditorWatchdog: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ContextWatchdog: any;
    };

    return (
        <CKEditor id={id}
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            editor={Editor}
            data={data}
            onChange={(_, editor) => {
                const data = editor.getData();
                onChange(data);
            }}
        />
    );
}

