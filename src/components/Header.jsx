export default function Header() {
  return (
    <header className="bg-udi-dark text-white shadow-lg">
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
              Practicas Laborales &nbsp;|&nbsp; Gestión I-2026
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
