# Checklist de Segurança do Pipeline CI/CD — Toca Aqui

## 1. Análise de Dependências

- Adicionar `npm audit` no job **build**.
- Falhar o pipeline se houver vulnerabilidades críticas.

## 2. Testes Automatizados

- Garantir que o job **test** só executa após o **build** (já configurado).
- Incluir testes mínimos para validar comportamentos básicos.

## 3. Proteção de Segredos

- Usar apenas **GitHub Secrets** em futuros passos de deploy.
- Nunca colocar tokens ou chaves diretamente no arquivo YAML.

## 4. Proteção de Branch

- Ativar **branch protection rules**:
  - Bloquear push direto para `main` e `dev`.
  - Exigir Pull Request + pipeline passando.

## 5. Validação do Código

- Ativar **Code Scanning** (GitHub Advanced Security ou CodeQL), opcionalmente.

## 6. Integridade do Pipeline

- Limitar quem pode modificar `.github/workflows/`.
- Usar a opção **Require reviewers** no repositório.

## 7. Segurança no Deploy

- Deploy só deve acontecer após todos os testes concluídos (já configurado).
- Prever um processo simples de **rollback manual** caso algo falhe.
