export default function StatusHints({ fichaFile, convenioFile }) {
  if (!fichaFile && !convenioFile) {
    return (
      <p className="text-center text-xs text-gray-400 mb-4">
        Sube ambos documentos para habilitar la revisión
      </p>
    )
  }
  if (fichaFile && !convenioFile) {
    return (
      <p className="text-center text-xs text-blue-500 mb-4">
        Ficha cargada. Sube también el Convenio para continuar.
      </p>
    )
  }
  if (!fichaFile && convenioFile) {
    return (
      <p className="text-center text-xs text-blue-500 mb-4">
        Convenio cargado. Sube también la Ficha de Inscripción para continuar.
      </p>
    )
  }
  return null
}
