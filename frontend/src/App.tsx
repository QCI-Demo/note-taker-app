import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { EditorPage } from './pages/EditorPage'
import { ListPage } from './pages/ListPage'
import { SettingsPage } from './pages/SettingsPage'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-violet-600 text-white'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ')

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <nav
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3"
          aria-label="Main"
        >
          <NavLink to="/" end className={linkClass}>
            Notes
          </NavLink>
          <NavLink to="/editor" className={linkClass}>
            Editor
          </NavLink>
          <NavLink to="/editor/sample-id" className={linkClass}>
            Editor (sample id)
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1">
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/editor/:id?" element={<EditorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
