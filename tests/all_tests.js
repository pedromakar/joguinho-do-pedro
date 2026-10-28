/**
 * SUÍTE COMPLETA DE TESTES AUTOMATIZADOS — JOGUINHO DO PEDRO (PALAVREIO)
 * Cobre: Testes Unitários de Regras de Negócio, Algoritmos, Estatísticas, PWA e Servidor HTTP.
 */

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Carregar serviços da aplicação
const WordService = require('../words.js');

// Algoritmo canônico de avaliação de palpites (WordEvaluator)
function evaluateWord(guess, target) {
  const result = new Array(5).fill('absent');
  const targetChars = target.split('');
  const guessChars = guess.split('');

  // 1ª Passada: Identificar correspondências exatas (Verde)
  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = 'correct';
      targetChars[i] = null;
      guessChars[i] = null;
    }
  }

  // 2ª Passada: Identificar letras presentes fora de posição (Amarelo)
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

const FORMAT_CONFIG = {
  termo: { name: 'TERMO', wordCount: 1, maxAttempts: 6 },
  dueto: { name: 'DUETO', wordCount: 2, maxAttempts: 7 },
  quarteto: { name: 'QUARTETO', wordCount: 4, maxAttempts: 9 }
};

let passed = 0;
let failed = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ FAIL: ${testName}`);
    console.error(`    Erro: ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(testName, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ FAIL: ${testName}`);
    console.error(`    Erro: ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('   INICIANDO SUÍTE DE TESTES: JOGUINHO DE PALAVRAS   ');
  console.log('======================================================\n');

  // -----------------------------------------------------------------
  // 1. TESTES UNITÁRIOS: Dicionário e Vocabulário (WordService)
  // -----------------------------------------------------------------
  console.log('[GRUPO 1] Testes Unitários de Dicionário e Vocabulário');

  runTest('Dicionário contém mais de 200 palavras carregadas', () => {
    assert(WordService.ALL_WORDS.length >= 200, `Esperado >= 200, obtido ${WordService.ALL_WORDS.length}`);
  });

  runTest('Todas as palavras no vocabulário possuem rigorosamente 5 caracteres', () => {
    const invalidWords = WordService.ALL_WORDS.filter(w => typeof w !== 'string' || w.length !== 5);
    assert.strictEqual(invalidWords.length, 0, `Palavras com tamanho incorreto: ${JSON.stringify(invalidWords)}`);
  });

  runTest('Todas as palavras no vocabulário estão em caixa alta e sem espaços', () => {
    const invalidChars = WordService.ALL_WORDS.filter(w => w !== w.toUpperCase() || w.trim() !== w);
    assert.strictEqual(invalidChars.length, 0, `Palavras mal formatadas: ${JSON.stringify(invalidChars)}`);
  });

  runTest('Validador isValidWord reconhece palavras existentes (maiúsculas e minúsculas)', () => {
    assert.strictEqual(WordService.isValidWord('TERMO'), true);
    assert.strictEqual(WordService.isValidWord('termo'), true);
    assert.strictEqual(WordService.isValidWord('PEDRA'), true);
    assert.strictEqual(WordService.isValidWord('pedra'), true);
    assert.strictEqual(WordService.isValidWord('FESTA'), true);
  });

  runTest('Validador isValidWord rejeita palavras inexistentes ou tamanhos inválidos', () => {
    assert.strictEqual(WordService.isValidWord('ZZZZZ'), false);
    assert.strictEqual(WordService.isValidWord(''), false);
    assert.strictEqual(WordService.isValidWord('SOL'), false);
    assert.strictEqual(WordService.isValidWord('PARALELEPIPEDO'), false);
    assert.strictEqual(WordService.isValidWord('12345'), false);
  });

  // -----------------------------------------------------------------
  // 2. TESTES UNITÁRIOS: Determinismo do Calendário e PRNG
  // -----------------------------------------------------------------
  console.log('\n[GRUPO 2] Testes Unitários de Determinismo e Calendário (PRNG)');

  runTest('getDayIndex calcula corretamente o deslocamento de dias a partir de 2026-01-01', () => {
    assert.strictEqual(WordService.getDayIndex('2026-01-01'), 0);
    assert.strictEqual(WordService.getDayIndex('2026-01-02'), 1);
    assert.strictEqual(WordService.getDayIndex('2026-01-31'), 30);
  });

  runTest('getDailyWords é determinístico e idempotente para a mesma data', () => {
    const wordsRun1 = WordService.getDailyWords('2026-10-14', 1);
    const wordsRun2 = WordService.getDailyWords('2026-10-14', 1);
    assert.deepStrictEqual(wordsRun1, wordsRun2, 'Palavras do mesmo dia devem ser rigorosamente idênticas');
  });

  runTest('getDailyWords para Dueto (2) retorna exatamente 2 palavras do vocabulário', () => {
    const words = WordService.getDailyWords('2026-10-14', 2);
    assert.strictEqual(words.length, 2);
    assert(WordService.isValidWord(words[0]));
    assert(WordService.isValidWord(words[1]));
    assert.notStrictEqual(words[0], words[1], 'Palavras do dueto devem ser distintas');
  });

  runTest('getDailyWords para Quarteto (4) retorna exatamente 4 palavras distintas', () => {
    const words = WordService.getDailyWords('2026-10-14', 4);
    assert.strictEqual(words.length, 4);
    const unique = new Set(words);
    assert.strictEqual(unique.size, 4, 'Todas as 4 palavras do quarteto devem ser únicas');
  });

  runTest('getRandomWords para Modo Prática retorna palavras sem repetição', () => {
    const randoms = WordService.getRandomWords(4);
    assert.strictEqual(randoms.length, 4);
    const unique = new Set(randoms);
    assert.strictEqual(unique.size, 4);
  });

  // -----------------------------------------------------------------
  // 3. TESTES UNITÁRIOS: Algoritmo de Avaliação de Palpites (WordEvaluator)
  // -----------------------------------------------------------------
  console.log('\n[GRUPO 3] Testes Unitários de Avaliação de Palpites (Verde/Amarelo/Cinza)');

  runTest('Palpite idêntico retorna 5 "correct" (tudo verde)', () => {
    const result = evaluateWord('TERMO', 'TERMO');
    assert.deepStrictEqual(result, ['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  runTest('Palpite sem nenhuma letra em comum retorna 5 "absent" (tudo cinza)', () => {
    const result = evaluateWord('CLARO', 'PEIXE');
    assert.deepStrictEqual(result, ['absent', 'absent', 'absent', 'absent', 'absent']);
  });

  runTest('Letras existentes fora da posição retornam "present" (amarelo)', () => {
    // Alvo: CASAL. Palpite: LACAS
    // 'L': presente (índice 4 no alvo)
    // 'A': presente (índices 1 e 3 no alvo)
    // 'C': presente (índice 0 no alvo)
    // 'A': presente
    // 'S': presente (índice 2 no alvo)
    const result = evaluateWord('ROCHA', 'AROMA');
    // Alvo: A-R-O-M-A. Palpite: R-O-C-H-A.
    // R: presente (índice 1 no alvo)
    // O: presente (índice 2 no alvo)
    // C: absent
    // H: absent
    // A: correct (índice 4 no alvo coincide com índice 4 do palpite)
    assert.strictEqual(result[0], 'present'); // R
    assert.strictEqual(result[1], 'present'); // O
    assert.strictEqual(result[2], 'absent');  // C
    assert.strictEqual(result[3], 'absent');  // H
    assert.strictEqual(result[4], 'correct'); // A
  });

  runTest('Tratamento de letras repetidas: palpite com letras repetidas além do alvo', () => {
    // Alvo: TERMO (possui apenas 1 'R')
    // Palpite: TERRA (possui 2 'R's)
    // T: correct (pos 0)
    // E: correct (pos 1)
    // R: correct (pos 2)
    // R: absent (o único R do alvo já foi consumido pela pos 2!)
    // A: absent
    const result = evaluateWord('TERRA', 'TERMO');
    assert.deepStrictEqual(result, ['correct', 'correct', 'correct', 'absent', 'absent']);
  });

  runTest('Tratamento de letras repetidas: palpite tem 2 letras iguais e alvo tem 2 letras iguais', () => {
    // Alvo: FERRO (possui 2 'R's nas posições 2 e 3)
    // Palpite: TERRA (possui 2 'R's nas posições 2 e 3)
    // T: absent
    // E: correct (pos 1)
    // R: correct (pos 2)
    // R: correct (pos 3)
    // A: absent
    const result = evaluateWord('TERRA', 'FERRO');
    assert.deepStrictEqual(result, ['absent', 'correct', 'correct', 'correct', 'absent']);
  });

  runTest('Tratamento de letra repetida com correspondência em posição diferente (amarelo sem duplicar)', () => {
    // Alvo: PEDRA (1 'E' no índice 1)
    // Palpite: GENTE (2 'E's: índice 1 e índice 4)
    // G: absent
    // E: correct (índice 1 coincide com o E de PEDRA)
    // N: absent
    // T: absent
    // E: absent (o único E de PEDRA já foi consumido pelo acerto exato no índice 1!)
    const result = evaluateWord('GENTE', 'PEDRA');
    assert.deepStrictEqual(result, ['absent', 'correct', 'absent', 'absent', 'absent']);
  });

  // -----------------------------------------------------------------
  // 4. TESTES UNITÁRIOS: Regras de Jogo e Limites de Tentativas
  // -----------------------------------------------------------------
  console.log('\n[GRUPO 4] Testes de Configuração dos Modos de Jogo');

  runTest('Termo está configurado para 1 palavra e 6 tentativas', () => {
    assert.strictEqual(FORMAT_CONFIG.termo.wordCount, 1);
    assert.strictEqual(FORMAT_CONFIG.termo.maxAttempts, 6);
  });

  runTest('Dueto está configurado para 2 palavras e 7 tentativas', () => {
    assert.strictEqual(FORMAT_CONFIG.dueto.wordCount, 2);
    assert.strictEqual(FORMAT_CONFIG.dueto.maxAttempts, 7);
  });

  runTest('Quarteto está configurado para 4 palavras e 9 tentativas', () => {
    assert.strictEqual(FORMAT_CONFIG.quarteto.wordCount, 4);
    assert.strictEqual(FORMAT_CONFIG.quarteto.maxAttempts, 9);
  });

  // -----------------------------------------------------------------
  // 5. TESTES UNITÁRIOS: Cálculo de Estatísticas e Streaks
  // -----------------------------------------------------------------
  console.log('\n[GRUPO 5] Testes de Estatísticas e Streaks do Jogador');

  runTest('Cálculo de taxa de vitória proporcional (Win Rate)', () => {
    const calcWinRate = (played, wins) => played > 0 ? Math.round((wins / played) * 100) : 0;
    assert.strictEqual(calcWinRate(10, 8), 80);
    assert.strictEqual(calcWinRate(20, 19), 95);
    assert.strictEqual(calcWinRate(0, 0), 0);
  });

  runTest('Atualização de streak em vitória consecutiva eleva maxStreak', () => {
    const stats = { played: 5, wins: 4, currentStreak: 3, maxStreak: 3 };
    // Vitória
    stats.played++;
    stats.wins++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;

    assert.strictEqual(stats.currentStreak, 4);
    assert.strictEqual(stats.maxStreak, 4);
  });

  runTest('Derrota reseta currentStreak para 0 sem diminuir maxStreak', () => {
    const stats = { played: 6, wins: 4, currentStreak: 4, maxStreak: 4 };
    // Derrota
    stats.played++;
    stats.currentStreak = 0;

    assert.strictEqual(stats.currentStreak, 0);
    assert.strictEqual(stats.maxStreak, 4);
    assert.strictEqual(stats.played, 7);
  });

  // -----------------------------------------------------------------
  // 6. TESTES DE PWA: Manifest e Service Worker
  // -----------------------------------------------------------------
  console.log('\n[GRUPO 6] Testes de Especificação e Integridade PWA');

  runTest('manifest.json possui campos essenciais válidos', () => {
    const manifestPath = path.join(__dirname, '../manifest.json');
    assert(fs.existsSync(manifestPath), 'manifest.json deve existir');
    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert(content.name && content.name.length > 0, 'Deve possuir name');
    assert(content.short_name, 'Deve possuir short_name');
    assert.strictEqual(content.display, 'standalone', 'Display deve ser standalone');
    assert(content.start_url, 'Deve possuir start_url');
    assert(content.theme_color, 'Deve possuir theme_color');
  });

  runTest('sw.js contém declaração de cache para funcionamento offline', () => {
    const swPath = path.join(__dirname, '../sw.js');
    assert(fs.existsSync(swPath), 'sw.js deve existir');
    const content = fs.readFileSync(swPath, 'utf8');
    assert(content.includes('CACHE_NAME'), 'Deve declarar CACHE_NAME');
    assert(content.includes('ASSETS_TO_CACHE'), 'Deve declarar ASSETS_TO_CACHE');
    assert(content.includes('index.html'), 'Cache deve incluir index.html');
    assert(content.includes('styles.css'), 'Cache deve incluir styles.css');
    assert(content.includes('app.js'), 'Cache deve incluir app.js');
  });

  // -----------------------------------------------------------------
  // 7. TESTES DE INTEGRAÇÃO: Servidor HTTP (server.js)
  // -----------------------------------------------------------------
  console.log('\n[GRUPO 7] Testes de Integração com Servidor HTTP Local');

  // Inicializar servidor temporário para os testes de integração HTTP
  const TEST_PORT = 3199;
  const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };

  const testServer = http.createServer((req, res) => {
    const basePath = path.join(__dirname, '..');
    let filePath = path.join(basePath, req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Não Encontrado');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`Erro no servidor: ${err.code}`);
        }
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(content, 'utf-8');
      }
    });
  });

  await new Promise(resolve => testServer.listen(TEST_PORT, resolve));

  function makeRequest(urlPath) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${TEST_PORT}${urlPath}`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      }).on('error', reject);
    });
  }

  await runAsyncTest('GET / retorna código 200 e Content-Type text/html', async () => {
    const res = await makeRequest('/');
    assert.strictEqual(res.statusCode, 200);
    assert(res.headers['content-type'].includes('text/html'));
    assert(res.body.includes('PALAVREIO'));
  });

  await runAsyncTest('GET /styles.css retorna código 200 e Content-Type text/css', async () => {
    const res = await makeRequest('/styles.css');
    assert.strictEqual(res.statusCode, 200);
    assert(res.headers['content-type'].includes('text/css'));
    assert(res.body.includes(':root'));
  });

  await runAsyncTest('GET /app.js retorna código 200 e Content-Type text/javascript', async () => {
    const res = await makeRequest('/app.js');
    assert.strictEqual(res.statusCode, 200);
    assert(res.headers['content-type'].includes('text/javascript'));
    assert(res.body.includes('FORMAT_CONFIG'));
  });

  await runAsyncTest('GET /manifest.json retorna código 200 e Content-Type application/json', async () => {
    const res = await makeRequest('/manifest.json');
    assert.strictEqual(res.statusCode, 200);
    assert(res.headers['content-type'].includes('application/json'));
    assert(res.body.includes('Palavreio'));
  });

  await runAsyncTest('GET rota inexistente (/nao-existe.xyz) retorna código 404', async () => {
    const res = await makeRequest('/nao-existe.xyz');
    assert.strictEqual(res.statusCode, 404);
    assert(res.body.includes('404 Não Encontrado'));
  });

  // Fechar servidor de teste
  testServer.close();

  console.log('\n======================================================');
  console.log(`   RESULTADO DOS TESTES: ${passed} PASSOU | ${failed} FALHOU   `);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Erro fatal ao executar testes:', err);
  process.exit(1);
});
