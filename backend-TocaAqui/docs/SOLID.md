# Princípios SOLID aplicados no backend

Este documento descreve 2 princípios SOLID demonstráveis no código do `backend-TocaAqui`, com referências `arquivo:linha`.

## 1. SRP — Single Responsibility Principle

### 1.1 Arquitetura em camadas (Routes → Controllers → Services → Models)

Cada camada tem uma única responsabilidade:

- **Controller** — recebe a requisição HTTP, valida autorização, chama o serviço e formata a resposta. Não contém regra de negócio.
  - `src/controllers/ContractController.ts:17-32` (`getContract`) — só extrai parâmetros, verifica permissão via `contractService.getUserRole` e devolve o resultado de `contractService.getById`.
- **Service** — concentra a regra de negócio do domínio, sem conhecer detalhes de HTTP.
  - `src/services/ContractService.ts:27` (`class ContractService`) — métodos como `acceptContract`, `cancelContract`, `proposeEdit` implementam as regras do ciclo de vida do contrato.
- **Model** — define o schema/persistência via Sequelize, sem regra de negócio.
  - `src/models/ContractModel.ts:83` (`class ContractModel`) — apenas atributos, tipos e mapeamento para a tabela `contratos`.

### 1.2 Separação dentro do domínio de pagamentos

Mesmo dentro de um mesmo domínio, responsabilidades distintas ficam em classes distintas:

- `src/services/PaymentService.ts:13-71` (`class PaymentService`) — responsabilidade única: CRUD/persistência de registros `PaymentModel` (criar, buscar, atualizar status). Não sabe nada sobre Stripe.
- `src/services/StripeService.ts:12-251` (`class StripeService`) — responsabilidade única: orquestrar a API do Stripe (PaymentIntents, webhooks, reembolsos) e notificações decorrentes, delegando toda a persistência ao `PaymentService`.

Essa separação permite alterar a integração de pagamento (`StripeService`) sem tocar na lógica de persistência (`PaymentService`), e vice-versa.

## 2. DIP — Dependency Inversion Principle

### Antes

`AuthService` dependia diretamente da implementação concreta de envio de email (Nodemailer), importando e chamando as funções de `EmailService.ts` diretamente:

```ts
// src/services/AuthService.ts (antes)
import { sendPasswordResetEmail, sendVerificationEmail } from './EmailService';

export class AuthService {
  async forgotPassword(email: string) {
    // ...
    await sendPasswordResetEmail(email, token);
  }
}
```

Para testar `AuthService` era necessário usar `jest.mock('../services/EmailService', ...)` para substituir o módulo inteiro.

### Depois

`src/services/EmailService.ts` agora expõe a abstração `IEmailProvider` e uma implementação concreta `NodemailerEmailProvider`:

```ts
// src/services/EmailService.ts
export interface IEmailProvider {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

export class NodemailerEmailProvider implements IEmailProvider { /* ... */ }

export const defaultEmailProvider: IEmailProvider = new NodemailerEmailProvider();
```

`src/services/AuthService.ts:28-30` passa a depender apenas da abstração, recebida via injeção de construtor (com valor default para uso em produção):

```ts
export class AuthService {
  constructor(private emailProvider: IEmailProvider = defaultEmailProvider) {}

  async forgotPassword(email: string) {
    // ...
    await this.emailProvider.sendPasswordResetEmail(email, token);
  }
}
```

### Ganho prático

Em `src/__tests__/unit/auth/AuthService.test.ts`, o teste deixou de depender de `jest.mock` no módulo `EmailService` — basta injetar um `fakeEmailProvider: IEmailProvider` com `jest.fn()` no construtor:

```ts
const fakeEmailProvider: IEmailProvider = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};
const service = new AuthService(fakeEmailProvider);
```

`AuthService` agora depende de uma abstração (`IEmailProvider`), não de um detalhe de implementação (Nodemailer) — permitindo trocar o provedor de email (ex: SendGrid, ou um fake em testes) sem alterar `AuthService`.
