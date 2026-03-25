import { useEffect, useState } from 'react'
import {
  Inbox, Send, CheckCircle2, XCircle,
  MoreHorizontal, ChevronRight, RefreshCw,
  Calendar, Phone, Mail, Loader2
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'

const COLUMNS = [
  {
    key: 'nouvelle_demande',
    label: 'Nouvelle Demande',
    icon: Inbox,
    color: 'text-blue-600',
    headerBg: 'bg-blue-50 border-blue-200',
    badge: 'blue',
    dotColor: 'bg-blue-500',
  },
  {
    key: 'devis_envoye',
    label: 'Devis Envoyé',
    icon: Send,
    color: 'text-amber-600',
    headerBg: 'bg-amber-50 border-amber-200',
    badge: 'yellow',
    dotColor: 'bg-amber-500',
  },
  {
    key: 'accepte',
    label: 'Accepté',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    headerBg: 'bg-emerald-50 border-emerald-200',
    badge: 'green',
    dotColor: 'bg-emerald-500',
  },
  {
    key: 'refuse',
    label: 'Refusé',
    icon: XCircle,
    color: 'text-red-500',
    headerBg: 'bg-red-50 border-red-200',
    badge: 'red',
    dotColor: 'bg-red-400',
  },
]

const PROJECT_LABELS = {
  cuisine: 'Cuisine',
  agencement: 'Agencement',
  mobilier: 'Mobilier',
  dressing: 'Dressing',
  renovation: 'Rénovation',
  autre: 'Autre',
}

function LeadCard({ lead, onMove, moving }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const otherColumns = COLUMNS.filter((c) => c.key !== lead.status)

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow group relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-950 rounded-full flex items-center justify-center text-amber-400 font-semibold text-xs flex-shrink-0">
            {lead.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-stone-900 text-sm leading-tight">{lead.full_name}</p>
            <p className="text-xs text-stone-400">
              {PROJECT_LABELS[lead.project_type] || lead.project_type || 'Projet'}
            </p>
          </div>
        </div>

        {/* Move menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-all"
          >
            {moving ? <Loader2 size={14} className="animate-spin" /> : <MoreHorizontal size={14} />}
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-7 z-20 bg-white border border-stone-200 rounded-xl shadow-lg py-1.5 min-w-[180px]">
                <p className="text-xs text-stone-400 px-3 py-1.5 font-medium uppercase tracking-wide">
                  Déplacer vers
                </p>
                {otherColumns.map((col) => {
                  const Icon = col.icon
                  return (
                    <button
                      key={col.key}
                      onClick={() => {
                        setMenuOpen(false)
                        onMove(lead.id, col.key)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <Icon size={14} className={col.color} />
                      {col.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Message preview */}
      {lead.message && (
        <p className="text-xs text-stone-500 leading-relaxed mb-3 line-clamp-2 bg-stone-50 rounded-lg px-2.5 py-2">
          {lead.message}
        </p>
      )}

      {/* Contact info */}
      <div className="space-y-1.5 mb-3">
        {lead.email && (
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Mail size={11} className="text-stone-400 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Phone size={11} className="text-stone-400 flex-shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
        <div className="flex items-center gap-1 text-[11px] text-stone-400">
          <Calendar size={10} />
          {formatDate(lead.created_at)}
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="flex items-center gap-0.5 text-[11px] text-amber-600 hover:text-amber-700 font-medium"
        >
          Déplacer
          <ChevronRight size={11} />
        </button>
      </div>
    </div>
  )
}

export default function Pipeline() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [movingId, setMovingId] = useState(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setLeads(data)
    setLoading(false)
  }

  const moveLead = async (id, newStatus) => {
    setMovingId(id)
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      )
    }
    setMovingId(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Pipeline Devis</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {leads.length} demande{leads.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.key} className="space-y-3">
              <div className="h-10 bg-stone-200 rounded-xl animate-pulse" />
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-stone-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const Icon = col.icon
            const colLeads = leads.filter((l) => l.status === col.key)

            return (
              <div key={col.key} className="flex flex-col gap-3">
                {/* Column header */}
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <Icon size={15} className={col.color} />
                    <span className="text-xs font-semibold text-stone-700">{col.label}</span>
                  </div>
                  <span className={`w-5 h-5 ${col.dotColor} rounded-full flex items-center justify-center text-[10px] font-bold text-white`}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-[100px]">
                  {colLeads.length === 0 ? (
                    <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center">
                      <p className="text-xs text-stone-400">Aucune demande</p>
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onMove={moveLead}
                        moving={movingId === lead.id}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
