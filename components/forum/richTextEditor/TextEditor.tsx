'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Box, IconButton, Paper, Tooltip } from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Undo,
  Redo,
  Code,
} from '@mui/icons-material'

type Props = {
  onContentChange?: (html: string) => void;
  initialContent?:string;
}

const TextEditor = ({ onContentChange, initialContent }: Props) => {

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent || '<p></p>',
    editorProps: {
      attributes: {
        class: 'min-h-[200px] max-h-[600px] outline-none focus:outline-none text-base leading-6',
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML()
      onContentChange?.(html)
    }
  })

  if (!editor) return null

  const getButtonColor = (format: string) => (editor.isActive(format) ? 'primary' : 'inherit')

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff'}}>
      {/* Toolbar */}
      <Box display="flex" flexWrap="wrap" gap={0.5} mb={2} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
        <Tooltip title="Bold">
          <IconButton onClick={() => editor.chain().focus().toggleBold().run()} size="small" color={getButtonColor('bold')}>
            <FormatBold />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} size="small" color={getButtonColor('italic')}>
            <FormatItalic />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} size="small" color={getButtonColor('underline')}>
            <FormatUnderlined />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bullet List">
          <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()} size="small" color={getButtonColor('bulletList')}>
            <FormatListBulleted />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered List">
          <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()} size="small" color={getButtonColor('orderedList')}>
            <FormatListNumbered />
          </IconButton>
        </Tooltip>
        <Tooltip title="Code Block">
          <IconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} size="small" color={getButtonColor('codeBlock')}>
            <Code />
          </IconButton>
        </Tooltip>
        <Box sx={{ borderLeft: 1, borderColor: 'divider', mx: 1, my: 0.5, height: '24px' }} />
        <Tooltip title="Undo">
          <IconButton onClick={() => editor.chain().focus().undo().run()} size="small">
            <Undo />
          </IconButton>
        </Tooltip>
        <Tooltip title="Redo">
          <IconButton onClick={() => editor.chain().focus().redo().run()} size="small">
            <Redo />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editor Content */}
      <Box
        sx={{
          border: '1px solid #ccc',
          borderRadius: 2,
          p: 2,
          minHeight: 200,
          maxHeight: 600,
          overflowY: 'auto',
          fontSize: '1rem',
          lineHeight: 1.6,
          '&:focus-within': {
            borderColor: 'primary.main',
          },
          // List
          '& ul, & ol': {
            paddingLeft: '2rem',
          },
          '& ul': {
            listStyleType: 'disc',
          },
          '& ol': {
            listStyleType: 'decimal',
          },
          // Code
          '& pre': {
            background: '#f4f4f4',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            color: '#333',
            fontFamily: 'monospace',
            padding: '0.75rem 1rem',
            whiteSpace: 'pre-wrap',
          },
          '& pre code': {
            background: 'none',
            color: 'inherit',
            fontFamily: 'inherit',
            padding: 0,
            fontSize: '0.9rem',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  )
}

export default TextEditor