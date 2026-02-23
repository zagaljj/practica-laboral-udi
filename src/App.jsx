import { useState, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
import ReactMarkdown from 'react-markdown'

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// ─── DropZone Component ───────────────────────────────────────────────────────

function DropZone({ label, sublabel, acceptedExt, onFileAccepted, file, error }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const validate = (f) => {
    if (!f) return 'No se recibió ningún archivo.'
    const ext = f.name.split('.').pop().toLowerCase()
    if (ext !== acceptedExt.replace('.', ''))
      return `Formato incorrecto. Solo se acepta ${acceptedExt}`
    if (f.size > MAX_FILE_SIZE_BYTES)
      return `El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB.`
    return null
  }

  const handleFile = useCallback(
    (f) => {
      const err = validate(f)
      onFileAccepted(f, err)
    },
    [acceptedExt, onFileAccepted],
  )

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => setDragging(false)

  const onInputChange = (e) => {
    const f = e.target.files[0]
    if (f) handleFile(f)
    e.target.value = ''
  }

  const statusColor = error
    ? 'border-red-400 bg-red-50'
    : file
    ? 'border-green-400 bg-green-50'
    : dragging
    ? 'border-blue-500 bg-blue-50'
    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-6 min-h-[180px] ${statusColor}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      aria-label={`Subir ${label}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedExt}
        className="hidden"
        onChange={onInputChange}
      />

      {/* Icon */}
      {!file && !error && (
        <svg
          className={`w-10 h-10 mb-3 transition-colors ${dragging ? 'text-blue-500' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}

      {/* Success icon */}
      {file && !error && (
        <svg className="w-10 h-10 mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}

      {/* Error icon */}
      {error && (
        <svg className="w-10 h-10 mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}

      <p className="font-semibold text-gray-800 text-center text-sm">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5 text-center">{sublabel}</p>

      {file && !error && (
        <p className="mt-2 text-xs text-green-700 font-medium text-center truncate max-w-full px-2">
          {file.name}
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600 font-medium text-center">{error}</p>
      )}

      {!file && !error && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          Arrastra el archivo aquí o haz clic para seleccionar
        </p>
      )}

      {(file || error) && (
        <button
          className="mt-3 text-xs text-gray-500 underline hover:text-gray-700 z-10"
          onClick={(e) => {
            e.stopPropagation()
            onFileAccepted(null, null)
          }}
        >
          Cambiar archivo
        </button>
      )}
    </div>
  )
}

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
      {/* Header */}
      <header style={{ backgroundColor: '#1e3a5f' }} className="text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">
                Revisión de Práctica Laboral
              </h1>
              <p className="text-blue-200 text-sm">
                Universidad para el Desarrollo y la Innovación — UDI &nbsp;|&nbsp; Gestión I-2026
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Intro card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-1">¿Cómo funciona?</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Sube tus dos documentos de práctica laboral. El sistema los analizará automáticamente
            con inteligencia artificial y te indicará los campos incompletos o incorrectos
            <strong> antes de que los entregues al docente</strong>.
          </p>
        </div>

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

        {/* Status hint */}
        {!fichaFile && !convenioFile && (
          <p className="text-center text-xs text-gray-400 mb-4">
            Sube ambos documentos para habilitar la revisión
          </p>
        )}
        {fichaFile && !convenioFile && (
          <p className="text-center text-xs text-blue-500 mb-4">
            Ficha cargada. Sube también el Convenio para continuar.
          </p>
        )}
        {!fichaFile && convenioFile && (
          <p className="text-center text-xs text-blue-500 mb-4">
            Convenio cargado. Sube también la Ficha de Inscripción para continuar.
          </p>
        )}

        {/* Review button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleReview}
            disabled={!canReview}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm
              transition-all duration-200 shadow-md
              ${
                canReview
                  ? 'bg-[#1e3a5f] hover:bg-[#2a5298] text-white cursor-pointer hover:shadow-lg active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Revisar documentos
          </button>
        </div>

        {/* Loading */}
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

        {/* Results */}
        {resultado && !loading && (
          <div ref={resultRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div style={{ backgroundColor: '#1e3a5f' }} className="px-5 py-3 flex items-center gap-2">
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-gray-400">
            Universidad para el Desarrollo y la Innovación (UDI) &nbsp;&bull;&nbsp; Escuela de Informática y Telecomunicaciones
          </p>
        </div>
      </footer>
    </div>
  )
}
