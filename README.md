# 🌿 Integral v3 — Organização Pedagógica
## Colégio Nacional · Educação para Sempre

---

## ✨ Novidades da v3

### 🗄️ Supabase integrado
- Dados salvos na nuvem — múltiplos dispositivos, múltiplas educadoras
- Fallback automático para localStorage quando offline ou sem configuração
- Indicador visual de conexão na sidebar (ponto verde = nuvem, cinza = local)

### 📰 Jornal Literário completo (substitui o Canva)
- Capa com gradiente verde + logo do Colégio Nacional
- Frase de abertura de Loris Malaguzzi
- Editor de atividades com emoji, título e texto narrativo
- Suporte a fotos por atividade
- **IA sugere os momentos do mês** com base no Diário Fotográfico
- Template de impressão fiel em A4 — `window.print()` → PDF/papel
- Histórico de jornais anteriores com um clique

---

## 🚀 Publicar (3 minutos)

```bash
npm install
npm run build
# Arraste dist/ para netlify.com
```

---

## 🗄️ Configurar Supabase (dados na nuvem)

### Passo 1 — Criar projeto
1. Acesse [supabase.com](https://supabase.com) → New Project
2. Guarde a **Project URL** e a **anon key** (aba API)

### Passo 2 — Criar as tabelas
Abra o **SQL Editor** do seu projeto e cole o conteúdo de `src/lib/supabase.js`
(a partir da linha `-- 1. EDUCADORAS` até o final do arquivo)

### Passo 3 — Criar Storage Bucket para fotos
No SQL Editor, execute:
```sql
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict do nothing;
```

### Passo 4 — Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

### Passo 5 — Verificar conexão
Rode `npm run dev` e observe o indicador na sidebar:
- 🟢 Ponto verde = Supabase conectado
- ⚫ Ponto cinza = Modo local (sem configuração)

---

## 👩‍🏫 Equipe atual

| Nome | Tipo |
|---|---|
| Micheline | Referência |
| Érica | Referência |
| Thaís | Referência |
| Halyssa | Apoio |
| Dayane | Apoio |

---

## 🏗️ Arquitetura

```
src/
├── lib/
│   └── supabase.js       ← Cliente Supabase + SQL completo
├── hooks/
│   └── useDB.js          ← Hooks de dados (Supabase + localStorage fallback)
├── context/
│   └── AppContext.jsx    ← Estado global via hooks
├── data/
│   └── bncc.js           ← Todos os objetivos BNCC Educação Infantil
├── utils/
│   └── validacao.js      ← Validação de campos obrigatórios
├── components/
│   ├── Sidebar.jsx       ← Navegação + status DB
│   └── PrintTemplate.jsx ← Template impressão planejamento (padrão Micheline)
└── pages/
    ├── Dashboard.jsx
    ├── BancoAtividades.jsx
    ├── PlanejamentoInteligente.jsx
    ├── Criancas.jsx
    ├── Registros.jsx
    ├── Rotina.jsx
    ├── JornalLiterario.jsx  ← NOVO — substitui o Canva
    └── OtherPages.jsx
```

---

## 📱 Mobile (Fase 2)
Previsto após validação do sistema web com a equipe.
Tecnologia planejada: PWA progressivo (funciona como app no celular sem loja).

---

## 🤖 IA integrada (Claude Sonnet 4)
- **Banco de Atividades**: sugere objetivos BNCC e gera descrição pedagógica
- **Planejamento**: completa célula no padrão Micheline com um clique
- **Planejamento**: gera semana completa com equilíbrio de campos BNCC
- **Diário Fotográfico**: gera resumos pedagógicos
- **Jornal Literário**: sugere momentos do mês baseado no Diário
