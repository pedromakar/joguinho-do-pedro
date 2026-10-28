# PRD — Jogo Casual de Adivinhação de Palavras
**Versão:** 1.0  
**Status:** Aprovado para Implementação  
**Público-Alvo:** Jogadores casuais de mobile e web, fãs de desafios rápidos de lógica e vocabulário  
**Plataforma Inicial:** Web App Responsiva (PWA / Mobile-first)  

---

## 1. Visão Geral e Proposta de Valor

### 1.1 Objetivo do Produto
Criar um jogo casual de adivinhação de palavras em Português (PT-BR) com foco em sessões rápidas (2 a 5 minutos), visual moderno e elegante em *Dark Mode*, zero atrito de instalação/login e máxima satisfação sensorial ("game feel" refinado).

### 1.2 Proposta de Valor
- **Acessibilidade Instantânea:** Roda direto no navegador de qualquer smartphone ou computador sem necessidade de download ou login.
- **Dois Modos Complementares:**
  1. *Desafio Diário:* Uma palavra secreta por dia para toda a comunidade, fomentando competição saudável e compartilhamento orgânico.
  2. *Modo Prática / Infinito:* Possibilidade de jogar partidas consecutivas para quem não quer esperar 24 horas.
- **Tratamento Inteligente do Português:** O jogador digita teclas simples (`A`, `C`, `E`) e o jogo normaliza e posiciona automaticamente acentos e cedilhas (`Á`, `Â`, `Ã`, `Ç`, `É`) ao validar a palavra, evitando fricção em teclados virtuais.
- **Design Premium & Game Feel:** Animações satisfatórias de revelação em 3D, feedback sonoro e tátil sutil, paleta dark mode com contraste calibrado.

---

## 2. Pesquisa de Mercado & Benchmarks

| Jogo | Mecânica Chave | Forças | Fraquezas a Superar |
| :--- | :--- | :--- | :--- |
| **Wordle** (NYT) | Dedução posicional 5 letras, 6 tentativas, 1x ao dia. | Grade de compartilhamento com emojis gerou viralização mundial; simplicidade máxima. | Monotonia após a palavra do dia (não há modo livre oficial); suporte limitado a nuances de outros idiomas. |
| **Termo** (Fernando Serboncini) | Adaptação para PT-BR com teclado adaptado. | Dicionário brasileiro excelente; remoção de acentos na digitação facilita uso mobile; variações Dueto e Quarteto. | Interface espartana; pouca personalização estética; transições visuais simples. |
| **Contexto / Semantle** | Proximidade semântica por inteligência artificial / embeddings. | Desafio instigante e sem limite de tentativas. | Barreira de entrada alta; muitas vezes a proximidade vetorial gera palpites frustrantes ou contra-intuitivos. |
| **4 Fotos 1 Palavra** | Dedução visual por imagens e letras sortidas. | Extremamente casual e rápido. | Consumo alto de dados de imagem; cansaço rápido por repetição de padrões. |

### Fatores Críticos de Sucesso Identificados:
1. **Loop Social do Compartilhamento Sem Spoiler:** A matriz de emojis coloridos (ex: 🟩🟨⬛) transforma o resultado de cada jogador em um troféu compartilhável no WhatsApp/Twitter sem estragar a resposta para os amigos.
2. **Escassez vs. Abundância:** O modo diário constrói o hábito (retenção por dias consecutivos / *streaks*), enquanto o modo infinito satisfaz o momento de lazer contínuo.
3. **Curadoria do Dicionário:** Frustração número 1 dos jogadores é ter um palpite comum rejeitado ou a resposta final ser um termo arcaico que ninguém conhece. A divisão em lista de respostas (*target list*) e lista de palpites aceitos (*valid guesses*) é essencial.

---

## 3. Personas de Usuário

### Persona 1: "O Cafézinho Diário" (Lucas, 29 anos)
- **Hábito:** Joga no celular durante a pausa do trabalho ou transporte público.
- **Motivação:** Quer um desafio intelectual curto para exercitar o cérebro e compartilhar seu placar no grupo de amigos do WhatsApp.
- **Necessidade:** Carregamento em menos de 2 segundos, interface limpa sem popups chatos e persistência de sequência (*streak*).

### Persona 2: "A Fissurada em Palavras" (Beatriz, 42 anos)
- **Hábito:** Gosta de palavras cruzadas, caça-palavras e jogos relaxantes antes de dormir.
- **Motivação:** Não quer parar após apenas uma palavra diária; quer jogar 5 a 10 rodadas seguidas para relaxar.
- **Necessidade:** Modo Prática/Infinito fluido, animações agradáveis e vocabulário justo.

---

## 4. Requisitos Funcionais (FR)

### FR-01: Mecânica Central (Core Gameplay Loop)
- O objetivo é descobrir uma palavra secreta de **5 letras** em até **6 tentativas**.
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
- Na animação de revelação da grade, o caractere correto com acento/cedilha é exibido (ex: se a palavra for `MAÇÃ`, a revelação exibe `Ç` e `Ã` com suas formas corretas).

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

### FR-05: Teclado Virtual Interativo
- Layout de 3 linhas otimizado para telas sensíveis ao toque:
  - Linha 1: `Q W E R T Y U I O P`
  - Linha 2: `A S D F G H J K L`
  - Linha 3: `ENTER` | `Z X C V B N M` | `⌫ (BACKSPACE)`
- As teclas do teclado atualizam de cor em tempo real conforme as letras são testadas (prioridade: Verde > Amarelo > Cinza).
- Suporte nativo a teclado físico (computador) com captura de eventos `keydown`.

