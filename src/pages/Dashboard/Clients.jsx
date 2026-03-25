import { useEffect, useState } from 'react'
import {
  Search, Users, Mail, Phone, MapPin,
  Eye, RefreshCw, ChevronUp, ChevronDown, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'

function ClientDetailModal({ client, onClose }) {
  if (!client) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-emerald-950 rounded-2xl flex items-center justify-center text-amber-400 font-display font-bold text-xl">
            {client.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-stone-900">{client.full_name}</h3>
            <p className="text-sm text-stone-400">Client depuis {formatDate(client.created_at)}</p>
          </div>
        </div>

        <div className="space-y-3 bg-stone-50 rounded-xl p-4">
          {[
            { icon: Mail, label: 'Email', value: client.email },
            { icon: Phone, label: 'Téléphone', value: client.phone || '—' },
            { icon: MapPin, label: 'Ville', value: client.city || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white rounded-lg border border-stone-200 flex items-center justify-center flex-shrink-0">
                <Icon size={13} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium">{label}</p>
                <p className="text-sm text-stone-700 font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {client.notes && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs font-medium text-amber-700 mb-1">Notes</p>
            <p className="text-sm text-stone-600">{client.notes}</p>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <a
            href={`mailto:${client.email}`}
            className="flex-1 inline-flex items-center justify-center gap-2 h-9 bg-emerald-950 text-white text-sm font-medium rounded-lg hover:bg-emerald-900 transition-colors"
          >
            <Mail size={14} />
            Contacter
          </a>
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex-1 inline-flex items-center justify-center gap-2 h-9 border border-stone-300 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors"
            >
              <Phone size={14} />
              Appeler
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setClients(data)
    setLoading(false)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filtered = clients
    .filter((c) => {
      const q = search.toLowerCase()
      return (
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.city?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const av = a[sortField] || ''
      const bv = b[sortField] || ''
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={13} className="text-stone-300" />
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="text-amber-600" />
      : <ChevronDown size={13} className="text-amber-600" />
  }

  const COLUMNS = [
    { key: 'full_name', label: 'Client', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Téléphone', sortable: false },
    { key: 'city', label: 'Ville', sortable: true },
    { key: 'created_at', label: 'Client depuis', sortable: true },
    { key: 'actions', label: '', sortable: false },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Annuaire Clients</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {clients.length} client{clients.length !== 1 ? 's' : ''} enregistré{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchClients}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      <Card>
        {/* Search bar */}
        <CardHeader className="pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <Input
                type="search"
                placeholder="Rechercher un client…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
              >
                <X size={13} />
                Effacer
              </button>
            )}
            <span className="ml-auto text-xs text-stone-400">
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-0">
          {loading ? (
            <div className="space-y-0 divide-y divide-stone-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 bg-stone-100 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-100 rounded w-40 animate-pulse" />
                    <div className="h-3 bg-stone-100 rounded w-56 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Users size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Aucun client trouvé</p>
              {search && (
                <p className="text-xs mt-1">
                  Aucun résultat pour "{search}"
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100">
                      {COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className={`px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wide ${col.sortable ? 'cursor-pointer hover:text-stone-600 select-none' : ''}`}
                          onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        >
                          <span className="inline-flex items-center gap-1">
                            {col.label}
                            {col.sortable && <SortIcon field={col.key} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filtered.map((client) => (
                      <tr
                        key={client.id}
                        className="hover:bg-stone-50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-950 rounded-full flex items-center justify-center text-amber-400 font-semibold text-sm flex-shrink-0">
                              {client.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <p className="font-medium text-stone-900 text-sm">{client.full_name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`mailto:${client.email}`}
                            className="text-sm text-stone-600 hover:text-amber-600 transition-colors"
                          >
                            {client.email}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-stone-500">{client.phone || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          {client.city ? (
                            <div className="flex items-center gap-1 text-sm text-stone-500">
                              <MapPin size={12} className="text-stone-300" />
                              {client.city}
                            </div>
                          ) : (
                            <span className="text-stone-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-stone-400">{formatDate(client.created_at)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedClient(client)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye size={13} />
                            Détails
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-stone-100">
                {filtered.map((client) => (
                  <div key={client.id} className="px-4 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-950 rounded-full flex items-center justify-center text-amber-400 font-semibold flex-shrink-0">
                      {client.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 text-sm">{client.full_name}</p>
                      <p className="text-xs text-stone-400 truncate">{client.email}</p>
                      {client.city && (
                        <p className="text-xs text-stone-400">{client.city}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="p-2 rounded-lg bg-stone-100 hover:bg-amber-50 hover:text-amber-600 text-stone-500 transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  )
}
