-- ═══════════════════════════════════════════════════════════════
-- INTEGRAL v4 — SQL SCHEMA COMPLETO
-- Cole no SQL Editor do Supabase e execute por blocos
-- supabase.com → seu projeto → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BLOCO 1: ESTRUTURA PEDAGÓGICA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

create table if not exists educadoras (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  tipo text check (tipo in ('Referência','Apoio')) default 'Referência',
  tel text, nasc date, obs text, cor jsonb,
  ativo boolean default true,
  created_at timestamptz default now()
);

create table if not exists criancas (
  id uuid default gen_random_uuid() primary key,
  nome text not null, nasc date, cor jsonb,
  ativo boolean default true,
  created_at timestamptz default now()
);

create table if not exists observacoes_criancas (
  id uuid default gen_random_uuid() primary key,
  crianca_id uuid references criancas(id) on delete cascade,
  educadora_id uuid references educadoras(id),
  data date not null default current_date,
  eixos jsonb,
  aprovado boolean default false,
  aprovado_por uuid references educadoras(id),
  created_at timestamptz default now()
);

create table if not exists atividades (
  id uuid default gen_random_uuid() primary key,
  titulo text not null, tipo text, descricao text, espaco text, materiais text,
  faixa_etaria jsonb default '["Infantil","Fundamental"]',
  campos_experiencia jsonb default '[]', objetivos jsonb default '[]',
  duracao int default 50, tags jsonb default '[]',
  projeto text, mes int, ativa boolean default true,
  created_at timestamptz default now()
);

