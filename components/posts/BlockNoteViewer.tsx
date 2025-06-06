"use client"

import "@blocknote/core/fonts/inter.css"
import { Block, BlockNoteEditor } from "@blocknote/core"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"

interface BlockNoteViewerProps {
  content: string
}

const BlockNoteViewer = ({ content }: BlockNoteViewerProps) => {
  const editor: BlockNoteEditor | null = useCreateBlockNote({
    initialContent: content ? (JSON.parse(content) as Block[]) : undefined,
  })

  if (!editor) {
    return null
  }

  return <BlockNoteView editor={editor} editable={false} theme="light" />
}

export default BlockNoteViewer 