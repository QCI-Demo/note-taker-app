import { NavLink, Outlet } from 'react-router-dom'
import './AppLayout.css'

export function AppLayout() {
  return (
    <div className="app-layout">
      <header className="app-layout__header">
        <h1 className="app-layout__title">Note Taker</h1>
        <nav className="app-layout__nav" aria-label="Main">
          <NavLink to="/" className="app-layout__link" end>
            Notes
          </NavLink>
          <NavLink to="/editor" className="app-layout__link">
            Editor
          </NavLink>
          <NavLink to="/settings" className="app-layout__link">
            Settings
          </NavLink>
        </nav>
      </header>
      <main className="app-layout__main">
        <Outlet />
      </main>
    </div>
  )
}
