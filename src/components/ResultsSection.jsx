import ReactMarkdown from 'react-markdown'

export default function ResultsSection({ resultado, resultRef }) {
  if (!resultado) return null

  return (
    <div ref={resultRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-udi-dark px-5 py-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-white font-semibold text-sm">Resultado de la revisión</span>
      </div>
      <div className="p-5">
        <div className="prose max-w-none">
          <ReactMarkdown>{resultado}</ReactMarkdown>
        </div>
      </div>
      <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">
          Esta revisión es orientativa. El docente tiene la decisión final sobre la aprobación de tus documentos.
        </p>
      </div>
    </div>
  )
}
