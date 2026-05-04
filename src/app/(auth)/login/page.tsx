import { LoginForm } from './_components/LoginForm'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
          <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-dm-serif)' }}>C</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-dm-serif)' }}>
          CONPAT
        </h1>
        <p className="text-sm text-slate-500 mt-1">CRM Patrimonial</p>
      </div>
      <LoginForm />
    </div>
  )
}
