import { useRef, useState } from 'react'

interface Props {
  onFile: (file: File) => void
  loading: boolean
  error: string | null
}

export function FileUpload({ onFile, loading, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (file) onFile(file)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition ${
          dragOver
            ? 'border-brand-blue bg-brand-mist/40 dark:bg-brand-blue/15'
            : 'border-slate-300 hover:border-brand-blue/60 dark:border-slate-700'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-4xl">📄</p>
        <p className="mt-3 text-base font-medium text-slate-700 dark:text-slate-200">
          {loading ? 'Leyendo tu PDF…' : 'Arrastra aquí tu Estado de Cuenta Histórico de INFONAVIT'}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          o haz clic para seleccionar el archivo PDF
        </p>
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        🔒 Todo se procesa en tu navegador. Tu PDF nunca se sube a ningún servidor.
      </p>
    </div>
  )
}
