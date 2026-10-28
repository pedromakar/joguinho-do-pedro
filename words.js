/**
 * DICIONÁRIO DE PALAVRAS PT-BR CURADAS E GERADOR DE DIAS
 */

const WORDS_DATABASE = [
  "TERMO", "PEDRA", "SAGAZ", "NOBRE", "AMIGO", "TEMPO", "LINDA", "MUNDO", "VIVER", "CORPO",
  "BRAVO", "FORTE", "CLARO", "FESTA", "PLENA", "SONHO", "GRUPO", "LIVRO", "CHAVE", "COISA",
  "PODER", "JUSTO", "CASAL", "VISAO", "AUREA", "IDEIA", "MORAL", "HONRA", "SENSO", "ANEXO",
  "FUTIL", "RAZAO", "ETICA", "AFETO", "ICONE", "SOBRE", "CASAS", "PLANO", "FOLHA", "NAVIO",
  "PRAIA", "VERDE", "LETRA", "CANTO", "PORTA", "NORTE", "FRUTA", "MENTE", "CARRO", "CAMPO",
  "FLORA", "TRENO", "FAROL", "NUVEM", "POETA", "CHUVA", "FROTA", "TERRA", "GENTE", "CANTE",
  "BRISA", "PRADO", "FERRO", "HOTEL", "CALOR", "SORTE", "VENTO", "AREIA", "PEIXE", "BARCO",
  "DANCA", "CIRCO", "CINZA", "PIANO", "BOMBA", "TINTA", "FOGOS", "MAGIA", "OUROS", "PRATA",
  "CANTO", "TARDE", "NOITE", "MANHA", "ROCHA", "MONTE", "SELVA", "MARCA", "PONTO", "TURMA",
  "VIOLA", "CORDA", "FIBRA", "MUSEU", "SALTO", "RITMO", "AROMA", "SABOR", "GRAOS", "VINHO",
  "CAFES", "PAPEL", "MESAS", "DISCO", "RADIO", "PORTA", "PONTE", "POEMA", "VELOZ", "FALHA",
  "CERTO", "GRATO", "DOCES", "PASSO", "RISCO", "TRACO", "FOCAL", "LUNAR", "SOLAR", "ASTRO",
  "MAPAS", "LOCAL", "ROTAS", "VIAJA", "LESTE", "OESTE", "FAVOR", "AJUDA", "GRACA", "PEITO",
  "FALAS", "RISOS", "OLHAR", "CENAS", "AUTOR", "BAILE", "BANHO", "BEIJO", "BEBER", "BICHO",
  "BLOCO", "BOCAS", "BOLAS", "BONDE", "BORDA", "BOTAR", "BRACO", "BREVE", "BRUTO", "CABOS"
].map(w => w.toUpperCase().trim()).filter(w => w.length === 5);

