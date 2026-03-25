import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Layers, ChefHat, Sofa, Phone, Mail, MapPin,
  CheckCircle2, Star, ArrowRight, Menu, X, Loader2
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select } from '../components/ui/select'
import { supabase } from '../lib/supabase'

const SERVICES = [
  {
    icon: Layers,
    title: 'Agencement sur Mesure',
    description:
      "Bibliothèques intégrées, dressings, espaces de rangement : nous concevons chaque agencement pour s'adapter parfaitement à votre espace de vie.",
    features: ['Bibliothèques & étagères', 'Dressings', 'Rangements intégrés'],
  },
  {
    icon: ChefHat,
    title: 'Cuisines Artisanales',
    description:
      "Du plan de travail aux façades, chaque cuisine Conan est une création unique alliant esthétique raffinée et fonctionnalité optimale.",
    features: ['Façades sur mesure', "Îlots centraux", 'Plans de travail bois'],
  },
  {
    icon: Sofa,
    title: 'Mobilier Exclusif',
    description:
      "Tables, commodes, bureaux, têtes de lit — nous créons des pièces de mobilier intemporelles qui traversent les générations.",
    features: ['Tables & chaises', 'Bureaux & commodes', 'Mobilier de chambre'],
  },
]

const PROJECT_TYPES = [
  { value: '', label: 'Sélectionnez un type de projet' },
  { value: 'cuisine', label: 'Cuisine sur mesure' },
  { value: 'agencement', label: 'Agencement & Bibliothèque' },
  { value: 'mobilier', label: 'Mobilier sur mesure' },
  { value: 'dressing', label: 'Dressing / Placard' },
  { value: 'renovation', label: 'Rénovation complète' },
  { value: 'autre', label: 'Autre projet' },
]

