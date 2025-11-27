# Documento — Estratégia de Deploy

**Projeto:** Toca Aqui  
**Versão:** 1.0

---

## 1. Objetivo

Definir como o sistema é implantado (deploy) nos ambientes de desenvolvimento e produção, incluindo mecanismos de segurança, rollback e disponibilidade.

---

## 2. Estratégia Geral de Deploy

Como o Toca Aqui é um projeto de porte médio com arquitetura simples (monolito + microserviço social), a estratégia adotada é:

### ✅ Deploy Simples com Suporte a Rollback Rápido

Ou seja:

- O sistema sobe como contêineres via **Docker Compose**
- O deploy é feito substituindo a versão antiga pela nova
- Em caso de falha, o rollback consiste em restaurar rapidamente a imagem anterior

A estratégia prioriza **simplicidade, controle e baixo custo**.

---

## 3. Pipeline de Build e Deploy

### 3.1 Build

Para cada nova release:

1. Código é commitado no repositório
2. Uma nova imagem Docker é construída, por exemplo:
   - `backend:1.0.3`
   - `social:1.0.3`
3. As imagens são armazenadas localmente ou em registry (ex.: Docker Hub)

### 3.2 Deploy

O deploy consiste em:

1. Parar as versões atuais
2. Substituir as imagens usadas
3. Subir novamente via:

```bash
docker-compose pull   # opcional se usar registry
docker-compose up -d --build
```
