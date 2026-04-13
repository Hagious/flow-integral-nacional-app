# 🌿 Integral Nacional App
## Colégio Nacional · Educação para Sempre

Aplicativo web para gestão pedagógica do Colégio Nacional, com dados de crianças, educadoras, planejamento, rotina, ocorrências, diário fotográfico e geração de jornal literário.

---

## 📌 Visão Geral
Este projeto é uma aplicação React + Vite que usa:
- **Supabase** como backend principal para dados em nuvem
- **localStorage** como fallback quando o Supabase não estiver configurado
- **IA (Claude Sonnet 4)** para ajudar no planejamento pedagógico e na geração de conteúdos
- **Vite** para desenvolvimento rápido e build de produção

O app oferece funcionalidades para a rotina pedagógica diária, com foco em Educação Infantil e BNCC.

---

## ✨ Funcionalidades Principais
- Dashboard com alertas do dia e estatísticas rápidas
- Cadastro e listagem de crianças, educadoras e registros
- Planejamento semanal com suporte a IA e validação de conteúdo
- Banco de atividades pedagógicas com histórico e edição
- Diário fotográfico e jornal literário com template de impressão
- Ocorrências e acompanhamento pedagógico
- Modo local quando não há conexão com Supabase
- Indicador de conexão ao Supabase na sidebar

---

## 🚀 Como executar localmente
1. Instale dependências:
```bash
npm install
```
2. Crie o arquivo de ambiente:
```bash
copy .env.example .env
```
3. Edite `.env` com as variáveis do Supabase:
```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_KEY=<sua-anon-key>
```
4. Inicie o servidor local:
```bash
npm run dev -- --host 127.0.0.1 --port 4173
```
5. Acesse:
```text
http://127.0.0.1:4173/
```

> Se o Supabase não estiver configurado, o app seguirá usando o modo local com `localStorage`.

---

## 🛠️ Build de produção
```bash
npm run build
```

Os arquivos gerados ficam em `dist/`.

---

## ☁️ Configuração do Supabase
### 1. Criar projeto Supabase
- Acesse [supabase.com](https://supabase.com) e crie um projeto
- Copie a **Project URL** e a **anon key**

### 2. Criar tabelas e schema
- Use o arquivo `SQL_SCHEMA.sql` para criar as tabelas necessárias
- O arquivo também contém o modelo de dados usado pelo app

### 3. Criar bucket de storage para fotos
Execute no SQL editor do Supabase:
```sql
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict do nothing;
```

### 4. Configurar `.env`
- Copie `.env.example` para `.env`
- Preencha com URL e chave do Supabase

### 5. Verificar conexão
- Inicie o app com `npm run dev`
- Observe o indicador na sidebar:
  - 🟢 Supabase conectado
  - ⚫ Modo local

---

## 🔄 Dois casos de operação
O app funciona em dois modos claros:

1. **Supabase configurado**
   - Salva dados na nuvem e permite sincronização entre dispositivos.
   - Utiliza Supabase para todas as operações de CRUD e upload de fotos.
   - Se houver perda de conexão, o modo local pode continuar armazenando dados temporariamente.

2. **Sem Supabase configurado**
   - Entra em modo local usando `localStorage`.
   - Os dados ficam apenas no navegador atual.
   - Esse modo permite testar o app sem backend ou em ambientes off-line.

---

## 🧩 Estrutura do projeto
```text
src/
├── components/
│   ├── AlertasDiarios.jsx    ← Alertas e notificações diárias no dashboard
│   ├── PrintTemplate.jsx     ← Template de impressão para jornal e planejamento
│   └── Sidebar.jsx           ← Navegação + status Supabase
├── context/
│   ├── AppContext.jsx        ← Estado global e integrações com hooks
│   └── AuthContext.jsx       ← Permissões e fallback de autorização
├── data/
│   └── bncc.js               ← Objetivos e campos BNCC para a Educação Infantil
├── hooks/
│   └── useDB.js              ← Abstração de dados: Supabase + localStorage
├── lib/
│   └── supabase.js           ← Cliente Supabase, helpers de CRUD e upload de fotos
├── pages/
│   ├── AdminPages.jsx
│   ├── BancoAtividades.jsx
│   ├── Criancas.jsx
│   ├── Dashboard.jsx
│   ├── JornalLiterario.jsx
│   ├── Login.jsx
│   ├── Ocorrencias.jsx
│   ├── OtherPages.jsx
│   ├── Planejamento.jsx
│   ├── PlanejamentoInteligente.jsx
│   ├── Registros.jsx
│   ├── Rotina.jsx
│   └── Usuarios.jsx
├── utils/
│   ├── validacao.jsx        ← Validação de conteúdo e componentes de status
│   └── validacao.js         ← Validação de planejamento e IA
├── App.jsx
├── index.css
└── main.jsx
```

---

## 📁 Arquivos importantes
- `.env.example` — modelo de variáveis de ambiente
- `SQL_SCHEMA.sql` — schema SQL do banco de dados
- `package.json` — dependências e scripts
- `.gitignore` — arquivos não versionados

---

## 💡 Observações importantes
- **Sempre atualize este README** se houver mudanças em:
  - instalação
  - variáveis de ambiente
  - configuração do Supabase
  - scripts do npm
  - arquitetura de pastas
- O README deve ser a primeira referência para qualquer pessoa entender o projeto.

---

## 📌 Recomendações de manutenção
- Commit `README.md` sempre que adicionar uma nova feature ou mudar o fluxo de execução
- Inclua no README novos endpoints, novas páginas e novos requisitos de ambiente
- Mantenha o `SQL_SCHEMA.sql` sincronizado com o banco do Supabase

---

## 🔧 Tecnologias usadas
- React 18
- Vite
- Supabase (PostgreSQL + Storage)
- localStorage fallback
- Claude AI (IA) para suporte pedagógico
- CSS customizado

---

## 🚩 GitHub
Repositório remoto atual:
`https://github.com/Hagious/flow-integral-nacional-app`

Sempre verifique a branch antes de subir alterações.
