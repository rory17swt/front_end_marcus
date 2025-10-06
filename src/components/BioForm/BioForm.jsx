import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { useNavigate } from 'react-router'
import { getAuthBio, updateBio } from '../../services/bio'
import Spinner from '../Spinner/Spinner'

export default function BioForm() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [cvFile, setCvFile] = useState(null)

  const navigate = useNavigate()

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color],
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

  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()

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
      navigate('/') // Navigate to home on success
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

      <div>
        <button type="button" onClick={toggleBold}><b>B</b></button>
        <button type="button" onClick={toggleItalic}><i>I</i></button>
        <button type="button" onClick={toggleUnderline}><u>U</u></button>
        <button type="button" onClick={toggleBulletList}>• List</button>
        <button type="button" onClick={toggleOrderedList}>1. List</button>
      </div>

      <EditorContent
        editor={editor}
        style={{ border: '1px solid #ccc', minHeight: 200, padding: 10 }}
      />

      <div style={{ marginTop: '1rem' }}>
        <label htmlFor="cv-upload">Upload CV (PDF): </label>
        <input
          type="file"
          id="cv-upload"
          accept=".pdf"
          onChange={handleCvChange}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Updating...' : 'Update Bio'}
      </button>
    </div>
  )
}
