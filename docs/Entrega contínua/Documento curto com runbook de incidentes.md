# Runbook de Incidentes — Toca Aqui (Versão Média)

**Última atualização:** 23/11/2025  
**Responsável:** Time de Desenvolvimento / Suporte

---

## 1. Objetivo

Definir como a equipe deve agir quando ocorrer uma falha no sistema **Toca Aqui**, garantindo:

- Recuperação rápida
- Comunicação clara
- Registro adequado do incidente

---

## 2. Quando considerar incidente

Um incidente deve ser aberto quando ocorrer qualquer uma das situações abaixo:

- Aplicativo não carrega, erro na tela inicial ou falha no login.
- API retornando erros **5xx** ou completamente indisponível.
- Lentidão significativa (respostas acima de **3 segundos**).
- Banco de dados sem resposta ou travado.
- Funções críticas (agendamentos, perfil, eventos) não funcionam.

---

## 3. Classificação do Incidente

### **S1 – Crítico**

- Sistema totalmente indisponível.
- Usuários não conseguem acessar ou usar funções principais.  
  **Ação:** atendimento _imediato_.

### **S2 – Alto**

- Módulo importante falhando (ex.: login, eventos), mas o sistema ainda funciona parcialmente.  
  **Ação:** corrigir em até **1 hora**.

### **S3 – Moderado**

- Lentidão, bugs menores ou falhas não críticas.  
  **Ação:** corrigir no **mesmo dia**.

---

## 4. Procedimento em Caso de Incidente

### 4.1 Diagnóstico inicial

1. Verificar dashboards ou logs (API, Banco, Autenticação).
2. Reproduzir o erro rapidamente.
3. Identificar se houve deploy recente.
4. Validar disponibilidade dos serviços externos (caso existam).

---

### 4.2 Ações recomendadas por tipo de falha

#### **API fora do ar**

- Checar logs da API.
- Reiniciar o serviço.
- Se ocorreu após deploy recente → considerar **rollback**.

#### **Banco de dados indisponível**

- Conferir conexões ativas (leak).
- Reiniciar instância se necessário.
- Confirmar integridade das tabelas.

#### **Falha no login / autenticação**

- Verificar validade e expiração dos tokens.
- Checar status do serviço de autenticação.

#### **Lentidão geral**

- Verificar uso de CPU e memória.
- Escalar o serviço temporariamente (se possível).
- Analisar queries lentas no banco.

---

## 5. Comunicação

### Comunicação Interna (time)

Mensagem sugerida:

### Comunicação para Usuários (S1 ou S2)

> “Estamos enfrentando uma instabilidade temporária. Nossa equipe já está trabalhando na correção. Obrigado pela paciência.”

---

## 6. Resolução e Encerramento

Para encerrar o incidente:

1. Validar que o sistema está **estável por 10–15 minutos**.
2. Documentar a **causa raiz** (mesmo que estimada).
3. Registrar o que foi feito e as recomendações de prevenção.
4. Agendar correção definitiva caso tenha sido solução temporária.

---

## 7. Pós-incidente

Após o encerramento:

- Atualizar a documentação, se necessário.
- Registrar melhorias no processo.
- Escalar para revisão técnica se houver recorrência.

---

**Fim do documento.**
