import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

const Editor = forwardRef(({ content, onUpdate }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank'
        }
      }),
      Image.configure({
        inline: false,
        allowBase64: true
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({
        multicolor: true
      })
    ],
    content: content || '<p>Start editing your email here...</p>',
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    }
  });

  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
    setContent: (html) => {
      if (editor) {
        editor.commands.setContent(html, false);
      }
    },
    getEditor: () => editor
  }));

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, []);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} className="tiptap" />;
});

Editor.displayName = 'Editor';

export default Editor;
