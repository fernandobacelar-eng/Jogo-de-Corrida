# Flauta Guia

Aplicativo Android para aprender flauta transversal.

- **Afinar:** Lá de referência (430 a 450 Hz) e afinador pelo microfone, que diz se é preciso puxar ou empurrar a cabeça da flauta.
- **Notas:** escolha uma nota (Dó4 a Dó7) e veja a digitação desenhada na flauta, a nota na pauta e a notação numérica. Com "Detectar pelo som", o app escuta a flauta e mostra a digitação da nota tocada.
- **Lições:** 13 lições em sequência. O app escuta e só avança quando a nota está certa.
- **Guia:** postura, embocadura, respiração, mudança de oitava e cuidados.

## Como gerar o APK

A cada push que altera `flauta-app/`, o GitHub Actions gera o APK
(workflow "Gerar APK da Flauta Guia"). Baixe o arquivo `flauta-guia-apk`
na página da execução, descompacte e instale `app-debug.apk` no celular
(é preciso permitir "instalar apps de fontes desconhecidas").

Localmente, com Android SDK e JDK 21: `npm ci && npm run apk`.

## Testar no navegador

`npm run serve` e abra http://localhost:8123 (o microfone só funciona em
localhost ou HTTPS).
