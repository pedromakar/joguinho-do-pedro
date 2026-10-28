# PRD — Jogo Casual de Adivinhação de Palavras
**Versão:** 1.1  
**Status:** Aprovado e Implementado  
**Público-Alvo:** Jogadores casuais de mobile e web, fãs de desafios rápidos de lógica e vocabulário  
**Plataforma Inicial:** Web App Responsiva (PWA / Mobile-first)  

---

## 1. Visão Geral e Proposta de Valor

### 1.1 Objetivo do Produto
Criar um jogo casual de adivinhação de palavras em Português (PT-BR) com foco em sessões rápidas (2 a 5 minutos), visual moderno e elegante em *Dark Mode*, zero atrito de instalação/login e máxima satisfação sensorial ("game feel" refinado).

### 1.2 Proposta de Valor
- **Acessibilidade Instantânea:** Roda direto no navegador de qualquer smartphone ou computador sem necessidade de download ou login.
- **Três Formatos:** Termo (1 palavra), Dueto (2 palavras simultâneas) e Quarteto (4 palavras simultâneas).
- **Calendário Histórico & Arquivo:** Possibilidade de navegar pelos meses, conferir o histórico de acertos e jogar palavras de qualquer dia passado.
- **Replay Imediato:** Modo "Nova Palavra" para jogar partidas consecutivas sem bloqueio de 24 horas.
- **Tratamento Inteligente do Português:** O jogador digita teclas simples (`A`, `C`, `E`) e o jogo normaliza e posiciona automaticamente acentos e cedilhas (`Á`, `Â`, `Ã`, `Ç`, `É`) ao validar a palavra, evitando fricção em teclados virtuais.
- **Design Premium & Game Feel:** Animações satisfatórias de revelação em 3D, feedback sonoro e tátil sutil, paleta dark mode com contraste calibrado e suporte a daltônicos.

---

## 2. Pesquisa de Mercado & Benchmarks

| Jogo | Mecânica Chave | Forças | Fraquezas a Superar |
| :--- | :--- | :--- | :--- |
| **Wordle** (NYT) | Dedução posicional 5 letras, 6 tentativas, 1x ao dia. | Grade de compartilhamento com emojis gerou viralização mundial; simplicidade máxima. | Monotonia após a palavra do dia (não há modo livre oficial); suporte limitado a nuances de outros idiomas. |
| **Termo** (Fernando Serboncini) | Adaptação para PT-BR com teclado adaptado. | Dicionário brasileiro excelente; remoção de acentos na digitação facilita uso mobile; variações Dueto e Quarteto. | Interface espartana; pouca personalização estética; transições visuais simples. |
| **Contexto / Semantle** | Proximidade semântica por inteligência artificial / embeddings. | Desafio instigante e sem limite de tentativas. | Barreira de entrada alta; muitas vezes a proximidade vetorial gera palpites frustrantes ou contra-intuitivos. |
| **4 Fotos 1 Palavra** | Dedução visual por imagens e letras sortidas. | Extremamente casual e rápido. | Consumo alto de dados de imagem; cansaço rápido por repetição de padrões. |

---

## 3. Personas de Usuário

### Persona 1: "O Cafézinho Diário" (Lucas, 29 anos)
- **Hábito:** Joga no celular durante a pausa do trabalho ou transporte público.
- **Motivação:** Quer um desafio intelectual curto para exercitar o cérebro e compartilhar seu placar no grupo de amigos do WhatsApp.
- **Necessidade:** Carregamento em menos de 2 segundos, interface limpa sem popups chatos e persistência de sequência (*streak*).

### Persona 2: "A Fissurada em Palavras" (Beatriz, 42 anos)
- **Hábito:** Gosta de palavras cruzadas, caça-palavras e jogos relaxantes antes de dormir.
- **Motivação:** Não quer parar após apenas uma palavra diária; quer jogar rodadas seguidas para relaxar e desvendar desafios de dias anteriores.
- **Necessidade:** Modo Dueto/Quarteto, Replay instantâneo, animações agradáveis e vocabulário justo.

---

## 4. Requisitos Funcionais (FR)

### FR-01: Mecânica Central (Core Gameplay Loop)
- O objetivo é descobrir a palavra secreta de **5 letras** em até um número fixo de tentativas.
- Cada palpite deve ser uma palavra válida de 5 letras presente no dicionário de validação.
- A cada tentativa submetida (tecla Enter), cada letra da linha é revelada sequencialmente com animação e colorida conforme a regra:
  - 🟩 **Verde (Correto):** A letra existe na palavra e está exatamente nesta posição.
  - 🟨 **Amarelo (Presente):** A letra existe na palavra, mas em outra posição.
  - ⬛ **Cinza/Grafite (Ausente):** A letra não existe na palavra (ou excedeu a contagem de ocorrências).
