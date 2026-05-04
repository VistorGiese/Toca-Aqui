---
slug: foto-perfil-bad-request
status: root_cause_found
trigger: Erro 400 Bad Request ao carregar a tela de perfil do usuario comum — provavelmente relacionado a URL ou campo de foto de perfil
created: 2026-05-04
updated: 2026-05-04
---

# Debug Session: foto-perfil-bad-request

## Symptoms
- expected: Tela de perfil do usuario comum carrega normalmente exibindo foto salva
- actual: Erro 400 Bad Request ocorre ao carregar a tela (nao ao salvar)
- error_messages: "400 Bad Request" — sem mensagem detalhada capturada
- timeline: Identificado em teste manual recente
- reproduction: Abrir a tela de perfil do usuario comum (UserProfile ou UserSettings)

## Current Focus
- hypothesis: URL de foto_perfil mal-formada em UserProfile.tsx causando requisicao inválida ao backend
- test: verificado fluxo completo de URL construction e chamadas de API no mount
- expecting: foto_perfil armazenado como caminho relativo "uploads/filename.jpg" no DB
- next_action: fix URL construction e adicionar guard contra valores já absolutos

## Evidence
- timestamp: 2026-05-04T00:00:00Z
  file: TocaAqui/screens/user/UserProfile.tsx
  lines: 62-64
  finding: |
    URL de foto construida como:
    `${api.defaults.baseURL?.replace("/api", "")}/${perfil.value.user.foto_perfil}`
    Se foto_perfil no DB contiver um URL absoluto (http://...) de versão anterior,
    o resultado seria "http://host:3000/http://host:3000/uploads/file.jpg" — request inválido.
    Mesmo sem isso, o .replace("/api", "") é frágil — baseURL nunca tem /api.

- timestamp: 2026-05-04T00:01:00Z
  file: TocaAqui/screens/user/UserProfile.tsx
  lines: 94-95
  finding: |
    Mesmo padrão repetido após upload de foto — mesma fragilidade.

- timestamp: 2026-05-04T00:02:00Z
  file: TocaAqui/http/userService.ts
  lines: 104-128
  finding: |
    uploadFoto envia multipart via fetch (correto, sem Content-Type manual).
    Retorna { foto_perfil: "uploads/filename.jpg" } — caminho relativo.

- timestamp: 2026-05-04T00:03:00Z
  file: backend-TocaAqui/src/services/UploadService.ts
  lines: 102-103
  finding: |
    getRelativePath retorna "uploads/${file.filename}" — sempre relativo.

- timestamp: 2026-05-04T00:04:00Z
  file: backend-TocaAqui/src/index.ts
  lines: 74-79
  finding: |
    Arquivos estáticos servidos em app.use('/uploads', express.static(...)).
    URL correta: http://host:3000/uploads/filename.jpg.

- timestamp: 2026-05-04T00:05:00Z
  file: TocaAqui/http/api.ts
  lines: 6-11
  finding: |
    baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://{host}:3000"
    Sem sufixo /api. O .replace("/api", "") em UserProfile.tsx é um no-op.

- timestamp: 2026-05-04T00:06:00Z
  file: TocaAqui/screens/user/UserProfile.tsx
  lines: 51-73
  finding: |
    loadData usa Promise.allSettled — nenhuma das 4 chamadas API causa crash visível.
    O 400 provavelmente é do <Image> tentando carregar a URL da foto.

- timestamp: 2026-05-04T00:07:00Z
  file: backend-TocaAqui/src/controllers/UserController.ts
  lines: 59-76
  finding: |
    getUserProfile retorna foto_perfil: user.foto_perfil || null.
    Se o campo no DB contiver um valor absoluto (legado), ele é passado diretamente.

## Eliminated
- Token/auth: getProfile retorna 200 com token válido (401 seria logout automático via interceptor)
- Rate limiting: retorna 429, não 400
- Schema validation: nenhuma das rotas GET tem validate() middleware
- Crash de tela: Promise.allSettled absorve rejeições individuais

## Resolution
- root_cause: |
    A URL de exibição da foto é construída em UserProfile.tsx como
    `${baseURL.replace("/api", "")}/${foto_perfil}`. Se foto_perfil no banco
    contiver um URL absoluto (de versão anterior do código ou de dado corrompido),
    a concatenação resulta em URL inválida (ex: "http://host:3000/http://host:3000/uploads/file.jpg")
    que causa 400 ao ser carregada pelo componente <Image>.
    Mesmo para caminhos relativos corretos, a construção é frágil e não valida o valor recebido.
- fix: |
    Adicionar guard em UserProfile.tsx: se foto_perfil já começar com "http",
    usar diretamente; caso contrário, concatenar com baseURL.
    Remover o .replace("/api", "") desnecessário.
    Aplicar o mesmo guard na linha 95 (após upload).
- verification: Abrir UserProfile com usuário que tem foto salva — sem erro 400 no console
- files_changed: TocaAqui/screens/user/UserProfile.tsx
