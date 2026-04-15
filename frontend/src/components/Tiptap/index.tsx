"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import StarterKit from "@tiptap/starter-kit";

const Tiptap = () => {
  const editor = useEditor({
    // extensions: [
    //   Document,
    //   Paragraph,
    //   Text,
    //   Heading.configure({ levels: [1, 2, 3] }),
    // ],
    extensions: [StarterKit],
    content: "<p>Example Text</p>",
    autofocus: true,
    editable: true,
    injectCSS: false,
    immediatelyRender: false,
  });

  if (!editor) return null;

  return <EditorContent editor={editor} />;
};

export default Tiptap;
