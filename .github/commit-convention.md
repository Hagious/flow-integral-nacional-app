# Convenção de Commits

Este documento descreve o padrão de commits recomendado para todos os projetos.

## Formato

`type(scope): descrição sucinta`

- `type` — categoria da mudança
- `scope` — área do projeto afetada (curto, sem espaços)
- `descrição sucinta` — frase breve, em minúsculas, sem ponto final

## Tipos recomendados

- `feat` — nova funcionalidade
- `fix` — correção de bug
- `docs` — alteração na documentação
- `style` — formatação, estilo ou espaçamento
- `refactor` — refatoração sem mudança de comportamento
- `perf` — melhoria de performance
- `test` — adição ou alteração de testes
- `chore` — manutenção, build ou infraestrutura

## Exemplos

- `feat(dashboard): adicionar humor diário e saudação personalizada`
- `fix(supabase): corrigir fallback para localStorage`
- `docs(readme): documentar padrão de commits`
- `refactor(hooks): simplificar hook de dados`
- `chore(ci): atualizar pipeline de deploy`

## Regras adicionais

- Use verbos no infinitivo ou no gerúndio sem imperativo.
- Não use ponto final na descrição curta.
- O body do commit é opcional, mas útil para explicar o porquê da mudança.
- Para commits de documentação, use `docs(scope)`.

## Uso do template

Este repositório também inclui a configuração local de template em `.gitmessage`.
Se quiser usar o mesmo padrão em todos os projetos, copie `.gitmessage` para cada repositório e configure:

```bash
git config commit.template .gitmessage
```
