import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Extension } from '@tiptap/core'
import { useNavigate } from 'react-router'
import { getAuthBio, updateBio } from '../../services/bio'
import Spinner from '../Spinner/Spinner'

// Custom Line Height Extension
const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      heights: ['1.0', '1.5', '2.0'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {}
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight: (lineHeight) => ({ commands }) => {
        return this.options.types.every((type) =>
          commands.updateAttributes(type, { lineHeight })
        )
      },
      unsetLineHeight: () => ({ commands }) => {
        return this.options.types.every((type) =>
          commands.resetAttributes(type, 'lineHeight')
        )
      },
    }
  },
})

export default function BioForm() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [cvFile, setCvFile] = useState(null)

  const navigate = useNavigate()

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      LineHeight,
    ],
    content: '',
  })

  useEffect(() => {
    if (!editor) return

    async function fetchBio() {
      try {
        const res = await getAuthBio()
        if (res.data.bio) {
          editor.commands.setContent(res.data.bio)
        }
      } catch (err) {
        setError('Failed to load bio')
      } finally {
        setLoading(false)
      }
    }

    fetchBio()
  }, [editor])

  // Text formatting
  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run()
  
  // Lists
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  
  // Headings
  const setHeading = (level) => editor.chain().focus().toggleHeading({ level }).run()
  const setParagraph = () => editor.chain().focus().setParagraph().run()
  
  // Alignment
  const setAlignment = (align) => editor.chain().focus().setTextAlign(align).run()
  
  // Line Height
  const setLineHeight = (height) => editor.chain().focus().setLineHeight(height).run()
  
  // Other
  const setBlockquote = () => editor.chain().focus().toggleBlockquote().run()

  const handleCvChange = (e) => {
    setCvFile(e.target.files[0])
  }

  const handleSave = async () => {
    if (!editor) return
    setIsSaving(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('bio', editor.getHTML())

      if (cvFile) {
        formData.append('cv', cvFile)
      }

      await updateBio(formData)

      setCvFile(null)
      navigate('/')
    } catch (err) {
      setError('Failed to save bio and CV')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <h2>Edit Your Bio</h2>

      {/* Toolbar */}
      <div style={{ marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        
        {/* Text Formatting */}
        <div style={{ display: 'flex', gap: '5px', borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          <button type="button" onClick={toggleBold} title="Bold"><b>B</b></button>
          <button type="button" onClick={toggleItalic} title="Italic"><i>I</i></button>
          <button type="button" onClick={toggleUnderline} title="Underline"><u>U</u></button>
        </div>

        {/* Headings */}
        <div style={{ display: 'flex', gap: '5px', borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          <button type="button" onClick={() => setHeading(1)} title="Heading 1">H1</button>
          <button type="button" onClick={() => setHeading(2)} title="Heading 2">H2</button>
          <button type="button" onClick={() => setHeading(3)} title="Heading 3">H3</button>
          <button type="button" onClick={setParagraph} title="Paragraph">P</button>
        </div>

        {/* Lists */}
        <div style={{ display: 'flex', gap: '5px', borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          <button type="button" onClick={toggleBulletList} title="Bullet List">• List</button>
          <button type="button" onClick={toggleOrderedList} title="Numbered List">1. List</button>
        </div>

        {/* Alignment */}
        <div style={{ display: 'flex', gap: '5px', borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          <button type="button" onClick={() => setAlignment('left')} title="Align Left">⬅</button>
          <button type="button" onClick={() => setAlignment('center')} title="Align Center">⬌</button>
          <button type="button" onClick={() => setAlignment('right')} title="Align Right">➡</button>
          <button type="button" onClick={() => setAlignment('justify')} title="Justify">⬌⬌</button>
        </div>

        {/* Line Height */}
        <div style={{ display: 'flex', gap: '5px', borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          <button type="button" onClick={() => setLineHeight('1.0')} title="Line Height 1.0">1.0</button>
          <button type="button" onClick={() => setLineHeight('1.5')} title="Line Height 1.5">1.5</button>
          <button type="button" onClick={() => setLineHeight('2.0')} title="Line Height 2.0">2.0</button>
        </div>

        {/* Other */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button type="button" onClick={setBlockquote} title="Blockquote">"</button>
        </div>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        style={{ border: '1px solid #ccc', minHeight: 300, padding: 10, backgroundColor: 'white', color: 'black' }}
      />

      {/* CV Upload */}
      <div style={{ marginTop: '1rem' }}>
        <label htmlFor="cv-upload">Upload New CV (PDF): </label>
        <input
          type="file"
          id="cv-upload"
          accept=".pdf"
          onChange={handleCvChange}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Save Button */}
      <button onClick={handleSave} disabled={isSaving} style={{ marginTop: '1rem' }}>
        {isSaving ? 'Updating...' : 'Update Bio'}
      </button>
    </div>
  )
}