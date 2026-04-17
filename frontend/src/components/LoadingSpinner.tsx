import './LoadingSpinner.css'

export function LoadingSpinner() {
  return (
    <div className="loading-spinner" role="status" aria-live="polite" aria-label="Loading">
      <span className="loading-spinner__ring" aria-hidden="true" />
      <span className="visually-hidden">Loading…</span>
    </div>
  )
}
