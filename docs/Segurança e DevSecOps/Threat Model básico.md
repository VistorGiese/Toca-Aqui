# Threat Model Básico — Login e Agendamento

Este documento apresenta uma análise de ameaças para o fluxo de **login** e **agendamento**, usando o modelo **STRIDE**.

---

## 1. Contexto do Sistema

- Usuário acessa o fluxo de login (**email + senha → API → banco**).
- Após autenticação, pode **criar, visualizar ou cancelar agendamentos**.
- Comunicação realizada via **API REST**.

---

## 2. Ameaças (Modelo STRIDE)

### 2.1 Spoofing (Falsificação de Identidade)

**Ameaças:**

- Tentativa de login com credenciais roubadas.
- Ataques de **força bruta**.
- Sequestro de sessão através de roubo do token JWT.

**Mitigações:**

- Hash seguro de senha (**BCrypt** ou **Argon2**).
- **Rate limiting** no endpoint de login.
- **Expiração de token** e renovação segura.
- **MFA** opcional.

---

### 2.2 Tampering (Manipulação de Dados)

**Ameaças:**

- Modificação de payloads de login ou agendamento.
- Envio de agendamentos com horários inválidos ou adulterados.

**Mitigações:**

- Uso obrigatório de **HTTPS**.
- **Validação de dados** no backend.
- **JWT assinado** para impedir alteração de payload.

---

### 2.3 Repudiation (Repúdio)

**Ameaças:**

- Usuário negar que realizou login ou criou/cancelou um agendamento.

**Mitigações:**

- **Logs de auditoria** detalhados.
- Registro de ações no banco com **ID do usuário** e **timestamp**.

---

### 2.4 Information Disclosure (Exposição de Dados)

**Ameaças:**

- Vazamento de senhas, tokens ou informações pessoais.
- Acesso a agendamentos de outros usuários.

**Mitigações:**

- Senhas **hasheadas**.
- **RBAC** e checagem rigorosa de permissões.
- Respostas da API sem informações sensíveis.

---

### 2.5 Denial of Service (DoS)

**Ameaças:**

- Envio massivo de requisições derrubando o servidor.
- Sobrecarga no endpoint de agendamento.

**Mitigações:**

- **Rate limiting** global.
- **Circuit breaker**.
- Proteção via **firewall/WAF**.

---

### 2.6 Elevation of Privilege (Elevação de Privilégio)

**Ameaças:**

- Usuário comum tentando agir como administrador.
- Manipulação de IDs no payload para acessar dados alheios.

**Mitigações:**

- Controle de **roles** e permissões.
- Checagem do usuário autenticado em **todas as operações**.
- Validação de IDs e ownership no backend.

---

## 3. Resumo Geral

O modelo de ameaças identifica riscos em:

- Autenticação
- Manipulação de dados
- Exposição de informações
- Disponibilidade
- Elevação de privilégios

As defesas aplicadas incluem:

- HTTPS
- JWT bem configurado
- Logs de auditoria
- Rate limiting
- Validação de entrada
- Controle de acesso baseado em permissões

---
