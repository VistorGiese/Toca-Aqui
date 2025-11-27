# Estratégias de Resiliência Aplicadas

Este documento descreve as principais estratégias de resiliência implementadas no sistema para aumentar robustez, estabilidade e tolerância a falhas.

---

## 1. Retry (Tentativas Automáticas)

- Realiza novas tentativas automáticas quando uma requisição ao banco ou API falha de forma temporária.
- Limite configurado: **até 3 tentativas**, com pequeno intervalo entre elas.
- Evita falhas causadas por instabilidade momentânea da rede ou de containers.

---

## 2. Timeout (Tempo Máximo de Espera)

- Define um tempo máximo de espera para cada requisição antes de ser cancelada.
- Timeout configurado: **3 a 5 segundos**.
- Impede que a aplicação fique travada aguardando respostas lentas, evitando bloqueios e filas desnecessárias.

---

## 3. Circuit Breaker

- Mecanismo que desliga temporariamente chamadas a serviços que estão falhando repetidamente.
- Quando muitos erros **5xx** ocorrem em sequência, o circuito **abre** e impede novas tentativas momentaneamente.
- Após um tempo, entra em modo de **meia-abertura** para testar se o serviço voltou ao normal.

---

## 4. Bulkhead (Isolamento de Recursos)

- Separa recursos e conexões entre funcionalidades diferentes.
- Evita que uma operação pesada impacte todo o sistema.
- Exemplo: limitar conexões simultâneas ao banco para cada módulo.

---

## 5. Fallback (Resposta Substituta)

- Caso uma funcionalidade falhe, o sistema retorna uma resposta alternativa.
- Exemplo: dados cacheados ou uma mensagem clara ao usuário.
- Mantém a experiência do usuário mesmo durante falhas temporárias.

---

## 6. Rate Limiting (Limite de Requisições)

- Controla o número de requisições que um cliente pode fazer em determinado período.
- Prevê sobrecargas e mitiga ataques como DoS.
- Exemplo: limite de **100 requisições por minuto por usuário**.

---

## 7. Cache de Respostas

- Armazena temporariamente respostas de endpoints de leitura.
- Reduz a carga no banco de dados.
- Garante alta performance mesmo durante picos de tráfego.
- Ideal para endpoints de consulta e listagens.

---

## 8. Health Checks e Auto-Recovery

- Verificações constantes de saúde nos serviços.
- Containers com falhas são reiniciados automaticamente via Docker.
- Minimiza tempo fora do ar e mantém o sistema funcional.

---
