import { Municipio, Panorama, ValorPanorama } from '../models';

// Amostra do panorama para o modo demonstração: os 40 maiores municípios de SP e Caieiras.
// Mesmos números carregados no Oracle pelos scripts de Database (Base dos Dados, consulta em 18/11/2026).
// Colunas: código IBGE, nome, população 2025, saldo CAGED 2025, famílias Bolsa Família 03/2026,
// valor Bolsa Família 03/2026 (R$), estabelecimentos SUS 03/2026
type Linha = [number, string, number, number, number, number, number];

const LINHAS: Linha[] = [
  [3501608, "Americana", 247571, 482, 5763, 3871313, 88],
  [3503208, "Araraquara", 253474, 301, 7451, 4971236, 128],
  [3505708, "Barueri", 333737, 9396, 13742, 9045582, 70],
  [3506003, "Bauru", 392947, 2056, 14224, 9711831, 109],
  [3509007, "Caieiras", 98549, 900, 3606, 2380953, 34],
  [3509502, "Campinas", 1187974, 3157, 50326, 33667781, 222],
  [3510609, "Carapicuíba", 398236, 1140, 21038, 14069746, 45],
  [3513009, "Cotia", 289493, 1949, 9338, 6302000, 58],
  [3513801, "Diadema", 403579, 1523, 23365, 15319018, 60],
  [3515004, "Embu das Artes", 259788, 1349, 19052, 12789024, 49],
  [3516200, "Franca", 365494, -667, 10851, 7339837, 94],
  [3518701, "Guarujá", 294871, 584, 16232, 10927979, 129],
  [3518800, "Guarulhos", 1349100, 13570, 97268, 65640670, 167],
  [3519071, "Hortolândia", 248842, 619, 11089, 7295673, 60],
  [3520509, "Indaiatuba", 269657, 1152, 4177, 2752636, 62],
  [3522505, "Itapevi", 242995, 763, 14144, 9442234, 47],
  [3523107, "Itaquaquecetuba", 382983, 1190, 34049, 23396794, 52],
  [3524402, "Jacareí", 250952, 1496, 7405, 4828417, 51],
  [3525904, "Jundiaí", 463039, 3380, 7434, 5124413, 114],
  [3526902, "Limeira", 301292, 1197, 11710, 7785263, 92],
  [3529005, "Marília", 247348, 1134, 7591, 5068057, 122],
  [3529401, "Mauá", 429014, 2314, 18436, 12234760, 77],
  [3530607, "Mogi das Cruzes", 470302, 1911, 30694, 20934599, 97],
  [3534401, "Osasco", 759524, 25426, 32376, 21566304, 100],
  [3538709, "Piracicaba", 440835, 1326, 11394, 7654413, 168],
  [3541000, "Praia Grande", 368539, 354, 14030, 9573282, 131],
  [3541406, "Presidente Prudente", 234706, 2117, 9014, 6034699, 93],
  [3543402, "Ribeirão Preto", 731639, 3745, 19497, 13230758, 138],
  [3547809, "Santo André", 782048, 6309, 33101, 21902860, 110],
  [3548500, "Santos", 429547, 6251, 12713, 8420031, 147],
  [3552205, "Sorocaba", 762172, 5584, 30661, 20782093, 130],
  [3552403, "Sumaré", 291116, 1125, 12258, 8226306, 69],
  [3552502, "Suzano", 320261, -111, 23404, 15853424, 68],
  [3548708, "São Bernardo do Campo", 841154, 4177, 34391, 22349705, 117],
  [3548906, "São Carlos", 266427, 1899, 8476, 5758559, 98],
  [3549805, "São José do Rio Preto", 504166, 1833, 15217, 10228886, 119],
  [3549904, "São José dos Campos", 727078, 6087, 31719, 21097701, 158],
  [3550308, "São Paulo", 11904961, 108199, 615742, 405267077, 1460],
  [3551009, "São Vicente", 338326, 1030, 19260, 13375746, 87],
  [3552809, "Taboão da Serra", 285307, 318, 12749, 8330961, 47],
  [3554102, "Taubaté", 322397, 2793, 9800, 6641326, 118],
];

const CONSULTA = '2026-11-18';
const AVISO = 'Números públicos e agregados, sem dados pessoais. Eles ajudam a entender o território, mas não indicam se você tem direito a algum benefício.';

const FONTES = {
  ibge: ['Base dos Dados - População Brasileira (IBGE)', 'https://basedosdados.org/dataset/d30222ad-7a5c-4778-a1ec-f0785371d1ca'],
  caged: ['Base dos Dados - CAGED (Ministério do Trabalho e Emprego)', 'https://basedosdados.org/dataset/562b56a3-0b01-4735-a049-eeac5681f056'],
  cgu: ['Base dos Dados - Benefícios ao Cidadão (CGU)', 'https://basedosdados.org/dataset/a9a5b35d-2b41-4be5-be07-7256e713ba53'],
  cnes: ['Base dos Dados - CNES (Ministério da Saúde)', 'https://basedosdados.org/dataset/354d6d98-bc09-4e22-a58a-e4eac3a5283c'],
} as const;

function valor(codigo: string, nome: string, descricao: string, v: number, unidade: string, referencia: string, periodo: string, fonte: keyof typeof FONTES): ValorPanorama {
  return { codigo, nome, descricao, valor: v, unidade, referencia, periodo, fonte: FONTES[fonte][0], urlFonte: FONTES[fonte][1], dataConsulta: CONSULTA };
}

export const MUNICIPIOS_DEMO: (Municipio & { populacao: number })[] = LINHAS.map((l) => ({ codigoIbge: l[0], nome: l[1], uf: 'SP', populacao: l[2] }));

export function panoramaDemo(codigoIbge: number): Panorama | null {
  const l = LINHAS.find((x) => x[0] === codigoIbge);
  if (!l) return null;
  return {
    municipio: { codigoIbge: l[0], nome: l[1], uf: 'SP' },
    indicadores: [
      valor('POPULACAO', 'População estimada', 'Estimativa oficial de população residente do IBGE para o ano de referência.', l[2], 'pessoas', '2025-01-01', '2025', 'ibge'),
      valor('SALDO_EMPREGO_FORMAL', 'Saldo de empregos formais', 'Admissões menos desligamentos com carteira assinada no ano (Novo CAGED). Pode ser negativo.', l[3], 'vagas', '2025-01-01', '2025', 'caged'),
      valor('FAMILIAS_BOLSA_FAMILIA', 'Famílias no Bolsa Família', 'Responsáveis familiares distintos (NIS) que receberam parcela do Novo Bolsa Família na competência.', l[4], 'famílias', '2026-03-01', '03/2026', 'cgu'),
      valor('VALOR_BOLSA_FAMILIA', 'Valor pago pelo Bolsa Família', 'Soma das parcelas do Novo Bolsa Família pagas no município na competência, em reais.', l[5], 'reais', '2026-03-01', '03/2026', 'cgu'),
      valor('ESTABELECIMENTOS_SUS', 'Estabelecimentos de saúde do SUS', 'Estabelecimentos de saúde com vínculo ao SUS registrados no CNES na competência.', l[6], 'unidades', '2026-03-01', '03/2026', 'cnes'),
    ],
    aviso: AVISO,
  };
}
