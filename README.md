# Corrida do Gustavo

Jogo de corrida de veículos em primeira pessoa, ambientado no circuito de
Monte Carlo. Escolha entre Fórmula 1, Moto, Ônibus, Bicicleta ou Patinete e
dispute 3 voltas contra os outros quatro veículos, controlados pela IA.

## Como jogar

1. Instale as dependências: `npm install`
2. Rode o servidor de desenvolvimento: `npm run dev`
3. Abra o endereço exibido no terminal (normalmente `http://localhost:5173`)

Controles: `W` acelera, `S` freia/dá ré, `A`/`D` esterçam para os lados.

## Build de produção

```
npm run build
npm run preview
```

Os arquivos finais ficam em `dist/`, prontos para hospedar em qualquer
servidor estático (GitHub Pages, Netlify, Vercel etc.).

## Estrutura

- `src/main.js` — fluxo do jogo (menu, contagem regressiva, corrida, resultado)
- `src/game/track.js` — traçado do circuito (curva fechada inspirada em Monte Carlo)
- `src/game/trackMesh.js` — geração da malha da pista, meio-fio e guard-rails
- `src/game/environment.js` — céu, mar, montanhas, prédios, iluminação
- `src/game/vehicles.js` — estatísticas de cada veículo
- `src/game/raceCar.js` — física simplificada e lógica de corrida
- `src/game/scene.js` — câmera em primeira pessoa, renderização e pós-processamento
