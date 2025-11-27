# Checklist de Segurança do Pipeline CI/CD

**Aplicado ao pipeline Toca Aqui CI/CD Pipeline**

---

## 1. Análise de Dependências

- Executar `npm audit` no job de build.
- O build deve **falhar automaticamente** caso existam vulnerabilidades **críticas ou altas**.
- Dependências devem ser atualizadas periodicamente.

---

## 2. Testes Automatizados

- Testes já incluídos com `npm test`.
- Garantem que código inseguro ou quebrado não avance para próximo estágio.
- O pipeline só prossegue se **todos os testes estiverem passando**.

---

## 3. Proteção de Segredos

- Utilizar **GitHub Secrets** para variáveis sensíveis (tokens, chaves, credenciais).
- Nunca commitar segredos no repositório.
- Revisar periodicamente variáveis secretas e revogar as não utilizadas.

---

## 4. Proteção de Branch

- Bloquear push direto na branch `main`.
- Exigir:
  - Pull Request obrigatória
  - Testes passando
  - Pelo menos **1 aprovação** antes de merge
- Ativar “Require status checks to pass”.

---

## 5. Integridade do Pipeline

- Restringir quem pode alterar `.github/workflows`.
- Utilizar **CODEOWNERS** para impor aprovação obrigatória das equipes responsáveis.
- Toda alteração de pipeline precisa ser revisada e aprovada.

---

## 6. Ambiente Isolado

- Jobs executam em runner limpo (`ubuntu-latest`).
- Evita contaminação entre builds diferentes.
- Impede dependências "sujas" no ambiente.

---

## 7. Deploy Seguro

- Deploy é realizado **somente após**:
  - Build bem-sucedido
  - Testes aprovados
  - Auditoria sem riscos críticos
- Em produção:
  - Utilizar secrets
  - Prever mecanismo de rollback
  - Evitar deploy manual sem revisão

---

## 8. Logs e Auditoria

- Monitorar histórico de execuções no GitHub Actions.
- Registrar aprovações de Pull Requests.
- Manter rastreabilidade de quem fez alterações no código e no pipeline.

---

## 9. Resumo Geral

Este checklist assegura que o pipeline CI/CD esteja protegido contra riscos comuns, reforçando:

- Integridade do código
- Segurança de dependências
- Proteção de segredos
- Fluxo de deploy seguro e auditável

É ideal para qualquer sistema que utilize GitHub Actions com Node.js.

---
