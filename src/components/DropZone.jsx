import { useState, useRef, useCallback } from 'react'

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export default function DropZone({ label, sublabel, acceptedExt, onFileAccepted, file, error }) {
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
