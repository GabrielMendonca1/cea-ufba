"use client"

import "@blocknote/core/fonts/inter.css"
import { Block, BlockNoteEditor } from "@blocknote/core"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { useEffect } from "react"

interface EditorProps {
  onChange: (value: string) => void
  initialContent?: string
  editable?: boolean
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const editor: BlockNoteEditor | null = useCreateBlockNote()

  useEffect(() => {
    if (editor && initialContent) {
      const getBlocks = async () => {
        const blocks: Block[] = await editor.tryParseMarkdownToBlocks(initialContent)
        editor.replaceBlocks(editor.document, blocks)
      }
      getBlocks()
    }
  }, [editor, initialContent])

  const handleEditorChange = () => {
    if (editor) {
      onChange(JSON.stringify(editor.document, null, 2))
    }
  }

  return (
    <div>
      {editor && (
        <BlockNoteView
          editor={editor}
          editable={editable}
          onChange={handleEditorChange}
          theme="light"
        />
      )}
    </div>
  )
}

export default Editor 