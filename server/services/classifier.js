// Clasificador de consultas por palabras clave.
// Etapa 1: heurística simple. Más adelante puede delegarse al modelo de IA.

export const CATEGORIAS = [
  'acreditacion', 'derechos', 'deberes', 'prohibiciones', 'instalacion',
  'sufragio', 'escrutinio', 'actas', 'votos_impugnados', 'actas_observadas',
  'nulidad', 'recuento', 'incidentes', 'propaganda', 'neutralidad',
  'JEE', 'ONPE', 'ODPE', 'seguridad', 'cronograma', 'normativa', 'otros',
];

const RULES = [
  ['acreditacion', ['acredit', 'credencial', 'designaci', 'inscrib']],
  ['votos_impugnados', ['voto impugnad', 'impugnaci de voto', 'cédula impugnad']],
  ['actas_observadas', ['acta observad', 'observaci del acta', 'acta con observ']],
  ['nulidad', ['nulidad', 'nulo el acta', 'anular']],
  ['recuento', ['recuento', 'reconteo', 'volver a contar']],
  ['escrutinio', ['escrutinio', 'conteo de votos', 'contabiliz']],
  ['actas', ['acta', 'actas', 'copia del acta']],
  ['instalacion', ['instalaci', 'instalar la mesa', 'apertura de mesa']],
  ['sufragio', ['sufragio', 'votaci', 'emitir su voto', 'durante la votaci']],
  ['propaganda', ['propaganda', 'publicidad electoral', 'volante', 'afiche']],
  ['neutralidad', ['neutralidad', 'imparcial', 'autoridad neutral']],
  ['prohibiciones', ['prohib', 'no puedo', 'no debo', 'sancion', 'infracci']],
  ['derechos', ['derecho', 'me corresponde', 'tengo derecho']],
  ['deberes', ['deber', 'obligaci', 'funci', 'responsabilidad']],
  ['seguridad', ['seguridad', 'policía', 'fuerzas armadas', 'agresi', 'amenaza']],
  ['cronograma', ['cronograma', 'plazo', 'fecha límite', 'a qué hora', 'horario']],
  ['JEE', ['jee', 'jurado electoral especial']],
  ['ODPE', ['odpe', 'oficina descentralizada']],
  ['ONPE', ['onpe']],
  ['incidentes', ['incidente', 'irregularidad', 'problema', 'no me dejan', 'no me permiten']],
  ['normativa', ['norma', 'reglamento', 'resoluci', 'ley ', 'artículo']],
];

export function classify(message = '') {
  const text = String(message).toLowerCase();
  for (const [categoria, keywords] of RULES) {
    if (keywords.some((k) => text.includes(k))) return categoria;
  }
  return 'otros';
}
