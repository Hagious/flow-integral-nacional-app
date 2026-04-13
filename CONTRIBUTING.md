# Contributing

Obrigado por contribuir com este projeto! Este guia apresenta o padrão profissional de contribuição usado aqui e em outros projetos.

## 1. Padrões de commit
Use sempre o padrão de commits adotado no repositório:

Formato:

```text
<type>(<scope>): descrição sucinta
```

Tipos recomendados:

- `feat` — nova funcionalidade
- `fix` — correção de bug
- `docs` — documentação
- `style` — formato, estilo ou espaçamento
- `refactor` — refatoração sem mudança de comportamento
- `perf` — melhoria de performance
- `test` — adição ou alteração de testes
- `chore` — manutenção, build ou infraestrutura

Exemplos:

- `feat(dashboard): adicionar humor diário e saudação personalizada`
- `fix(supabase): corrigir fallback para localStorage`
- `docs(readme): documentar padrão de commits`

### Template de commit
Este repositório usa `.gitmessage` como template local de commit.
Para ativar em outros projetos:

```bash
git config commit.template .gitmessage
```

## 2. Branch naming
Use nomes de branch claros e descritivos:

- `feat/<descrição-curta>`
- `fix/<descrição-curta>`
- `docs/<descrição-curta>`
- `chore/<descrição-curta>`

Exemplo:

```text
feat/dashboard-humor-diario
```

## 3. Fluxo de trabalho sugerido
1. Crie uma branch a partir de `main`
2. Faça commits pequenos e atômicos seguindo o padrão
3. Abra pull request quando a feature estiver pronta
4. Descreva o que foi alterado e por quê
5. Inclua testes ou verificações manuais quando aplicável

## 4. Documentação e atualização do README
Sempre atualize o `README.md` se:

- houver mudanças em comandos de execução
- forem adicionadas novas funcionalidades
- o fluxo de setup mudar
- a arquitetura de pasta ou dependências mudar

## 5. Boas práticas gerais
- Escreva em português claro e objetivo
- Mantenha o histórico de commits legível
- Prefira arquivos pequenos e responsabilidades bem definidas
- Não deixe código comentado sem motivo
- Remova imports não utilizados e cuide da formatação

## 6. Como enviar mudanças
1. Faça alterações na branch apropriada
2. Adicione e commite as mudanças localmente
3. Faça push para o remoto
4. Crie um pull request com descrição clara
5. Aguarde revisão e ajuste quando necessário

## 7. Padrão profissional para outros projetos
Para usar o mesmo padrão em outros repositórios:

- copie `.gitmessage`
- copie `.github/commit-convention.md`
- adicione `CONTRIBUTING.md`
- mantenha o `README.md` atualizado
