import { useParams } from 'react-router-dom'

export function EditorPage() {
  const { id } = useParams<{ id?: string }>()

  return (
    <div className="p-8 text-left">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Editor
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        {id ? (
          <>
            Editing note <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">{id}</code>
          </>
        ) : (
          'New note (no id)'
        )}
      </p>
    </div>
  )
}
