# language: pt
Funcionalidade: Candidatura de artista a um evento

  Cenário: Artista se candidata e o estabelecimento aceita
    Dado que existe um estabelecimento com um evento aberto para candidaturas
    E existe um artista cadastrado
    Quando o artista se candidata ao evento
    Então a candidatura é criada com status "pendente"
    Quando o estabelecimento aceita a candidatura
    Então a candidatura passa para o status "aceito"
    E um contrato é gerado para o evento

  Cenário: Estabelecimento não pode aceitar candidatura de um evento que não é seu
    Dado que existe uma candidatura pendente para o evento de outro estabelecimento
    Quando um estabelecimento diferente tenta aceitar essa candidatura
    Então a resposta é "Acesso negado" com status 403

  Cenário: Duas candidaturas concorrentes ao mesmo evento — apenas uma é aceita
    Dado que existem duas candidaturas pendentes para o mesmo evento
    Quando o estabelecimento tenta aceitar as duas candidaturas ao mesmo tempo
    Então apenas uma candidatura é aceita com sucesso
    E a outra recebe um erro de conflito com status 409
