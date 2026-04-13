import { createContext, useContext, useState, useEffect } from 'react'
import { isConfigured } from '../lib/supabase.js'
import {
  useEducadoras, useCriancas, useAtividades,
  usePlanejamentos, useRegistros, useDiario, useJornais, useDB
} from '../hooks/useDB.js'
import { ATIVIDADES_EXEMPLO } from '../data/bncc.js'

const AppContext = createContext(null)

export const AVATAR_COLORS = [
  ['#e8f0eb','#2d5240'], ['#f5ece6','#8b3e21'], ['#f5eedc','#6b4a0a'],
  ['#ede5f0','#3d2a42'], ['#e6f1fb','#0c447c'], ['#fce8e8','#a32d2d'],
]

const INITIAL_EDUCADORAS = [
  { id: '1', nome: 'Micheline', tipo: 'Referência', tel: '', nasc: '1985-04-18', obs: 'Educadora de referência — Período Integral', cor: AVATAR_COLORS[0] },
  { id: '2', nome: 'Érica', tipo: 'Referência', tel: '', nasc: '1992-11-05', obs: 'Educadora de referência', cor: AVATAR_COLORS[1] },
  { id: '3', nome: 'Thaís', tipo: 'Referência', tel: '', nasc: '1993-08-20', obs: 'Educadora de referência', cor: AVATAR_COLORS[2] },
  { id: '4', nome: 'Halyssa', tipo: 'Apoio', tel: '', nasc: '1995-03-14', obs: 'Educadora de apoio', cor: AVATAR_COLORS[3] },
  { id: '5', nome: 'Dayane', tipo: 'Apoio', tel: '', nasc: '1997-06-10', obs: 'Educadora de apoio', cor: AVATAR_COLORS[4] },
]

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function lsSet(key, v) { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }

const ROTINA_ITEMS_DEFAULT = [
  { id: 'horta',       icon: '🌱', label: 'Horta',                   dias: [1,2,3,4,5] },
  { id: 'animais',     icon: '🐦', label: 'Animais',                 dias: [1,2,3,4,5] },
  { id: 'higiene',     icon: '🚿', label: 'Higiene',                 dias: [1,2,3,4,5] },
  { id: 'cafe',        icon: '☕', label: 'Café da manhã',           dias: [1,2,3,4,5] },
  { id: 'almoco',      icon: '🍽️', label: 'Almoço',                  dias: [1,2,3,4,5] },
  { id: 'tarefa',      icon: '📚', label: 'Tarefa de casa',          dias: [1,2,3,4,5] },
  { id: 'organizacao', icon: '🧹', label: 'Organização dos materiais', dias: [1,2,3,4,5] },
  { id: 'agendas',     icon: '📋', label: 'Agendas e kits',          dias: [1,2,3,4,5] },
  { id: 'escovacao',   icon: '🦷', label: 'Escovação',               dias: [1,2,3,4,5] },
  { id: 'banho',       icon: '🛁', label: 'Banho',                   dias: [1,2,3,4,5] },
]

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function AppProvider({ children }) {
  const db = useDB()
  const educadorasHook = useEducadoras()
  const criancasHook = useCriancas()
  const atividadesHook = useAtividades()
  const planejamentosHook = usePlanejamentos()
  const registrosHook = useRegistros()
  const diarioHook = useDiario()
  const jornaisHook = useJornais()

  const [rotinaItems, setRotinaItems] = useState(() => lsGet('integral_rotina_items', ROTINA_ITEMS_DEFAULT))
  const [rotinaCheck, setRotinaCheck] = useState(() => lsGet('integral_rotina_check_' + todayKey(), {}))
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!db.loading && !db.connected && educadorasHook.data.length === 0) {
      localStorage.setItem('integral_educadoras', JSON.stringify(INITIAL_EDUCADORAS))
    }
  }, [db.loading, db.connected, educadorasHook.data.length])

  useEffect(() => {
    if (!db.loading && !db.connected && atividadesHook.data.length === 0) {
      localStorage.setItem('integral_atividades', JSON.stringify(ATIVIDADES_EXEMPLO))
    }
  }, [db.loading, db.connected, atividadesHook.data.length])

  useEffect(() => { lsSet('integral_rotina_check_' + todayKey(), rotinaCheck) }, [rotinaCheck])
  useEffect(() => { lsSet('integral_rotina_items', rotinaItems) }, [rotinaItems])

  function showToast(msg, icon = '✅') {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 3500)
  }

  function toggleRotina(itemId) {
    setRotinaCheck(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }
  function updateRotinaItems(items) { setRotinaItems(items) }

  const hoje = new Date().getDay()
  const rotinaItemsHoje = rotinaItems.filter(it => !it.dias || it.dias.length === 0 || it.dias.includes(hoje))
  const rotinaCount = rotinaItemsHoje.filter(it => rotinaCheck[it.id]).length
  const rotinaTotal = rotinaItemsHoje.length
  const educadoras = educadorasHook.data.length > 0 ? educadorasHook.data : INITIAL_EDUCADORAS

  return (
    <AppContext.Provider value={{
      dbConnected: db.connected, dbMode: db.mode, dbLoading: db.loading,
      educadoras,
      children: criancasHook.data,
      atividades: atividadesHook.data.length > 0 ? atividadesHook.data : ATIVIDADES_EXEMPLO,
      planejamentos: planejamentosHook.data,
      registros: registrosHook.data,
      diario: diarioHook.data,
      jornais: jornaisHook.data,
      rotinaItems, rotinaItemsHoje, rotinaCheck, rotinaCount, rotinaTotal, updateRotinaItems, toast,
      addEducadora: educadorasHook.add,
      updateEducadora: educadorasHook.update,
      removeEducadora: educadorasHook.remove,
      addChild: criancasHook.add,
      updateChild: criancasHook.update,
      addChildObs: criancasHook.addObs,
      saveAtividade: atividadesHook.save,
      removeAtividade: atividadesHook.remove,
      savePlanejamento: planejamentosHook.save,
      addRegistro: registrosHook.add,
      saveDiarioEntry: diarioHook.saveEntry,
      saveJornal: jornaisHook.save,
      toggleRotina, showToast,
      AVATAR_COLORS,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