create table if not exists planejamentos (
  id uuid default gen_random_uuid() primary key,
  semana date not null unique,
  educadoras_ref jsonb default '[]',
  educadoras_apoio jsonb default '[]',
  slots jsonb default '[]',
  propostas text, observacao text, revisao text, ajustes text, reflexao text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists registro_diario (
  id uuid default gen_random_uuid() primary key,
  data date not null,
  educadora_id uuid references educadoras(id),
  rotina_concluida jsonb default '[]',
  atividade_realizada text, como_foi text, o_que_surgiu text,
  falas text, hipoteses text, situacao_significativa text, reflexao text,
  observacoes_criancas jsonb default '[]',
  status text check (status in ('rascunho','enviado','aprovado')) default 'rascunho',
  aprovado_por uuid references educadoras(id),
  aprovado_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists registros (
  id uuid default gen_random_uuid() primary key,
  data date not null default current_date,
  falas text, hipoteses text, situacoes text, continuidade text,
  educadora_id uuid references educadoras(id),
  created_at timestamptz default now()
);

create table if not exists diario (
  id uuid default gen_random_uuid() primary key,
  data date not null unique default current_date,
  resumo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fotos_diario (
  id uuid default gen_random_uuid() primary key,
  diario_id uuid references diario(id) on delete cascade,
  url text not null, legenda text, destacada boolean default false,
  created_at timestamptz default now()
);

create table if not exists jornais (
  id uuid default gen_random_uuid() primary key,
  titulo text default 'Jornal Literário',
  mes int not null, ano int not null,
  turma text default 'Período Integral', num_criancas int,
  atividades jsonb default '[]', publicado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(mes, ano)
);

create table if not exists inclusao (
  id uuid default gen_random_uuid() primary key,
  crianca_nome text not null, data date not null default current_date,
  estrategias text, adaptacoes text, respostas text, proximas text,
  created_at timestamptz default now()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BLOCO 2: USUÁRIOS E PERMISSÕES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

create table if not exists grupos_acesso (
  id uuid default gen_random_uuid() primary key,
  nome text not null unique,
  descricao text, cor text default '#4a7c59', ordem int default 0,
  created_at timestamptz default now()
);

create table if not exists modulos (
  id text primary key, nome text not null, icone text, categoria text, ordem int default 0
);

create table if not exists permissoes_grupo (
  id uuid default gen_random_uuid() primary key,
  grupo_id uuid references grupos_acesso(id) on delete cascade,
  modulo_id text references modulos(id),
  pode_ver boolean default false,
  pode_criar boolean default false,
  pode_editar boolean default false,
  pode_excluir boolean default false,
  unique(grupo_id, modulo_id)
);

create table if not exists usuarios (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text unique not null,
  senha_hash text,
  grupo_id uuid references grupos_acesso(id),
  educadora_id uuid references educadoras(id),
  is_admin boolean default false,
  ativo boolean default true,
  ultimo_acesso timestamptz,
  created_at timestamptz default now()
);

create table if not exists permissoes_usuario (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references usuarios(id) on delete cascade,
  modulo_id text references modulos(id),
  pode_ver boolean, pode_criar boolean, pode_editar boolean, pode_excluir boolean,
  valido_ate date, motivo text,
  created_at timestamptz default now(),
  unique(usuario_id, modulo_id)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BLOCO 3: AUDITORIA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

create table if not exists auditoria (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references usuarios(id),
  usuario_nome text,
  acao text not null check (acao in ('criar','editar','excluir','visualizar','login','logout','aprovar','rejeitar')),
  modulo text not null,
  registro_id text,
  dados_antes jsonb,
  dados_depois jsonb,
  ip text,
  device_info text,
  created_at timestamptz default now()
);
create index if not exists idx_auditoria_usuario on auditoria(usuario_id);
create index if not exists idx_auditoria_modulo on auditoria(modulo);
create index if not exists idx_auditoria_created on auditoria(created_at desc);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BLOCO 4: CONTROLE DE PONTO REP-P
-- Portaria 671/2021 — Ministério do Trabalho
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

create table if not exists contratos (
  id uuid default gen_random_uuid() primary key,
  educadora_id uuid references educadoras(id) on delete cascade,
  cargo text not null,
  carga_horaria_semanal int default 40,
  horario_entrada time, horario_saida time,
  horario_almoco_inicio time, horario_almoco_fim time,
  dias_trabalho jsonb default '[1,2,3,4,5]',
  data_admissao date not null, data_demissao date,
  salario numeric(10,2), ativo boolean default true,
  created_at timestamptz default now()
);

create table if not exists ponto (
  id uuid default gen_random_uuid() primary key,
  educadora_id uuid references educadoras(id) on delete cascade,
  data date not null,
  tipo text not null check (tipo in ('entrada','saida_almoco','retorno_almoco','saida')),
  hora_registrada timestamptz not null default now(),
  hora_servidor timestamptz not null default now(),
  latitude numeric(10,7), longitude numeric(10,7),
  device_info text, ip text, hash_verificacao text,
  editado boolean default false,
  editado_por uuid references usuarios(id),
  editado_em timestamptz, motivo_edicao text,
  created_at timestamptz default now(),
  unique(educadora_id, data, tipo)
);
create index if not exists idx_ponto_educadora_data on ponto(educadora_id, data);

create table if not exists ponto_ocorrencias (
  id uuid default gen_random_uuid() primary key,
  educadora_id uuid references educadoras(id) on delete cascade,
  data_inicio date not null, data_fim date not null,
  tipo text not null check (tipo in (
    'falta','falta_justificada','atestado_medico','atestado_familiar',
    'licenca_maternidade','licenca_paternidade','folga_compensatoria',
    'ferias','feriado','suspensao','outros'
  )),
  motivo text, documento_url text,
  aprovado boolean default false,
  aprovado_por uuid references usuarios(id),
  aprovado_em timestamptz,
  created_at timestamptz default now()
);

create table if not exists banco_horas (
  id uuid default gen_random_uuid() primary key,
  educadora_id uuid references educadoras(id) on delete cascade,
  data date not null,
  minutos_credito int default 0, minutos_debito int default 0,
  descricao text,
  created_at timestamptz default now()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BLOCO 5: DADOS INICIAIS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

insert into grupos_acesso (nome, descricao, cor, ordem) values
  ('Administrador',        'Acesso total ao sistema',                         '#2d5240', 1),
  ('Professor Referência', 'Planejamento, registros e acompanhamento completo','#4a7c59', 2),
  ('Apoio',                'Registros diários com aprovação opcional',         '#b8923a', 3),
  ('RH',                   'Visualização e controle de ponto',                 '#185fa5', 4),
  ('Coordenadora',         'Visualização geral',                               '#6b4e71', 5),
  ('Diretora',             'Visualização geral',                               '#c4714a', 6)
on conflict (nome) do nothing;

insert into modulos (id, nome, icone, categoria, ordem) values
  ('dashboard',        'Início',              '🏠', 'principal',  1),
  ('registro-diario',  'Registro do Dia',     '📋', 'principal',  2),
  ('banco-atividades', 'Banco de Atividades', '🗂️', 'pedagogico', 3),
  ('planejamento',     'Planejamento',        '📅', 'pedagogico', 4),
  ('criancas',         'Crianças',            '🧒', 'pedagogico', 5),
  ('registros',        'Registros',           '📝', 'pedagogico', 6),
  ('inclusao',         'Inclusão',            '🧠', 'pedagogico', 7),
  ('rotina',           'Rotina do Dia',       '✅', 'diario',     8),
  ('fotos',            'Diário Fotográfico',  '📸', 'diario',     9),
  ('jornal',           'Jornal Literário',    '📰', 'diario',    10),
  ('educadoras',       'Educadoras',          '👩‍🏫','equipe',    11),
  ('ponto',            'Controle de Ponto',   '⏱️', 'equipe',    12),
  ('relatorios',       'Relatórios',          '📊', 'equipe',    13),
  ('usuarios',         'Usuários e Acessos',  '🔐', 'admin',     14),
  ('auditoria',        'Auditoria',           '🔍', 'admin',     15)
on conflict (id) do nothing;

-- Storage buckets
insert into storage.buckets (id, name, public) values
  ('fotos', 'fotos', true), ('documentos', 'documentos', false)
on conflict do nothing;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BLOCO 6: OCORRÊNCIAS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

create table if not exists ocorrencias (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  data date not null default current_date,
  hora time,
  categoria text not null check (categoria in (
    'comportamental','incidente_fisico','reclamacao_familia',
    'conduta_profissional','operacional','saude','outros'
  )),
  gravidade text not null check (gravidade in ('baixa','media','alta','critica')) default 'media',
  descricao text not null,
  local text,
  -- Participantes
  criancas_ids jsonb default '[]',
  educadoras_ids jsonb default '[]',
  terceiros text,
  -- Encaminhamento
  encaminhamentos jsonb default '[]',
  observacoes_encaminhamento text,
  -- Status e resolução
  status text check (status in ('aberta','acompanhamento','resolvida','arquivada')) default 'aberta',
  resolucao text,
  -- Rastreabilidade
  registrado_por text,
  registrado_por_id uuid references usuarios(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ocorrencias_data on ocorrencias(data desc);
create index if not exists idx_ocorrencias_status on ocorrencias(status);
create index if not exists idx_ocorrencias_categoria on ocorrencias(categoria);

-- Adicionar ocorrências ao módulo
insert into modulos (id, nome, icone, categoria, ordem) values
  ('ocorrencias', 'Ocorrências', '⚡', 'pedagogico', 7)
on conflict (id) do nothing;

