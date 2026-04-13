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

export function AppProvider({ children }) {
  const db = useDB()
  const educadorasHook = useEducadoras()
  const criancasHook = useCriancas()
  const atividadesHook = useAtividades()
  const planejamentosHook = usePlanejamentos()
  const registrosHook = useRegistros()
  const diarioHook = useDiario()
  const jornaisHook = useJornais()

  const [rotinaState, setRotinaState] = useState(
    () => lsGet('integral_rotina_' + new Date().toDateString(), new Array(10).fill(false))
  )
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

  useEffect(() => {
    localStorage.setItem('integral_rotina_' + new Date().toDateString(), JSON.stringify(rotinaState))
  }, [rotinaState])

  function showToast(msg, icon = '✅') {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 3500)
  }

  function toggleRotina(idx) {
    setRotinaState(prev => { const n = [...prev]; n[idx] = !n[idx]; return n })
  }

  const rotinaCount = rotinaState.filter(Boolean).length
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
      rotinaState, rotinaCount, toast,
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
