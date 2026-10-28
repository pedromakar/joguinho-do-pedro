/**
 * JOGUINHO DE PALAVRAS — MOTOR COMPLETO
 * Termo (1), Dueto (2), Quarteto (4), Calendário de Acertos e Modo Replay
 */

(function () {
  'use strict';

  // ================= CONFIGURAÇÃO DOS FORMATOS =================
  const FORMAT_CONFIG = {
    termo: { name: 'TERMO', wordCount: 1, maxAttempts: 6, containerClass: 'board-area-termo' },
    dueto: { name: 'DUETO', wordCount: 2, maxAttempts: 7, containerClass: 'board-area-dueto' },
    quarteto: { name: 'QUARTETO', wordCount: 4, maxAttempts: 9, containerClass: 'board-area-quarteto' }
  };

  // ================= ESTADO GERAL DA APLICAÇÃO =================
  const TODAY_STR = '2026-10-14';
  
  const state = {
    theme: 'midnight',
    colorblind: false,
    soundEnabled: true,
    
    // Formato e Data Atuais
    gameFormat: 'termo', // 'termo' | 'dueto' | 'quarteto'
    currentDateStr: TODAY_STR,
    isRandomGame: false, // se true, é uma nova palavra aleatória
    
    // Estado da partida atual
    secretWords: [], // Array de palavras alvo (1, 2 ou 4)
    solvedBoards: [], // boolean[] para cada tabuleiro
    currentAttempt: 0,
    currentLetters: ['', '', '', '', ''],
    guessesHistory: [], // array de strings chutadas
    isGameOver: false,

    // Navegação do Calendário
    calYear: 2026,
    calMonth: 9 // Outubro (0-indexed: 9 = Outubro)
  };

  // ================= HISTÓRICO DO JOGADOR (LOCALSTORAGE) =================
  function getHistoryKey(dateStr, format) {
    return `wordgame_match_${dateStr}_${format}`;
  }

  function saveMatchResult(won, attempts) {
    const key = getHistoryKey(state.currentDateStr, state.gameFormat);
    const data = {
      won,
      attempts,
      words: state.secretWords,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(key, JSON.stringify(data));
      // Atualizar estatísticas gerais
      const stats = getPlayerStats();
      stats.played++;
      if (won) {
        stats.wins++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
        stats.distribution[attempts] = (stats.distribution[attempts] || 0) + 1;
      } else {
        stats.currentStreak = 0;
      }
      localStorage.setItem('wordgame_player_stats', JSON.stringify(stats));
    } catch (e) {}
  }

  function getSavedMatch(dateStr, format) {
    try {
      const raw = localStorage.getItem(getHistoryKey(dateStr, format));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getPlayerStats() {
    try {
      const raw = localStorage.getItem('wordgame_player_stats');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      played: 14,
      wins: 13,
      currentStreak: 6,
      maxStreak: 12,
      distribution: { 1: 0, 2: 3, 3: 5, 4: 4, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0 }
    };
  }

  // ================= ELEMENTOS DO DOM =================
  const body = document.body;
  const boardArea = document.getElementById('board-area');
  const toast = document.getElementById('toast');
  const modeText = document.getElementById('mode-text');
  const keyboardKeys = document.querySelectorAll('.key');

  // Botões de Formato (Termo / Dueto / Quarteto)
  const formatButtons = {
    termo: document.getElementById('btn-game-termo'),
    dueto: document.getElementById('btn-game-dueto'),
    quarteto: document.getElementById('btn-game-quarteto')
  };

  // Botões de Cabeçalho e Ação
  const btnCalendar = document.getElementById('btn-calendar');
  const btnHelp = document.getElementById('btn-help');
  const btnStats = document.getElementById('btn-stats');
  const btnSound = document.getElementById('btn-sound');
  const btnQuickNewGame = document.getElementById('btn-quick-new-game');
  const btnReplayNewWord = document.getElementById('btn-replay-new-word');
  const btnOpenCalFromStats = document.getElementById('btn-open-calendar-from-stats');
  const btnPlayToday = document.getElementById('btn-play-today');
  const btnShareResult = document.getElementById('btn-share-result');
  const btnSimulateWin = document.getElementById('btn-simulate-win');
  const btnRestartGame = document.getElementById('btn-restart-game');

  // Protótipos Visuais e Acessibilidade
  const protoButtons = document.querySelectorAll('.proto-btn');
  const btnColorblind = document.getElementById('btn-toggle-colorblind');
  const btnOpenPanel = document.getElementById('btn-open-panel');
  const protoNotes = document.getElementById('proto-notes');

  // Modais
  const modalCalendar = document.getElementById('modal-calendar');
  const modalStats = document.getElementById('modal-stats');
  const modalHelp = document.getElementById('modal-help');
  const modalPanel = document.getElementById('modal-panel');
  const modalCloseButtons = document.querySelectorAll('[data-close]');

  // Calendário elementos
  const calMonthName = document.getElementById('cal-month-name');
  const calDaysGrid = document.getElementById('cal-days-grid');
  const calPrevMonth = document.getElementById('cal-prev-month');
  const calNextMonth = document.getElementById('cal-next-month');

  // Canvas Confetes
  const confettiCanvas = document.getElementById('confetti-canvas');
  const ctx = confettiCanvas.getContext('2d');
  let confettiAnimationId = null;

  // ================= WEB AUDIO API (SFX SINTÉTICO) =================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.1) {
    if (!state.soundEnabled) return;
    try {
      const actx = getAudioContext();
      if (!actx) return;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, actx.currentTime);
      gain.gain.setValueAtTime(gainVal, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + duration);
    } catch (e) {}
  }

  function playKeySound() { playTone(360, 'sine', 0.04, 0.05); }
  function playPopSound() { playTone(520, 'triangle', 0.06, 0.07); }
  function playRevealSound(step) { playTone(280 + step * 70, 'sine', 0.1, 0.08); }
  function playErrorSound() { playTone(160, 'sawtooth', 0.16, 0.08); }
  function playWinSound() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'triangle', 0.22, 0.12), i * 100);
    });
  }

  // ================= TOAST NOTIFICATION =================
  let toastTimeout = null;
  function showToast(message, duration = 1800) {
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ================= INICIALIZAÇÃO DA PARTIDA =================
  function initGame(format = 'termo', isRandom = false, dateStr = TODAY_STR) {
    state.gameFormat = format;
    state.isRandomGame = isRandom;
    state.currentDateStr = dateStr;
    state.currentAttempt = 0;
    state.currentLetters = ['', '', '', '', ''];
    state.guessesHistory = [];
    state.isGameOver = false;

    const config = FORMAT_CONFIG[format];
    state.solvedBoards = new Array(config.wordCount).fill(false);

    // Gerar palavras alvo
    if (isRandom) {
      state.secretWords = window.WordService.getRandomWords(config.wordCount);
      modeText.textContent = `PRÁTICA • ${config.name}`;
      showToast(`Nova partida de ${config.name} iniciada!`);
    } else {
      state.secretWords = window.WordService.getDailyWords(dateStr, config.wordCount);
      const dayNumber = window.WordService.getDayIndex(dateStr);
      modeText.textContent = `${dateStr === TODAY_STR ? 'HOJE' : dateStr} • DIA #${dayNumber}`;
      showToast(`${config.name} do dia ${dateStr}`);
    }

    console.log(`[Palavras Alvo (${config.name})]:`, state.secretWords);

    // Atualizar botões de formato
    Object.keys(formatButtons).forEach(fmt => {
      formatButtons[fmt].classList.toggle('active', fmt === format);
    });

    renderBoardStructure();
    resetKeyboard();
  }

  // ================= RENDERIZAR TABULEIROS DINÂMICOS =================
  function renderBoardStructure() {
    const config = FORMAT_CONFIG[state.gameFormat];
    boardArea.className = config.containerClass;
    boardArea.innerHTML = '';

    for (let b = 0; b < config.wordCount; b++) {
      const boardGrid = document.createElement('div');
      boardGrid.className = 'board-grid';
      boardGrid.id = `board-grid-${b}`;
      boardGrid.setAttribute('role', 'grid');
      boardGrid.setAttribute('aria-label', `Tabuleiro ${b + 1} de ${config.name}`);

      for (let r = 0; r < config.maxAttempts; r++) {
        const row = document.createElement('div');
        row.className = r === 0 ? 'board-row current-row' : 'board-row';
        row.id = `board-${b}-row-${r}`;
        row.setAttribute('role', 'row');

        for (let c = 0; c < 5; c++) {
          const tile = document.createElement('div');
          tile.className = 'tile';
          tile.setAttribute('role', 'gridcell');
          tile.setAttribute('aria-label', `Linha ${r + 1}, letra ${c + 1}`);

          const letterSpan = document.createElement('span');
          letterSpan.className = 'letter';

          const symbolSpan = document.createElement('span');
          symbolSpan.className = 'symbol-tag';

          tile.appendChild(letterSpan);
          tile.appendChild(symbolSpan);
          row.appendChild(tile);
        }

        boardGrid.appendChild(row);
      }

      boardArea.appendChild(boardGrid);
    }
  }

  // ================= TECLADO VIRTUAL & STATUS =================
  function resetKeyboard() {
    keyboardKeys.forEach(key => {
      const isAction = key.classList.contains('key-action');
      key.className = isAction ? (key.getAttribute('data-key') === 'ENTER' ? 'key key-action key-enter' : 'key key-action key-backspace') : 'key';
      
      // Remover antigos multi-indicadores
      const oldInd = key.querySelector('.key-multi-indicator');
      if (oldInd) oldInd.remove();
    });
  }

  function updateKeyColor(letter, status, boardIndex) {
    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if (!key) return;

    if (state.gameFormat === 'termo') {
      if (key.classList.contains('key-correct')) return;
      if (status === 'correct') {
        key.className = 'key key-correct';
      } else if (status === 'present' && !key.classList.contains('key-correct')) {
        key.className = 'key key-present';
      } else if (status === 'absent' && !key.classList.contains('key-present')) {
        key.className = 'key key-absent';
      }
    } else {
      // Dueto ou Quarteto: mini indicador por tabuleiro
      let indBar = key.querySelector('.key-multi-indicator');
      if (!indBar) {
        indBar = document.createElement('div');
        indBar.className = 'key-multi-indicator';
        const total = FORMAT_CONFIG[state.gameFormat].wordCount;
        for (let i = 0; i < total; i++) {
          const dot = document.createElement('div');
          dot.className = 'key-dot';
          dot.id = `dot-${key.getAttribute('data-key')}-${i}`;
          indBar.appendChild(dot);
        }
        key.appendChild(indBar);
      }

      const targetDot = key.querySelector(`#dot-${key.getAttribute('data-key')}-${boardIndex}`);
      if (targetDot) {
        if (!targetDot.classList.contains('dot-correct')) {
          if (status === 'correct') targetDot.className = 'key-dot dot-correct';
          else if (status === 'present') targetDot.className = 'key-dot dot-present';
          else if (status === 'absent') targetDot.className = 'key-dot dot-absent';
        }
      }

      // Cor de fundo do botão no teclado reflete o status mais positivo
      if (status === 'correct') key.classList.add('key-correct');
      else if (status === 'present' && !key.classList.contains('key-correct')) key.classList.add('key-present');
      else if (status === 'absent' && !key.classList.contains('key-present') && !key.classList.contains('key-correct')) key.classList.add('key-absent');
    }
  }

  // ================= ENTRADA DE LETRAS & VALIDAÇÃO =================
  function handleInputLetter(letter) {
    if (state.isGameOver) return;
    const emptyIndex = state.currentLetters.indexOf('');
    if (emptyIndex !== -1) {
      state.currentLetters[emptyIndex] = letter;
      updateCurrentRowTiles();
      playPopSound();
    }
  }

  function handleBackspace() {
    if (state.isGameOver) return;
    for (let i = 4; i >= 0; i--) {
      if (state.currentLetters[i] !== '') {
        state.currentLetters[i] = '';
        updateCurrentRowTiles();
        playKeySound();
        break;
      }
    }
  }

  function updateCurrentRowTiles() {
    const config = FORMAT_CONFIG[state.gameFormat];
    for (let b = 0; b < config.wordCount; b++) {
      if (state.solvedBoards[b]) continue; // Não atualiza tabuleiros já concluídos
      const row = document.getElementById(`board-${b}-row-${state.currentAttempt}`);
      if (!row) continue;

      for (let c = 0; c < 5; c++) {
        const tile = row.children[c];
        const letter = state.currentLetters[c];
        tile.querySelector('.letter').textContent = letter;
        if (letter) tile.classList.add('active-filled');
        else tile.classList.remove('active-filled');
      }
    }
  }

  function handleEnter() {
    if (state.isGameOver) return;
    const config = FORMAT_CONFIG[state.gameFormat];

    // Verificar se tem 5 letras preenchidas
    if (state.currentLetters.includes('')) {
      playErrorSound();
      shakeCurrentRows();
      showToast('A palavra precisa ter 5 letras!');
      return;
    }

    const guess = state.currentLetters.join('');

    // Validação no dicionário PT-BR
    if (!window.WordService.isValidWord(guess)) {
      playErrorSound();
      shakeCurrentRows();
      showToast('Palavra não encontrada no dicionário!');
      return;
    }

    state.guessesHistory.push(guess);

    // Revelar linha com flip em cada tabuleiro ativo
    for (let b = 0; b < config.wordCount; b++) {
      if (state.solvedBoards[b]) continue;
      revealBoardRow(b, state.currentAttempt, guess, state.secretWords[b]);
    }

    // Avançar tentativa após animação
    setTimeout(() => {
      checkGameProgress(guess);
    }, 1400);
  }

  function shakeCurrentRows() {
    const config = FORMAT_CONFIG[state.gameFormat];
    for (let b = 0; b < config.wordCount; b++) {
      if (state.solvedBoards[b]) continue;
      const row = document.getElementById(`board-${b}-row-${state.currentAttempt}`);
      if (row) {
        row.classList.add('shake');
        setTimeout(() => row.classList.remove('shake'), 450);
      }
    }
  }

  // ================= ALGORITMO DE AVALIAÇÃO DE PALAVRAS (2-PASS) =================
  function evaluateWord(guess, target) {
    const result = new Array(5).fill('absent');
    const targetChars = target.split('');
    const guessChars = guess.split('');

    // 1ª Passada: Identificar correspondências exatas (Verde / Correct)
    for (let i = 0; i < 5; i++) {
      if (guessChars[i] === targetChars[i]) {
        result[i] = 'correct';
        targetChars[i] = null;
        guessChars[i] = null;
      }
    }

    // 2ª Passada: Identificar letras presentes fora de posição (Amarelo / Present)
    for (let i = 0; i < 5; i++) {
      if (guessChars[i] !== null) {
        const foundIndex = targetChars.indexOf(guessChars[i]);
        if (foundIndex !== -1) {
          result[i] = 'present';
          targetChars[foundIndex] = null;
        }
      }
    }

    return result;
  }

  function revealBoardRow(boardIndex, attemptIndex, guess, targetWord) {
    const row = document.getElementById(`board-${boardIndex}-row-${attemptIndex}`);
    if (!row) return;

    const evaluation = evaluateWord(guess, targetWord);
    const tiles = Array.from(row.children);
    tiles.forEach((tile, index) => {
      setTimeout(() => {
        tile.classList.add('flip-in');
        playRevealSound(index);

        setTimeout(() => {
          tile.classList.remove('flip-in');
          tile.classList.add('flip-out');

          const guessChar = guess[index];
          const status = evaluation[index];

          if (status === 'correct') {
            tile.className = 'tile status-correct';
            tile.querySelector('.symbol-tag').textContent = '✓';
            updateKeyColor(guessChar, 'correct', boardIndex);
          } else if (status === 'present') {
            tile.className = 'tile status-present';
            tile.querySelector('.symbol-tag').textContent = '↔';
            updateKeyColor(guessChar, 'present', boardIndex);
          } else {
            tile.className = 'tile status-absent';
            tile.querySelector('.symbol-tag').textContent = '✕';
            updateKeyColor(guessChar, 'absent', boardIndex);
          }

          setTimeout(() => tile.classList.remove('flip-out'), 250);
        }, 220);
      }, index * 180);
    });

    // Se acertou a palavra deste tabuleiro
    if (guess === targetWord) {
      state.solvedBoards[boardIndex] = true;
      setTimeout(() => {
        const boardGrid = document.getElementById(`board-grid-${boardIndex}`);
        if (boardGrid) boardGrid.classList.add('board-solved');
      }, 1100);
    }
  }

  function checkGameProgress(lastGuess) {
    const config = FORMAT_CONFIG[state.gameFormat];
    const allSolved = state.solvedBoards.every(s => s === true);

    if (allSolved) {
      triggerEndGame(true, state.currentAttempt + 1);
      return;
    }

    state.currentAttempt++;
    state.currentLetters = ['', '', '', '', ''];

    // Se atingiu o limite de tentativas
    if (state.currentAttempt >= config.maxAttempts) {
      triggerEndGame(false, state.currentAttempt);
      return;
    }

    // Ativar próxima linha nos tabuleiros não resolvidos
    for (let b = 0; b < config.wordCount; b++) {
      if (state.solvedBoards[b]) continue;
      const nextRow = document.getElementById(`board-${b}-row-${state.currentAttempt}`);
      if (nextRow) nextRow.classList.add('current-row');
    }
  }

  // ================= FIM DE JOGO & REPLAY =================
  function triggerEndGame(won, attempts) {
    state.isGameOver = true;
    saveMatchResult(won, attempts);

    if (won) {
      playWinSound();
      startConfetti();
      showToast(`🎉 Parabéns! Você venceu o ${FORMAT_CONFIG[state.gameFormat].name} em ${attempts} tentativas!`, 3000);
    } else {
      playErrorSound();
      showToast(`Fim de jogo! As palavras eram: ${state.secretWords.join(', ')}`, 3500);
    }

    setTimeout(() => {
      updateStatsModal(won, attempts);
      openModal(modalStats);
    }, 1500);
  }

  function updateStatsModal(won, attempts) {
    const stats = getPlayerStats();
    document.getElementById('stat-played').textContent = stats.played;
    const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
    document.getElementById('stat-winrate').textContent = `${winRate}%`;
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-maxstreak').textContent = stats.maxStreak;

    // Atualizar preview de emojis
    const shareTitle = document.getElementById('share-title');
    shareTitle.textContent = `Joguinho do Pedro — ${FORMAT_CONFIG[state.gameFormat].name} (${won ? attempts : 'X'}/${FORMAT_CONFIG[state.gameFormat].maxAttempts})`;

    const shareEmojis = document.getElementById('share-emojis');
    shareEmojis.innerHTML = state.guessesHistory.map(g => {
      return g.split('').map((char, i) => {
        if (state.secretWords.some(w => w[i] === char)) return '🟩';
        if (state.secretWords.some(w => w.includes(char))) return '🟨';
        return '⬛';
      }).join('');
    }).join('<br>');
  }

  // ================= CALENDÁRIO INTERATIVO =================
  function renderCalendar(year, month) {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    calMonthName.textContent = `${monthNames[month]} ${year}`;
    calDaysGrid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Espaços em branco antes do 1º dia
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell future-day';
      calDaysGrid.appendChild(emptyCell);
    }

    // Dias do mês
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-day-cell';
      cell.dataset.date = dateStr;

      const dayNum = document.createElement('span');
      dayNum.className = 'cal-day-num';
      dayNum.textContent = day;
      cell.appendChild(dayNum);

      const isToday = dateStr === TODAY_STR;
      const isFuture = dateStr > TODAY_STR;
      const saved = getSavedMatch(dateStr, state.gameFormat);

      if (isToday) cell.classList.add('today-day');

      if (isFuture) {
        cell.classList.add('future-day');
      } else if (saved) {
        if (saved.won) {
          cell.classList.add('won-day');
          const badge = document.createElement('span');
          badge.className = 'cal-score-badge';
          badge.textContent = `${saved.attempts}`;
          cell.appendChild(badge);
        } else {
          cell.classList.add('lost-day');
          const badge = document.createElement('span');
          badge.className = 'cal-score-badge';
          badge.textContent = '✕';
          cell.appendChild(badge);
        }
      } else {
        cell.classList.add('unplayed-day');
        const badge = document.createElement('span');
        badge.className = 'cal-score-badge';
        badge.textContent = '▶';
        cell.appendChild(badge);
      }

      // Ao clicar em um dia jogável
      if (!isFuture) {
        cell.addEventListener('click', () => {
          closeModal(modalCalendar);
          initGame(state.gameFormat, false, dateStr);
        });
      }

      calDaysGrid.appendChild(cell);
    }
  }

  calPrevMonth.addEventListener('click', () => {
    state.calMonth--;
    if (state.calMonth < 0) {
      state.calMonth = 11;
      state.calYear--;
    }
    renderCalendar(state.calYear, state.calMonth);
  });

  calNextMonth.addEventListener('click', () => {
    state.calMonth++;
    if (state.calMonth > 11) {
      state.calMonth = 0;
      state.calYear++;
    }
    renderCalendar(state.calYear, state.calMonth);
  });

  btnCalendar.addEventListener('click', () => {
    renderCalendar(state.calYear, state.calMonth);
    openModal(modalCalendar);
  });

  btnPlayToday.addEventListener('click', () => {
    closeModal(modalCalendar);
    initGame(state.gameFormat, false, TODAY_STR);
  });

  btnOpenCalFromStats.addEventListener('click', () => {
    closeModal(modalStats);
    renderCalendar(state.calYear, state.calMonth);
    openModal(modalCalendar);
  });

  // ================= BOTÕES DE FORMATO (TERMO / DUETO / QUARTETO) =================
  Object.keys(formatButtons).forEach(fmt => {
    formatButtons[fmt].addEventListener('click', () => {
      initGame(fmt, state.isRandomGame, state.currentDateStr);
    });
  });

  // ================= REPLAY: JOGAR DE NOVO COM OUTRA PALAVRA =================
  btnQuickNewGame.addEventListener('click', () => {
    initGame(state.gameFormat, true);
  });

  btnReplayNewWord.addEventListener('click', () => {
    closeModal(modalStats);
    initGame(state.gameFormat, true);
  });

  btnRestartGame.addEventListener('click', () => {
    initGame(state.gameFormat, state.isRandomGame, state.currentDateStr);
  });

  // Simular vitória rápida para demonstração
  btnSimulateWin.addEventListener('click', () => {
    const config = FORMAT_CONFIG[state.gameFormat];
    for (let b = 0; b < config.wordCount; b++) {
      state.solvedBoards[b] = true;
      revealBoardRow(b, state.currentAttempt, state.secretWords[b], state.secretWords[b]);
    }
    state.guessesHistory.push(state.secretWords[0]);
    setTimeout(() => {
      triggerEndGame(true, state.currentAttempt + 1);
    }, 800);
  });

  // ================= COMPARTILHAMENTO SEM SPOILER =================
  btnShareResult.addEventListener('click', async () => {
    const config = FORMAT_CONFIG[state.gameFormat];
    const headerLine = `Joguinho do Pedro — ${config.name} (${state.isGameOver ? state.currentAttempt : '3'}/${config.maxAttempts})\n`;
    const emojis = state.guessesHistory.map(g => {
      return g.split('').map((char, i) => {
        if (state.secretWords.some(w => w[i] === char)) return '🟩';
        if (state.secretWords.some(w => w.includes(char))) return '🟨';
        return '⬛';
      }).join('');
    }).join('\n');

    const shareText = `${headerLine}\n${emojis}\n\nJogue em: ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Resultado no Joguinho', text: shareText });
        showToast('Resultado compartilhado!');
        return;
      } catch (e) {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      showToast('Resultado copiado com emojis! 📋');
    } catch (e) {
      showToast('Copiado para o clipboard!');
    }
  });

  // ================= TECLADO FÍSICO & VIRTUAL =================
  keyboardKeys.forEach(key => {
    key.addEventListener('click', () => {
      const val = key.getAttribute('data-key');
      if (val === 'ENTER') handleEnter();
      else if (val === 'BACKSPACE') handleBackspace();
      else handleInputLetter(val);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const key = e.key.toUpperCase();

    if (key === 'ENTER') {
      handleEnter();
    } else if (key === 'BACKSPACE') {
      handleBackspace();
    } else if (/^[A-ZÇ]$/.test(key)) {
      const normalizedKey = key === 'Ç' ? 'C' : key;
      handleInputLetter(normalizedKey);
    }
  });

  // ================= GERENCIAMENTO DE PROTÓTIPOS VISUAIS =================
  const PROTO_CONFIGS = {
    midnight: {
      name: 'Midnight Emerald',
      notes: 'Protótipo 01: <strong>Midnight Emerald</strong> — Dark luxury com glassmorphism, tons ardósia e verde esmeralda luminosa.'
    },
    neon: {
      name: 'Neon High-Contrast',
      notes: 'Protótipo 02: <strong>Neon High-Contrast</strong> — Fundo OLED puro, ciano e ouro vibrantes com badges táteis de acessibilidade extrema.'
    },
    editorial: {
      name: 'Neo-Editorial',
      notes: 'Protótipo 03: <strong>Neo-Editorial</strong> — Tipografia nobre inspirada em quebra-cabeças literários com papel escuro e tons mostarda.'
    }
  };

  function setPrototype(protoKey) {
    state.theme = protoKey;
    body.setAttribute('data-theme', protoKey);

    protoButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-proto') === protoKey;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    protoNotes.innerHTML = PROTO_CONFIGS[protoKey].notes;
    showToast(`Protótipo alterado para: ${PROTO_CONFIGS[protoKey].name}`);
    playPopSound();
  }

  protoButtons.forEach(btn => {
    btn.addEventListener('click', () => setPrototype(btn.getAttribute('data-proto')));
  });

  // ================= MODO DALTÔNICO =================
  btnColorblind.addEventListener('click', () => {
    state.colorblind = !state.colorblind;
    body.setAttribute('data-colorblind', state.colorblind ? 'true' : 'false');
    btnColorblind.classList.toggle('active-a11y', state.colorblind);
    btnColorblind.setAttribute('aria-pressed', state.colorblind ? 'true' : 'false');
    showToast(state.colorblind ? 'Símbolos ativados (✓, ↔, ✕)' : 'Símbolos desativados');
    playPopSound();
  });

  // ================= SOM =================
  btnSound.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    btnSound.setAttribute('aria-pressed', state.soundEnabled ? 'true' : 'false');
    btnSound.style.opacity = state.soundEnabled ? '1' : '0.4';
    showToast(state.soundEnabled ? 'Som ativado' : 'Som desativado');
  });

  // ================= MODAIS =================
  function openModal(modalEl) {
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
  }

  btnOpenPanel.addEventListener('click', () => openModal(modalPanel));
  btnHelp.addEventListener('click', () => openModal(modalHelp));
  btnStats.addEventListener('click', () => {
    updateStatsModal(false, 0);
    openModal(modalStats);
  });

  modalCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const targetModal = document.getElementById(modalId);
      if (targetModal) closeModal(targetModal);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) closeModal(e.target);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') [modalPanel, modalStats, modalHelp, modalCalendar].forEach(closeModal);
  });

  // ================= CONFETES =================
  let confettiParticles = [];
  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function startConfetti() {
    confettiParticles = [];
    const colors = ['#10b981', '#f59e0b', '#00f0ff', '#ffffff', '#ffd600', '#ec4899'];
    for (let i = 0; i < 110; i++) {
      confettiParticles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
        y: window.innerHeight / 2 - 80,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    animateConfetti();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rotation += p.vRot;
      p.opacity -= 0.007;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });

    if (alive) confettiAnimationId = requestAnimationFrame(animateConfetti);
    else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  if (typeof window !== 'undefined') {
    window.WordEvaluator = { evaluateWord, FORMAT_CONFIG };
  }

  // Iniciar jogo com Termo do dia de hoje
  initGame('termo', false, TODAY_STR);
})();
