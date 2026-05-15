export default function AdminPage() {
  return (
    <>
      {/* Liquid Mesh background */}
      <div
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        style={{ opacity: 0.42 }}
      >
        <div className="blob-1 absolute rounded-full" style={{ width: 520, height: 520, top: -80, left: '10%', background: '#bfdbfe', filter: 'blur(110px)' }} />
        <div className="blob-2 absolute rounded-full" style={{ width: 440, height: 440, top: '30%', right: '8%', background: '#c7d2fe', filter: 'blur(100px)' }} />
        <div className="blob-3 absolute rounded-full" style={{ width: 380, height: 380, bottom: '10%', left: '35%', background: '#fef9c3', filter: 'blur(100px)' }} />
      </div>

      <main className="mx-auto max-w-4xl px-6 pt-24 pb-44">
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: '#3b5ae0', letterSpacing: '.18em' }}>
            Administration
          </p>
          <h1 className="font-black tracking-tighter mb-4 leading-none" style={{ fontSize: 'clamp(3rem,7vw,5rem)', color: '#111827' }}>
            Back Office
          </h1>
          <p className="text-base" style={{ color: '#4b5563' }}>
            Page d'administration — à venir
          </p>
        </div>
      </main>
    </>
  )
}