// Lista estendida de palavras de 5 letras
const EXTENDED_WORDS = [
  "ABRIL", "ACASO", "ACOES", "ADAGA", "ADEUS", "AGUDO", "AJUDA", "ALBUM", "ALMAS", "ALTAR",
  "ALTOS", "ALUNO", "AMADO", "AMBAS", "AMPLO", "ANDAR", "ANIMA", "ANJOS", "ANUAL", "APELO",
  "APOIO", "APTOS", "AREAS", "ARMAS", "ARTES", "ASILO", "ATLAS", "ATUAL", "AUDIT", "AUTOS",
  "AVISO", "AZUIS", "BACIA", "BALAO", "BALAS", "BANCO", "BANDO", "BARAO", "BARRA", "BASES",
  "BEIJO", "BELAS", "BENTO", "BICHO", "BLOCO", "BOATO", "BOLSA", "BONDE", "BORDA", "BOTAS",
  "BRACO", "BRUTO", "BUCAL", "CABOS", "CACAU", "CALMO", "CANAL", "CAPAZ", "CARGA", "CARNE",
  "CARTA", "CASTO", "CATAR", "CAUSA", "CEDRO", "CEGOS", "CENAS", "CERTA", "CHAPA", "CHATO",
  "CHAVE", "CHEFE", "CHORO", "CLUBE", "COBRA", "COFRE", "COLAS", "CONTO", "COPAS", "CORES",
  "CORPO", "CORTE", "COTAS", "COURO", "CRAVO", "CREDO", "CRIAR", "CRIME", "CRISE", "CRUEL",
  "CULPA", "CURTO", "CUSTO", "DADOS", "DANOS", "DATAS", "DEDOS", "DENSO", "DENTE", "DITAR",
  "DITOS", "DIVAS", "DOBRA", "DOCES", "DORES", "DRAMA", "DUETO", "DUPLA", "DUROS", "ELITE",
  "EMAIL", "ENVIO", "EPICO", "ERROS", "ESCAL", "ESPIR", "EXAME", "EXITO", "EXTRA", "FACIL",
  "FAIXA", "FATOS", "FAUNA", "FEITO", "FELIZ", "FERAS", "FESTA", "FIBRA", "FIEL", "FILHO",
  "FILME", "FINAL", "FINOS", "FLORA", "FOCAL", "FOFOS", "FOLGA", "FONTE", "FORMA", "FORNO",
  "FOTOS", "FRACO", "FRUTA", "FUNDO", "FURAO", "GATOS", "GELOS", "GOLPE", "GOSTO", "GRAVE",
  "GRUPO", "GUIA", "HABIL", "HIFEN", "HORTA", "HUMOR", "IDEAL", "IGUAL", "ILHAS", "IMPAR",
  "INDIO", "IRMAO", "JOGOS", "JOIAS", "JOVEM", "JUIZO", "JULHO", "JUNHO", "JUNTO", "JUSTO",
  "LABIO", "LACOS", "LANCE", "LARGO", "LASER", "LATAS", "LAUDO", "LEGAL", "LEITE", "LENTO",
  "LIDAR", "LIDER", "LIMPO", "LINDA", "LINHA", "LIVRE", "LIVRO", "LOCAL", "LOUCO", "LUGAR",
  "LUZES", "MACHO", "MAGIA", "MAIOR", "MALA", "MANGA", "MANTO", "MARCO", "MASSA", "MATAR",
  "MATAS", "MEDIR", "MEDOS", "MEIAS", "MELAO", "MENOR", "MENOS", "METRO", "MINHA", "MIOLO",
  "MODAL", "MODEL", "MODOS", "MOLDE", "MORAL", "MORRO", "MUDAR", "MURAL", "MUTUO", "NAVIO",
  "NEGAR", "NEGRO", "NINHO", "NIVEL", "NOBRE", "NOITE", "NORTE", "NOTAS", "NOVEL", "NUVEM",
  "OBRAS", "OLHOS", "ONDAS", "OPCAO", "ORDEM", "ORGIA", "ORGAO", "OSSOS", "OUTRO", "OUVIR",
  "PACTO", "PADRE", "PAGAR", "PAINE", "PALCO", "PAPEL", "PARAR", "PARDO", "PARTE", "PASSO",
  "PASTA", "PATIO", "PAUSA", "PAVIO", "PEIXE", "PELOS", "PENAS", "PERDA", "PERTO", "PESCA",
  "PIANO", "PILHA", "PINGO", "PINTA", "PISTA", "PLACA", "PLANO", "PLENA", "POEMA", "POETA",
  "PONTO", "PORCO", "PORTA", "PORTO", "POSTO", "PRAIA", "PRATA", "PRATO", "PRECO", "PRESO",
  "PRIMA", "PRIME", "PROVA", "PUDOR", "PULSO", "PONTO", "QUASE", "QUEDA", "QUERO", "QUILO",
  "RAIVA", "RAMOS", "RAZAO", "REGRA", "REINO", "RENDA", "RESTA", "RETO", "RITMO", "ROCHA",
  "ROSTO", "ROUPA", "RUBRO", "RURAL", "SABER", "SABOR", "SAGAZ", "SAIDA", "SALTO", "SANTO",
  "SAUDE", "SECOS", "SENHA", "SENSO", "SERRA", "SINAL", "SITIO", "SOBRA", "SOLAR", "SONHO",
  "SORTE", "SUTIL", "TABUA", "TARDE", "TEMPO", "TENSO", "TERNO", "TERRA", "TEXTO", "TINTA",
  "TOCAR", "TORRE", "TOTAL", "TRACO", "TREVO", "TRIBO", "TRONO", "TROCA", "TURMA", "UNIAO",
  "UNICO", "USUAL", "VAGAO", "VALOR", "VAPOR", "VASTO", "VELHO", "VELOZ", "VENTO", "VERBO",
  "VERDE", "VERME", "VERSO", "VIAJA", "VIGOR", "VINHO", "VIOLA", "VIRAL", "VISAO", "VITAL",
  "VIVER", "VIVOS", "VOCAL", "VOLTA", "VOTOS", "VULGO", "ZEBRA", "ZERO"
].map(w => w.toUpperCase().trim()).filter(w => w.length === 5);

// Combinação de dicionário completo
const ALL_VALID_WORDS = Array.from(new Set([...WORDS_DATABASE, ...EXTENDED_WORDS]));

/**
 * Retorna uma semente inteira a partir de uma data YYYY-MM-DD
 */
function getDayIndex(dateString) {
  const baseDate = new Date("2026-01-01T00:00:00");
  const targetDate = new Date(`${dateString}T00:00:00`);
  const diffTime = targetDate - baseDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Retorna a palavra de um dia específico determinístico
 */
function getWordForDay(dayIndex, offset = 0) {
  const index = Math.abs((dayIndex * 137 + offset * 79 + 31) % ALL_VALID_WORDS.length);
  return ALL_VALID_WORDS[index];
}

/**
 * Retorna N palavras para o dia (ex: 1 para Termo, 2 para Dueto, 4 para Quarteto)
 */
function getDailyWords(dateString, count = 1) {
  const dayIdx = getDayIndex(dateString);
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(getWordForDay(dayIdx, i));
  }
  return words;
}

/**
 * Retorna N palavras aleatórias (para o modo Jogar de Novo / Prática)
 */
function getRandomWords(count = 1) {
  const words = [];
  const used = new Set();
  while (words.length < count) {
    const idx = Math.floor(Math.random() * ALL_VALID_WORDS.length);
    const w = ALL_VALID_WORDS[idx];
    if (!used.has(w)) {
      used.add(w);
      words.push(w);
    }
  }
  return words;
}

const WordService = {
  ALL_WORDS: ALL_VALID_WORDS,
  getDayIndex,
  getDailyWords,
  getRandomWords,
  isValidWord: (w) => ALL_VALID_WORDS.includes(w.toUpperCase())
};

if (typeof window !== 'undefined') {
  window.WordService = WordService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WordService;
}
