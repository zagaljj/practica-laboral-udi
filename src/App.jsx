import { useState, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
import DropZone from './components/DropZone'
import Header from './components/Header'
import IntroCard from './components/IntroCard'
import StatusHints from './components/StatusHints'
import ReviewButton from './components/ReviewButton'
import ResultsSection from './components/ResultsSection'
import Footer from './components/Footer'

// ─── Text Extraction Helpers ──────────────────────────────────────────────────

async function extractXlsxText(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  let text = ''
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName]
    text += `--- Hoja: ${sheetName} ---\n`
    text += XLSX.utils.sheet_to_csv(sheet) + '\n\n'
  })
  return text
}

async function extractDocxText(file) {
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <svg
        className="animate-spin w-10 h-10 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="text-sm text-gray-600 font-medium">Analizando tus documentos con IA...</p>
      <p className="text-xs text-gray-400">Esto puede tardar unos segundos</p>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [fichaFile, setFichaFile] = useState(null)
  const [convenioFile, setConvenioFile] = useState(null)
  const [fichaError, setFichaError] = useState(null)
  const [convenioError, setConvenioError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState('')
  const [apiError, setApiError] = useState('')
  const resultRef = useRef(null)

  const canReview = fichaFile && convenioFile && !fichaError && !convenioError && !loading

  const handleFicha = useCallback((file, error) => {
    setFichaFile(file)
    setFichaError(error)
    setResultado('')
    setApiError('')
  }, [])

  const handleConvenio = useCallback((file, error) => {
    setConvenioFile(file)
    setConvenioError(error)
    setResultado('')
    setApiError('')
  }, [])

  const handleReview = async () => {
    if (!canReview) return
    setLoading(true)
    setResultado('')
    setApiError('')

    try {
      const [fichaTexto, convenioTexto] = await Promise.all([
        extractXlsxText(fichaFile),
        extractDocxText(convenioFile),
      ])

      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fichaTexto, convenioTexto }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Error del servidor (${response.status})`)
      }

      setResultado(data.resultado)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      setApiError(
        err.message || 'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <IntroCard />

        {/* Drop zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 pl-1">
              Documento 1
            </label>
            <DropZone
              label="Ficha de Inscripción"
              sublabel="Archivo Excel (.xlsx)"
              acceptedExt=".xlsx"
              onFileAccepted={handleFicha}
              file={fichaFile}
              error={fichaError}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 pl-1">
              Documento 2
            </label>
            <DropZone
              label="Convenio Interinstitucional"
              sublabel="Archivo Word (.docx)"
              acceptedExt=".docx"
              onFileAccepted={handleConvenio}
              file={convenioFile}
              error={convenioError}
            />
          </div>
        </div>

        <StatusHints fichaFile={fichaFile} convenioFile={convenioFile} />

        <ReviewButton canReview={canReview} onClick={handleReview} />

        {loading && <Spinner />}

        {/* API Error */}
        {apiError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">Error al procesar</p>
              <p className="text-sm text-red-600 mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        {!loading && <ResultsSection resultado={resultado} resultRef={resultRef} />}
      </main>

      <Footer />
    </div>
  )
}
