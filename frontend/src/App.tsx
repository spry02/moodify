import React from 'react'

const gradient = 'bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(99,102,241,0.35),transparent),radial-gradient(1200px_800px_at_-10%_30%,rgba(34,197,94,0.25),transparent),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]'

function Card({ title, subtitle, children }: { title: string, subtitle?: string, children?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {subtitle && <p className="text-sm opacity-70 -mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function Placeholder({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="podglad h-4 rounded bg-white/5"></div>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <div className={`min-h-screen \${gradient} text-white`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 grid place-items-center">
              <span className="text-sm font-bold">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Moodify</h1>
              <p className="text-sm opacity-80 -mt-1">Twój nastrój → Twoja muzyka</p>
            </div>
          </div>
        </header>

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Dzisiejszy nastrój">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3 podglad h-10 rounded bg-white/5" />
              <div className="col-span-1 podglad h-10 rounded bg-white/5" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['relax','focus','stress','workout','study','sleep'].map(t => (
                <div key={t} className="podglad h-7 w-20 rounded-full bg-white/5" />
              ))}
            </div>
          </Card>

          <Card title="Zdjęcie twarzy">
            <div className="aspect-square w-full rounded-2xl border border-white/20 bg-white/5 podglad" />
            <div className="mt-3"><Placeholder lines={2} /></div>
          </Card>

          <Card title="Parametry muzyczne">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Valence','Energy','Dance','Tempo'].map((l) => (
                <div key={l} className="p-3 rounded-xl border border-white/20 bg-white/5">
                  <div className="text-xs opacity-70">{l}</div>
                  <div className="mt-2 h-4 rounded bg-white/5 podglad" />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Rekomendacje muzyczne">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/20 bg-white/5 p-4">
                  <div className="h-4 w-24 bg-white/5 rounded podglad mb-2" />
                  <div className="h-4 w-40 bg-white/5 rounded podglad" />
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
