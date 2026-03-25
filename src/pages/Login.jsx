import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setLoading(false)
      if (signInError.message.includes('Invalid login')) {
        setError('Email ou mot de passe incorrect.')
      } else {
        setError('Une erreur est survenue. Vérifiez votre connexion.')
      }
    }
    // If success, the useEffect above will redirect
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-950 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-950/90 to-emerald-900/80" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-emerald-950 font-bold">
            MC
          </span>
          <span className="font-display text-xl font-semibold text-white">
            Menuiserie <span className="text-amber-400">Conan</span>
          </span>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <blockquote>
            <p className="font-display text-3xl text-white italic leading-relaxed mb-6">
              "Le bois est une matière vivante qui mérite toute notre attention."
            </p>
            <footer className="text-amber-400 font-medium">— Jean-Luc Conan, Fondateur</footer>
          </blockquote>
          <div className="mt-10 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1 rounded-full ${i === 1 ? 'w-8 bg-amber-400' : 'w-4 bg-white/20'}`} />
            ))}
          </div>
        </div>

        {/* Decorative bottom */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { v: '35+', l: "Ans d'expérience" },
            { v: '500+', l: 'Projets livrés' },
            { v: '4.9★', l: 'Note moyenne' },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-display text-2xl font-bold text-amber-400">{s.v}</p>
              <p className="text-xs text-stone-400">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-700 text-sm mb-10 transition-colors"
          >
            <ArrowLeft size={14} />
            Retour au site
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-emerald-950 rounded-xl flex items-center justify-center mb-5">
              <Lock size={22} className="text-amber-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">
              Espace Administration
            </h1>
            <p className="text-stone-400 text-sm">
              Connectez-vous pour accéder au tableau de bord Menuiserie Conan.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] flex-shrink-0 font-bold">!</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@menuiserie-conan.fr"
                  className="pl-9"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Connexion…
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-8">
            Accès réservé au personnel autorisé de Menuiserie Conan.
          </p>
        </div>
      </div>
    </div>
  )
}
