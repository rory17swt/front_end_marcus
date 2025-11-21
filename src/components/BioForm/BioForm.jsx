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
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
          ({ commands }) =>
            this.options.types.every((t) =>
              commands.updateAttributes(t, { lineHeight }),
            ),
      unsetLineHeight:
        () =>
          ({ commands }) =>
            this.options.types.every((t) =>
              commands.resetAttributes(t, 'lineHeight'),
            ),
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
        if (res.data.bio) editor.commands.setContent(res.data.bio)
      } catch (err) {
        setError('Failed to load bio')
      } finally {
        setLoading(false)
      }
    }

    fetchBio()
  }, [editor])

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
    <div className="min-h-screen bg-[#E8DCC8] flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8 md:p-10">

        <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-8 text-center">
          Edit Your Biography
        </h2>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 p-4 mb-6 bg-gray-100 rounded-lg border border-gray-300">

          {/* Group Style */}
          {[
            {
              label: "Formatting",
              buttons: [
                { action: () => editor.chain().focus().toggleBold().run(), label: <b>B</b> },
                { action: () => editor.chain().focus().toggleItalic().run(), label: <i>I</i> },
                { action: () => editor.chain().focus().toggleUnderline().run(), label: <u>U</u> },
              ],
            },
            {
              label: "Headings",
              buttons: [
                { action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), label: "H1" },
                { action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), label: "H2" },
                { action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), label: "H3" },
                { action: () => editor.chain().focus().setParagraph().run(), label: "P" },
              ],
            },
            {
              label: "Lists",
              buttons: [
                { action: () => editor.chain().focus().toggleBulletList().run(), label: "• List" },
                { action: () => editor.chain().focus().toggleOrderedList().run(), label: "1. List" },
              ],
            },
            {
              label: "Align",
              buttons: [
                { action: () => editor.chain().focus().setTextAlign("left").run(), label: "⬅" },
                { action: () => editor.chain().focus().setTextAlign("center").run(), label: "⬌" },
                { action: () => editor.chain().focus().setTextAlign("right").run(), label: "➡" },
                { action: () => editor.chain().focus().setTextAlign("justify").run(), label: "≋" },
              ],
            },
            {
              label: "Line Height",
              buttons: [
                { action: () => editor.chain().focus().setLineHeight("1.0").run(), label: "1.0" },
                { action: () => editor.chain().focus().setLineHeight("1.5").run(), label: "1.5" },
                { action: () => editor.chain().focus().setLineHeight("2.0").run(), label: "2.0" },
              ],
            },
            {
              label: "Other",
              buttons: [
                { action: () => editor.chain().focus().toggleBlockquote().run(), label: '"' },
              ],
            },
          ].map((group, i) => (
            <div key={i} className="flex gap-2 pr-3 border-r last:border-r-0 border-gray-300">
              {group.buttons.map((btn, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={btn.action}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-200 transition text-sm"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Editor */}
        <EditorContent
          editor={editor}
          className="border border-gray-300 rounded-md bg-white p-4 min-h-[300px] focus:outline-none"
        />

        {/* CV Upload */}
        <div className="mt-6">
          <label htmlFor="cv-upload" className="font-medium text-gray-700">
            Upload New CV (PDF):
          </label>
          <input
            type="file"
            id="cv-upload"
            accept=".pdf"
            onChange={handleCvChange}
            className="block mt-2"
          />
        </div>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-8 w-full bg-[#C4A77D] text-white py-2 rounded-md hover:bg-[#B59770] transition disabled:opacity-60"
        >
          {isSaving ? "Updating Bio..." : "Update Bio"}
        </button>

      </div>
    </div>
  )
}
