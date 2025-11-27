# ADR – Escolha do Banco de Dados

## Contexto

Para o desenvolvimento da aplicação, era necessário escolher um banco de dados que oferecesse estabilidade, suporte a relacionamentos e fácil integração com ferramentas comuns no ecossistema Node.js.

## Decisão

Optou-se pela utilização do **MySQL** como banco de dados principal. Os fatores que motivaram essa escolha incluem:

- Ser um banco **relacional**, ideal para aplicações com dados estruturados.
- Fornecer **estabilidade** e **integridade transacional**.
- Ter **desempenho adequado** e ser amplamente utilizado na indústria.
- Oferecer compatibilidade com ORMs como **Sequelize** e **Prisma**, facilitando implementação e manutenção.
- Possuir grande comunidade e vasto suporte.

Também foi decidido executar o MySQL por meio de **Docker Compose**, garantindo:

- **Padronização do ambiente** entre todos os desenvolvedores.
- Evitar problemas de instalação local.
- Subir o ambiente com um único comando.
- **Isolamento**, **portabilidade**, controle de **versão** e configuração facilitada.
- Persistência por meio de volumes e reprodutibilidade do ambiente.

## Consequências

A decisão resulta em:

- Um ambiente confiável, previsível e fácil de manter.
- Maior aderência a boas práticas modernas de desenvolvimento.
- Redução de inconsistências entre máquinas diferentes.
- Leve curva de aprendizado para quem não está habituado com Docker.
