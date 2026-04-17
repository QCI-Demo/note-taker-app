import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { LoadingSpinner } from '../components/LoadingSpinner'

const NotesListPage = lazy(() => import('../pages/NotesListPage'))
const NoteEditorPage = lazy(() => import('../pages/NoteEditorPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NotesListPage />
          </Suspense>
        ),
      },
      {
        path: 'editor',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NoteEditorPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
