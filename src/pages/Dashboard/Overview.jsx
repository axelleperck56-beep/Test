import { useEffect, useState } from 'react'
import {
  Inbox, Send, CheckCircle, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'

const STATUS_CONFIG = {
  nouvelle_demande: { label: 'Nouvelle Demande', variant: 'blue' },
  devis_envoye: { label: 'Devis Envoyé', variant: 'yellow' },
  accepte: { label: 'Accepté', variant: 'green' },
  refuse: { label: 'Refusé', variant: 'red' },
}

const PROJECT_TYPE_LABELS = {
  cuisine: 'Cuisine',
  agencement: 'Agencement',
  mobilier: 'Mobilier',
  dressing: 'Dressing',
  renovation: 'Rénovation',
  autre: 'Autre',
}

export default function Overview() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

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

  const kpis = [
    {
      title: 'Nouveaux Devis',
      value: leads.filter((l) => l.status === 'nouvelle_demande').length,
      icon: Inbox,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+2 cette semaine',
      up: true,
    },
    {
      title: 'Devis Envoyés',
      value: leads.filter((l) => l.status === 'devis_envoye').length,
      icon: Send,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: 'En attente de réponse',
      up: null,
    },
    {
      title: 'Chantiers Acceptés',
      value: leads.filter((l) => l.status === 'accepte').length,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+1 ce mois',
      up: true,
    },
    {
      title: 'Revenus du Mois',
      value: '24 500 €',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: '+12% vs mois dernier',
      up: true,
    },
  ]

  const recentLeads = leads.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Tableau de Bord</h1>
          <p className="text-sm text-stone-400 mt-0.5">Vue d'ensemble de votre activité</p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={20} className={kpi.color} />
                  </div>
                  {kpi.up !== null && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                      {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    </span>
                  )}
                </div>
                <p className="font-display text-2xl font-bold text-stone-900 mb-1">
                  {loading && typeof kpi.value === 'number' ? '—' : kpi.value}
                </p>
                <p className="text-xs font-medium text-stone-600 mb-1">{kpi.title}</p>
                <p className="text-[11px] text-stone-400">{kpi.trend}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Demandes Récentes</CardTitle>
                <a href="/dashboard/pipeline" className="text-xs text-amber-600 hover:underline">
                  Voir tout →
                </a>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentLeads.length === 0 ? (
                <div className="text-center py-10 text-stone-400">
                  <Inbox size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucune demande pour le moment</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentLeads.map((lead) => {
                    const status = STATUS_CONFIG[lead.status] || STATUS_CONFIG.nouvelle_demande
                    return (
                      <div
                        key={lead.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors"
                      >
                        <div className="w-9 h-9 bg-emerald-950 rounded-full flex items-center justify-center text-amber-400 font-semibold text-sm flex-shrink-0">
                          {lead.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 text-sm truncate">{lead.full_name}</p>
                          <p className="text-xs text-stone-400 truncate">
                            {PROJECT_TYPE_LABELS[lead.project_type] || lead.project_type || 'Projet'} · {formatDate(lead.created_at)}
                          </p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Summary */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>État du Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {[
                  { key: 'nouvelle_demande', label: 'Nouvelles demandes', color: 'bg-blue-500' },
                  { key: 'devis_envoye', label: 'Devis envoyés', color: 'bg-amber-500' },
                  { key: 'accepte', label: 'Acceptés', color: 'bg-emerald-500' },
                  { key: 'refuse', label: 'Refusés', color: 'bg-red-400' },
                ].map(({ key, label, color }) => {
                  const count = leads.filter((l) => l.status === key).length
                  const total = leads.length || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-stone-600">{label}</span>
                        <span className="text-xs font-medium text-stone-900">{count}</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Total des demandes</span>
                  <span className="font-display font-bold text-stone-900">{leads.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {[
                  { label: 'Voir le pipeline', href: '/dashboard/pipeline', icon: Clock },
                  { label: 'Annuaire clients', href: '/dashboard/clients', icon: CheckCircle },
                ].map(({ label, href, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-stone-700 hover:bg-stone-50 border border-stone-100 hover:border-amber-200 transition-all"
                  >
                    <Icon size={15} className="text-amber-600" />
                    {label}
                    <ArrowUpRight size={13} className="ml-auto text-stone-300" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
