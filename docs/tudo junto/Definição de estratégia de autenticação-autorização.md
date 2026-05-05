# Documento — Estratégia de Autenticação e Autorização

**Projeto:** Toca Aqui  
**Versão:** 1.0

---

## 1. Objetivo

Definir como o sistema realiza autenticação e autorização, garantindo acesso seguro às funcionalidades de acordo com o tipo de usuário.

---

## 2. Estratégia Geral

O sistema utiliza uma combinação de:

- **Autenticação baseada em JWT (JSON Web Tokens)**
- **Autorização baseada em papéis (RBAC – Role-Based Access Control)**

Após o login, o usuário recebe um token JWT contendo suas informações básicas e seu papel (_role_).  
Esse token é enviado em todas as requisições protegidas.

---

## 3. Autenticação (JWT)

### 3.1 Fluxo

1. Usuário envia email + senha para **/login**.
2. Credenciais são validadas no MySQL.
3. Se válidas, o sistema gera um JWT contendo:
   - `sub` (id do usuário)
   - `email`
   - `role`
   - `iat` / `exp` (timestamp e expiração)
4. O token é enviado ao cliente.
5. O cliente envia o token no header:  
   **Authorization: Bearer \<token\>**

### 3.2 Padrões Adotados

- **Algoritmo:** HS256
- **Expiração padrão:** 8 horas
- **Secret key:** variável de ambiente `JWT_SECRET`

### 3.3 Regras de Segurança

- Senhas armazenadas com **bcrypt**
- Tentativas de login limitadas (**rate limiting via Nginx**)
- Sem refresh token (para simplificar o MVP)

---

## 4. Autorização (RBAC — Role-Based Access Control)

O controle de permissões é baseado no papel do usuário, presente no JWT.

### 4.1 Papéis Disponíveis

| Papel                   | Descrição                                                |
| ----------------------- | -------------------------------------------------------- |
| **admin**               | Acesso completo ao sistema                               |
| **establishment_owner** | Gerencia estabelecimentos e eventos                      |
| **artist**              | Gerencia perfil artístico; candidata-se a eventos        |
| **common_user**         | Favoritos, comentários e avaliações (via Social Service) |

> Para simplificar o desenvolvimento, o sistema **pode operar apenas com `admin`**.  
> Porém, a arquitetura completa prevê todos os papéis acima.

---

## 5. Middleware de Segurança

O backend possui dois níveis principais:

### 5.1 Middleware de Autenticação

- Verifica se o JWT é válido e não expirou
- Anexa os dados do usuário em `req.user`

### 5.2 Middleware de Autorização

Verifica se o papel do usuário tem permissão para acessar a rota.

Exemplo conceitual:

```ts
authorize(["admin", "establishment_owner"]);
```