### FR-06: Game Feel, Animações e Feedback
- **Digitação:** Célula ativa faz animação de "pop" (leve escala 1.1x com retorno suave) ao receber uma letra.
- **Palavra Inválida:** Se a palavra não existir no dicionário ou tiver menos de 5 letras, a linha vibra horizontalmente (*shake animation*) e uma notificação flutuante suave (*toast*) avisa o jogador.
- **Revelação:** Animação de giro vertical (*flip 3D*) célula por célula com atraso escalonado (150ms a 250ms entre cada letra).
- **Vitória:** Efeito cascata de pulo (*bounce*) nas letras da linha vitoriosa + disparo de confetes virtuais minimalistas.

### FR-07: Estatísticas do Jogador & Streaks
- Salvas localmente no navegador via `localStorage` (sem necessidade de conta).
- Métricas rastreadas:
  - Partidas Jogadas
  - Taxa de Vitórias (%)
  - Sequência Atual de Vitórias (*Current Streak*)
  - Melhor Sequência Histórica (*Max Streak*)
  - Histograma de Distribuição de Tentativas (1 a 6)
- Gráfico de barras visual com destaque para a tentativa da última partida.

### FR-08: Compartilhamento Social Sem Spoiler
- Botão "Compartilhar Resultado" copia texto formatado para a área de transferência:
  ```text
  Joguinho do Pedro — Diário #42
  Tentativas: 4/6

  ⬛⬛🟨⬛⬛
  ⬛🟩⬛⬛🟨
  🟩🟩🟩⬛⬛
  🟩🟩🟩🟩🟩
  ```
- No mobile, utiliza a Web Share API nativa (`navigator.share`) com fallback para copiar texto (`navigator.clipboard`).

### FR-09: Modal de Instruções (Como Jogar)
- Abrível a qualquer momento pelo ícone de interrogação `?` no cabeçalho.
- Exibição automática na primeira visita do usuário (detectada via flag no `localStorage`).
- Demonstração visual compacta com exemplos reais das 3 cores (Verde, Amarelo, Cinza).

---

## 5. Requisitos Não-Funcionais (NFR)

- **NFR-01 (Performance):** Tempo de primeiro carregamento (FCP) < 1.0s. Sem downloads pesados ou frameworks lentos.
- **NFR-02 (Offline-First / PWA):** Funciona mesmo sem conexão com internet após o primeiro acesso através de Service Worker simples e manifesto PWA.
- **NFR-03 (Responsividade Total):** Adaptação ergonômica perfeita de telas estreitas (320px como iPhone SE) até monitores 4K, mantendo a área do teclado sempre visível sem rolar a página verticalmente no mobile.
- **NFR-04 (Privacidade):** Nenhum dado pessoal é coletado. Todas as métricas residem no dispositivo do usuário.

---

## 6. Design System & Direção Estética

### 6.1 Paleta de Cores (Dark Mode Premium)
- **Fundo Principal (Background):** `#090D16` (Azul escuro profundo / ardósia)
- **Superfície dos Cards/Modais:** `#131B2E` com bordas sutis em `#1E293B`
- **Célula Vazia:** Fundo transparente com borda `#334155`
- **Célula Preenchida (antes do Enter):** Borda `#64748B`, texto branco `#F8FAFC`
- **Verde Correto:** `#10B981` (Esmeralda luminoso de alto contraste)
- **Amarelo Presente:** `#F59E0B` (Âmbar vibrante)
- **Cinza Incorreto:** `#334155` (Slate escuro neutro)
- **Teclado:** Fundo das teclas não testadas `#1E293B`, texto `#E2E8F0`

### 6.2 Tipografia
- Fonte primária: Família sans-serif moderna, legível e geométrica (ex: `Outfit`, `Inter` ou `Plus Jakarta Sans`).
- Letras da grade: Caixa alta (*uppercase*), peso `700` (Bold), tamanho proporcional ao viewport.

---

## 7. Estrutura de Dados e Vocabulário

### 7.1 Gestão de Dicionários
Para garantir justiça e evitar termos obscuros sem prejudicar a liberdade do jogador, o jogo adota duas listas de palavras:
1. **`TARGET_WORDS` (~2.000 a 3.000 palavras):** Substantivos, verbos e adjetivos comuns, conhecidos pelo falante médio de português, filtrados para evitar termos ofensivos ou pejorativos.
2. **`VALID_GUESSES` (~10.000 a 15.000 palavras):** Conjunto estendido de palavras válidas da língua portuguesa (incluindo conjugações e formas menos frequentes) que o jogador pode chutar sem receber o erro de "palavra inválida".

### 7.2 Esquema do `localStorage`
```typescript
interface GameState {
  mode: 'daily' | 'infinite';
  dailyDateString: string; // "2026-10-14"
  guesses: string[]; // ex: ["SAGAZ", "TERMO"]
  status: 'IN_PROGRESS' | 'WON' | 'LOST';
  stats: {
    played: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    distribution: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
  };
  hasSeenTutorial: boolean;
}
```

---

## 8. Próximos Passos Recomendados
1. Inicializar a arquitetura web (HTML5, CSS3 moderno com variáveis de tema e JavaScript modular).
2. Carregar e estruturar os dicionários de palavras PT-BR.
3. Desenvolver o motor de jogo (validação de palavras, regras de duplicadas, normalização de acentos).
4. Implementar a interface responsiva, teclado virtual e animações de flip 3D.
