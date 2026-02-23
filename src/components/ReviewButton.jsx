export default function ReviewButton({ canReview, onClick }) {
  return (
    <div className="flex justify-center mb-8">
      <button
        onClick={onClick}
        disabled={!canReview}
        className={`
          flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm
          transition-all duration-200 shadow-md
          ${
            canReview
              ? 'bg-udi-dark hover:bg-udi-medium text-white cursor-pointer hover:shadow-lg active:scale-95'
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
  )
}
