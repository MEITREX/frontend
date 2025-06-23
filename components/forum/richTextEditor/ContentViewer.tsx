import DOMPurify from 'dompurify'
import './ContentViewer.css'

export default function ContentViewer({ htmlContent }: { htmlContent: string }) {
  const sanitizedHtml = DOMPurify.sanitize(htmlContent)

  return (
    <div
      className="prose-styles"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}