const TESTIMONIALS = [
  {
    name: 'Sophie M.',
    location: 'Paris 7e',
    text: "Une cuisine absolument magnifique. Le travail de Menuiserie Conan est d'une précision remarquable. Je recommande les yeux fermés.",
    stars: 5,
  },
  {
    name: 'Laurent B.',
    location: 'Versailles',
    text: "Notre bibliothèque sur mesure est la pièce maîtresse de notre salon. Qualité irréprochable, délais respectés, équipe à l'écoute.",
    stars: 5,
  },
  {
    name: 'Isabelle T.',
    location: 'Lyon 6e',
    text: "Du premier rendez-vous à la livraison, une expérience client impeccable. Le résultat dépasse toutes nos attentes.",
    stars: 5,
  },
]

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formState, setFormState] = useState({
    full_name: '',
    email: '',
    phone: '',
    project_type: '',
    message: '',
  })
  const [formStatus, setFormStatus] = useState('idle') // idle | loading | success | error

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formState.full_name || !formState.email || !formState.project_type) return
    setFormStatus('loading')

    const { error } = await supabase.from('leads').insert([
      {
        full_name: formState.full_name,
        email: formState.email,
        phone: formState.phone || null,
        project_type: formState.project_type,
        message: formState.message || null,
        status: 'nouvelle_demande',
      },
    ])

    if (error) {
      console.error('Lead insert error:', error)
      setFormStatus('error')
    } else {
      setFormStatus('success')
      setFormState({ full_name: '', email: '', phone: '', project_type: '', message: '' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-emerald-950/95 backdrop-blur-sm border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center text-emerald-950 font-bold text-xs">
              MC
            </span>
            <span className="font-display text-lg font-semibold text-white">
              Menuiserie <span className="text-amber-400">Conan</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-stone-300 hover:text-amber-400 transition-colors">
              Services
            </a>
            <a href="#realisations" className="text-sm text-stone-300 hover:text-amber-400 transition-colors">
              Réalisations
            </a>
            <a href="#contact" className="text-sm text-stone-300 hover:text-amber-400 transition-colors">
              Contact
            </a>
            <a href="#contact">
              <Button size="sm" variant="default">
                Demander un Devis
              </Button>
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-emerald-950 border-t border-white/10 px-4 py-4 flex flex-col gap-4">
            <a href="#services" className="text-stone-300 text-sm" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#realisations" className="text-stone-300 text-sm" onClick={() => setMobileMenuOpen(false)}>Réalisations</a>
            <a href="#contact" className="text-stone-300 text-sm" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full">Demander un Devis</Button>
            </a>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/92 via-emerald-950/80 to-emerald-900/70" />

        {/* Decorative gold line */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent" />

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            <span className="text-amber-300 text-xs font-medium tracking-widest uppercase">
              Artisan Menuisier depuis 1987
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            L'Excellence du{' '}
            <span className="text-amber-400 italic">Bois</span>
            <br />sur Mesure
          </h1>

          <p className="text-lg sm:text-xl text-stone-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Cuisine, agencement, mobilier — chaque création est pensée pour sublimer
            votre intérieur avec l'exigence de l'artisanat d'exception.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact">
              <Button size="xl" className="w-full sm:w-auto group">
                Demander un Devis Gratuit
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="#services">
              <Button size="xl" variant="outline-white" className="w-full sm:w-auto">
                Découvrir nos Services
              </Button>
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: '35+', label: "Ans d'expertise" },
              { value: '500+', label: 'Projets réalisés' },
              { value: '100%', label: 'Satisfaction client' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-amber-400">{stat.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-stone-400">
          <span className="text-xs">Défiler</span>
          <div className="w-px h-8 bg-gradient-to-b from-stone-400 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-600 text-sm font-medium tracking-widest uppercase mb-3">
              Notre Savoir-Faire
            </p>
            <h2 className="font-display text-4xl font-bold text-stone-900 mb-4">
              Des Créations à Votre Image
            </h2>
            <p className="text-stone-500 max-w-xl mx-auto">
              Chaque projet est unique. Nous mettons notre expertise au service de vos envies
              pour créer des espaces qui vous ressemblent.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((service) => {
              const Icon = service.icon
              return (
                <article
                  key={service.title}
                  className="group bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-lg hover:border-amber-200 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-emerald-950 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-600 transition-colors duration-300">
                    <Icon size={26} className="text-amber-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-stone-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed mb-5">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                        <CheckCircle2 size={15} className="text-amber-600 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Réalisations banner ── */}
      <section id="realisations" className="py-24 bg-emerald-950 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-400 text-sm font-medium tracking-widest uppercase mb-4">
            Pourquoi nous choisir
          </p>
          <h2 className="font-display text-4xl font-bold text-white mb-12">
            L'Artisanat Conan, c'est…
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🌲', title: 'Bois nobles sélectionnés', desc: 'Chêne, noyer, frêne — uniquement des essences de qualité supérieure.' },
              { icon: '📐', title: 'Précision millimétrique', desc: "Chaque pièce est fabriquée sur mesure avec une précision d'ébéniste." },
              { icon: '🤝', title: 'Accompagnement total', desc: "Du premier croquis jusqu'à l'installation, nous sommes à vos côtés." },
              { icon: '✅', title: 'Garantie 10 ans', desc: "Nos créations sont conçues pour durer et bénéficient d'une garantie décennale." },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition-colors">
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h4 className="font-display text-white font-semibold mb-2">{item.title}</h4>
                <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-sm font-medium tracking-widest uppercase mb-3">
              Témoignages
            </p>
            <h2 className="font-display text-4xl font-bold text-stone-900">
              Ce que disent nos clients
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="bg-stone-50 rounded-2xl p-8 border border-stone-100">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <footer className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-950 rounded-full flex items-center justify-center text-amber-400 font-semibold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 text-sm">{t.name}</p>
                    <p className="text-xs text-stone-400">{t.location}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Lead Form ── */}
      <section id="contact" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Info */}
            <div>
              <p className="text-amber-600 text-sm font-medium tracking-widest uppercase mb-3">
                Devis Gratuit
              </p>
              <h2 className="font-display text-4xl font-bold text-stone-900 mb-6 leading-tight">
                Parlons de votre projet
              </h2>
              <p className="text-stone-500 leading-relaxed mb-10">
                Décrivez-nous votre vision. Nous vous recontactons sous 24h pour un
                premier échange sans engagement, et vous proposons une visite conseil gratuite.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Phone, label: 'Téléphone', value: '+33 (0)3 20 XX XX XX' },
                  { icon: Mail, label: 'Email', value: 'contact@menuiserie-conan.fr' },
                  { icon: MapPin, label: 'Adresse', value: '12 Rue de l\'Artisan, 59133 Phalempin' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-950 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</p>
                      <p className="text-stone-700 font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
              {formStatus === 'success' ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-stone-900 mb-2">
                    Demande reçue !
                  </h3>
                  <p className="text-stone-500 text-sm max-w-xs mx-auto">
                    Merci pour votre confiance. Nous vous recontacterons dans les 24 heures.
                  </p>
                  <button
                    className="mt-6 text-amber-600 text-sm font-medium hover:underline"
                    onClick={() => setFormStatus('idle')}
                  >
                    Soumettre une nouvelle demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h3 className="font-display text-xl font-semibold text-stone-900 mb-6">
                    Demande de Devis
                  </h3>

                  {formStatus === 'error' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      Une erreur est survenue. Veuillez réessayer ou nous contacter par téléphone.
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="full_name">Nom complet *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formState.full_name}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Adresse email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="jean@email.fr"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formState.phone}
                        onChange={handleChange}
                        placeholder="06 XX XX XX XX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="project_type">Type de projet *</Label>
                      <Select
                        id="project_type"
                        name="project_type"
                        value={formState.project_type}
                        onChange={handleChange}
                        required
                      >
                        {PROJECT_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value} disabled={!opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="message">Décrivez votre projet</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Dites-nous en plus sur vos besoins, vos dimensions, votre budget indicatif…"
                      className="h-28"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={formStatus === 'loading'}
                  >
                    {formStatus === 'loading' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        Envoyer ma demande de devis
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-stone-400 mt-3">
                    Réponse garantie sous 24h · Devis 100% gratuit
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-emerald-950 text-stone-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-emerald-950 font-bold text-sm">
                  MC
                </span>
                <span className="font-display text-xl font-semibold text-white">
                  Menuiserie <span className="text-amber-400">Conan</span>
                </span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
                Artisan menuisier d'exception depuis 1987. Nous créons des espaces uniques
                qui allient tradition et modernité.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
                Services
              </h4>
              <ul className="space-y-2 text-sm">
                {['Agencement sur mesure', 'Cuisines artisanales', 'Mobilier exclusif', 'Dressings & Placards'].map((s) => (
                  <li key={s}>
                    <a href="#services" className="text-stone-400 hover:text-amber-400 transition-colors">
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
                Contact
              </h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li>+33 (0)3 20 XX XX XX</li>
                <li>contact@menuiserie-conan.fr</li>
                <li>Phalempin, Nord (59)</li>
                <li>Lun–Ven 8h–18h</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-500">
              © {new Date().getFullYear()} Menuiserie Conan. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
                Mentions légales
              </a>
              <a href="#" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
                Confidentialité
              </a>
              {/* Hidden admin link */}
              <Link
                to="/login"
                className="text-xs text-stone-700 hover:text-stone-500 transition-colors"
                title="Espace administration"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
