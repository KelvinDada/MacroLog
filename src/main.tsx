import React from 'react'
import ReactDOM from 'react-dom/client'
import { DATABASE_NAME, loadOrCreateGoals, openDatabase, type Goals } from './db'
import './style.css'

function App() {
  const [status, setStatus] = React.useState('Preparando almacenamiento local…')
  const [goals, setGoals] = React.useState<Goals | null>(null)

  React.useEffect(() => {
    let active = true
    let database: IDBDatabase | undefined
    openDatabase()
      .then(async (db) => {
        database = db
        const savedGoals = await loadOrCreateGoals(db)
        if (active) {
          setGoals(savedGoals)
          setStatus(`Almacenamiento local activo · ${DATABASE_NAME}`)
        }
      })
      .catch((error: unknown) => {
        if (active) setStatus(error instanceof Error ? error.message : 'No se pudo iniciar el almacenamiento local.')
      })
    return () => {
      active = false
      database?.close()
    }
  }, [])

  return (
    <main className="shell">
      <header className="topbar"><a className="brand" href="#hoy" aria-label="MacroLog, inicio"><span className="brand-mark">M</span>MacroLog</a><span className="local-badge">Solo en este dispositivo</span></header>
      <section className="welcome" id="hoy">
        <p className="eyebrow">TU REGISTRO PERSONAL</p>
        <h1>Un día a la vez.</h1>
        <p className="intro">MacroLog está listo para guardar tu alimentación de forma privada en este dispositivo.</p>
      </section>
      <section className="card" aria-labelledby="goals-title">
        <div className="section-heading"><div><p className="eyebrow">OBJETIVOS DIARIOS</p><h2 id="goals-title">Tu referencia</h2></div><span className="edit-label">Configurables próximamente</span></div>
        <div className="goals-grid">
          <Goal label="Energía" value={goals?.calories} unit="kcal" color="calories" />
          <Goal label="Carbohidratos" value={goals?.carbohydrates} unit="g" color="carbs" />
          <Goal label="Proteínas" value={goals?.protein} unit="g" color="protein" />
          <Goal label="Grasas" value={goals?.fat} unit="g" color="fat" />
        </div>
      </section>
      <section className="empty-state"><span className="plate-icon" aria-hidden="true">＋</span><h2>Tu diario empieza aquí</h2><p>La base privada está preparada. En las siguientes fases podrás añadir registros y gestionar tus alimentos.</p></section>
      <footer className="status" role="status"><span className={goals ? 'status-dot ready' : 'status-dot'} />{status}</footer>
    </main>
  )
}

function Goal({ label, value, unit, color }: { label: string; value?: number; unit: string; color: string }) {
  return <div className="goal"><div className="goal-label"><span className={`dot ${color}`} />{label}</div><div className="goal-value">{value === undefined ? '…' : value.toLocaleString('es-ES')} <small>{unit}</small></div><div className="track"><span className={color} /></div></div>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/MacroLog/sw.js', { scope: '/MacroLog/' }).catch((error) => {
      console.error('No se pudo registrar el Service Worker de MacroLog:', error)
    })
  })
}