- **Tratamento de Letras Duplicadas:** Se a palavra secreta possui apenas um "A", e o jogador digita dois "A", apenas o correto recebe verde (ou o primeiro vira amarelo se nenhum estiver no lugar certo); o segundo "A" deve ficar cinza.

### FR-02: Regras de Ortografia e Acentuação PT-BR
- O teclado virtual possui apenas as 26 letras do alfabeto latino padrão (`A-Z`), sem botões dedicados de acento ou cedilha.
- Ao digitar `A`, o sistema aceita palpites que contenham `A`, `Á`, `À`, `Â` ou `Ã`.
- Ao digitar `C`, o sistema aceita `C` ou `Ç`.
- Na animação de revelação da grade, o caractere correto com acento/cedilha é exibido automaticamente.

### FR-03: Três Formatos de Jogo (Termo, Dueto e Quarteto)
- **Termo (1 Palavra):** O clássico de 1 palavra secreta com até 6 tentativas.
- **Dueto (2 Palavras):** 2 palavras simultâneas em tabuleiros lado a lado, com até 7 tentativas. Cada palpite digitado é testado em ambos os tabuleiros. Quando um tabuleiro é acertado, ele é bloqueado e o jogador continua focado no segundo.
- **Quarteto (4 Palavras):** 4 palavras simultâneas em grade 2x2, com até 9 tentativas. O teclado exibe mini indicadores divididos para cada um dos 4 tabuleiros.

### FR-04: Calendário de Acertos & Arquivo de Dias Anteriores
- Visualização mensal em grade com histórico completo das partidas diárias:
  - Dias com vitória: círculo esmeralda com o número de tentativas (ex: `3`, `4`).
  - Dias com derrota: marcador vermelho `✕`.
  - Dias não jogados: marcador de reprodução `▶`.
- **Jogar Dias Passados:** O usuário pode clicar em qualquer data anterior no calendário para abrir e jogar o desafio exato daquele dia (seed determinístico persistido).

### FR-05: Fluxo de Replay Imediato ("Jogar Novamente com Outra Palavra")
- Ao vencer ou perder (ou a qualquer momento pelo botão "Nova Palavra"), o usuário pode continuar jogando instantaneamente com uma nova palavra aleatória selecionada do dicionário, sem a restrição de esperar o dia seguinte.

### FR-06: Teclado Virtual Interativo com Multi-Indicadores
- Layout de 3 linhas otimizado para telas sensíveis ao toque (`QWERTY`).
- Teclas refletem status de forma individual (no Termo) ou com barra inferior de mini-pontos (no Dueto e Quarteto).
- Suporte nativo a teclado físico (computador) com captura de eventos `keydown`.

### FR-07: Game Feel, Animações e Feedback
- **Digitação:** Célula ativa faz animação de "pop" (leve escala 1.1x com retorno suave) ao receber uma letra.
- **Palavra Inválida:** Vibração horizontal (*shake animation*) e notificação flutuante suave (*toast*).
- **Revelação:** Animação de giro vertical (*flip 3D*) célula por célula com atraso escalonado (180ms a 220ms).
- **Vitória:** Disparo de confetes virtuais minimalistas em Canvas 2D + som de vitória.

### FR-08: Estatísticas do Jogador & Streaks
- Salvas localmente no navegador via `localStorage`.
- Métricas rastreadas: Jogadas, Taxa de Vitórias (%), Sequência Atual, Melhor Sequência e Histograma de Distribuição (1 a 9).

### FR-09: Compartilhamento Social Sem Spoiler
- Botão "Compartilhar Resultado" copia texto formatado com matriz de emojis (🟩🟨⬛) via Web Share API e Clipboard API.

---

## 5. Requisitos Não-Funcionais (NFR)

- **NFR-01 (Performance):** Tempo de primeiro carregamento (FCP) < 1.0s. Sem dependências externas pesadas.
- **NFR-02 (Offline-First / PWA):** Funciona mesmo sem conexão com internet após o primeiro acesso através de Service Worker (`sw.js`) e manifesto PWA (`manifest.json`).
- **NFR-03 (Responsividade Total):** Dimensionamento dinâmico `--tile-size` impedindo que a grade sobreponha o teclado em qualquer resolução.
- **NFR-04 (Acessibilidade WCAG AAA):** Modo daltônico com símbolos táteis integrados (`✓`, `↔`, `✕`) e contraste > 7:1.
