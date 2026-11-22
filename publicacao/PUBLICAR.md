# Flauta Guia: publicação na Google Play

Tudo o que você precisa para publicar o app, em um só lugar.

## 1. Arquivos

| O quê | Link |
|---|---|
| 📦 **Pacote para a Play Store** (.aab assinado, versão 1.0.0) | [flauta-guia-1.0.0.aab](https://github.com/fernandobacelar-eng/Jogo-de-Corrida/raw/ccr-5d370dfd-ulqzz8/publicacao/flauta-guia-1.0.0.aab) |
| 📱 APK para instalar no seu celular (teste) | [flauta-guia.apk](https://github.com/fernandobacelar-eng/Jogo-de-Corrida/releases/download/flauta-latest/flauta-guia.apk) |
| 🔒 **Política de privacidade** (use este endereço na Play Store) | https://github.com/fernandobacelar-eng/Jogo-de-Corrida/blob/ccr-5d370dfd-ulqzz8/publicacao/politica-de-privacidade.md |
| 🖼️ Ícone 512×512 | [icone-512.png](https://github.com/fernandobacelar-eng/Jogo-de-Corrida/raw/ccr-5d370dfd-ulqzz8/flauta-app/loja/icone-512.png) |
| 🖼️ Imagem de destaque 1024×500 | [destaque-1024x500.png](https://github.com/fernandobacelar-eng/Jogo-de-Corrida/raw/ccr-5d370dfd-ulqzz8/flauta-app/loja/destaque-1024x500.png) |
| 🖼️ Capturas de tela (1080×1920) | [1](https://github.com/fernandobacelar-eng/Jogo-de-Corrida/raw/ccr-5d370dfd-ulqzz8/flauta-app/loja/captura-1-inicio.png) · [2](https://github.com/fernandobacelar-eng/Jogo-de-Corrida/raw/ccr-5d370dfd-ulqzz8/flauta-app/loja/captura-2-notas.png) · [3](https://github.com/fernandobacelar-eng/Jogo-de-Corrida/raw/ccr-5d370dfd-ulqzz8/flauta-app/loja/captura-3-afinar.png) · [4](https://github.com/fernandobacelar-eng/Jogo-de-Corrida/raw/ccr-5d370dfd-ulqzz8/flauta-app/loja/captura-4-licao.png) · [5](https://github.com/fernandobacelar-eng/Jogo-de-Corrida/raw/ccr-5d370dfd-ulqzz8/flauta-app/loja/captura-5-descobrir.png) |

> A **chave de assinatura** (flauta-guia-upload.jks) e a senha **não** estão aqui, porque este repositório é público. Elas foram enviadas a você em particular. Guarde as duas: sem elas, não é possível publicar atualizações.

## 2. Textos da página na loja

**Nome do app:** Flauta Guia: Aprenda Flauta

**Descrição curta:**
Aprenda flauta transversal: digitações, afinador e lições que escutam você.

**Descrição completa:**

Aprenda a tocar flauta transversal com um app que escuta você.

🎵 Digitações de todas as notas: veja tecla por tecla como tocar as 37 notas da flauta, do Dó grave ao Dó agudo, com desenho realista e cores para cada mão.
🎯 Afinador com Lá de referência: ouça o Lá (430 a 450 Hz) e afine sua flauta com o mostrador que indica se é preciso puxar ou empurrar a cabeça.
👂 O app escuta você: toque uma nota e veja na hora qual é e como está a afinação.
📚 13 lições em sequência: das primeiras notas à terceira oitava. A lição só avança quando a nota está certa.
🔍 Descobrir a nota: marque as teclas no desenho e descubra qual nota sai.
📖 Guia: postura, embocadura, respiração, mudança de oitava e cuidados com a flauta.

Para iniciantes e para quem já tem alguma noção. Funciona sem internet.

**Categoria:** Educação · **Tags:** música, flauta, instrumento

## 3. Respostas para os formulários do Play Console

**Segurança dos dados (Data safety)**
- O app coleta ou compartilha dados do usuário? **Não**
- (O microfone é usado só no aparelho, sem gravar nem enviar áudio. Pela regra da Google, isso **não** conta como coleta.)

**Acesso ao app:** todas as funções estão disponíveis sem login.
**Anúncios:** o app **não** contém anúncios.
**Classificação de conteúdo:** categoria "Referência, notícias ou educacional". Responda **Não** a todas as perguntas sobre violência, sexo, linguagem, drogas, apostas e interação entre usuários. Resultado esperado: **Livre**.
**Público-alvo:** 13 anos ou mais. Isso evita as exigências extras de apps para crianças. Se quiser incluir crianças, me avise.
**Permissões:** RECORD_AUDIO, para identificar a nota tocada.

## 4. Passo a passo

1. Crie a conta de desenvolvedor em **play.google.com/console** (taxa única de 25 dólares e verificação de identidade).
2. **Criar app** → nome "Flauta Guia", idioma Português (Brasil), tipo **App**, **Gratuito**.
3. **Página principal da loja:** cole os textos da seção 2 e envie o ícone, o destaque e as capturas da seção 1.
4. **Conteúdo do app:** preencha a política de privacidade (endereço da seção 1), o acesso ao app, os anúncios, a classificação, o público-alvo e a segurança dos dados, com as respostas da seção 3.
5. **Testes → Teste fechado:** crie uma versão e envie o arquivo **flauta-guia-1.0.0.aab**. Na primeira vez, aceite o **Assinatura de apps do Google Play**.
6. ⚠️ **Contas pessoais novas** precisam de um **teste fechado com pelo menos 12 testadores por 14 dias seguidos** antes de liberar a versão de produção. Convide amigos e familiares pelo e-mail deles.
7. Depois dos 14 dias: **Produção → Criar versão** → use o mesmo .aab → **Enviar para revisão**. A análise costuma levar de alguns dias a uma semana.

## 5. Atualizações

Para cada nova versão, eu gero um novo .aab assinado com a mesma chave, com o número de versão aumentado. Você só envia o arquivo em **Produção → Criar versão**.
