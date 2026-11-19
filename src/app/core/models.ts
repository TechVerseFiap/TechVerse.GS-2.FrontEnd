// Tipos que espelham os DTOs da API Java

export type Canal = 'DIGITAL' | 'PRESENCIAL' | 'DIGITAL_E_PRESENCIAL';

export type ResultadoInteracao = 'ENCONTRADO' | 'PEDIU_ESCLARECIMENTO' | 'NAO_ENCONTRADO';

export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface CategoriaRequest {
  nome: string;
  descricao: string | null;
}

export type Esfera = 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL';

export interface Orgao {
  id: number;
  nome: string;
  sigla: string;
  esfera: Esfera;
}

export interface OrgaoRequest {
  nome: string;
  sigla: string;
  esfera: Esfera;
}

export interface Fonte {
  id: number;
  titulo: string;
  url: string;
  tipo: 'OFICIAL' | 'SIMULADA';
  dataConsulta: string;
}

export interface CanalInfo {
  tipo: 'DIGITAL' | 'PRESENCIAL';
  endereco: string | null;
}

export interface ServicoResumo {
  id: number;
  nome: string;
  descricao: string;
  categoriaId: number;
  categoria: string;
  orgaoId?: number;
  orgaoResponsavel: string;
  canal: Canal;
  precisaReverificacao: boolean;
}

export interface Requisito {
  id: number;
  servicoId: number;
  descricao: string;
}

export interface Etapa {
  id: number;
  servicoId: number;
  ordem: number;
  descricao: string;
}

export interface Documento {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface DocumentoRequest {
  nome: string;
  descricao: string | null;
}

export interface DocumentoDoServico {
  documentoId: number;
  nome: string;
  descricao: string | null;
  observacao: string | null;
  obrigatorio?: boolean;
}

export interface VinculoDocumento {
  documentoId: number;
  observacao: string | null;
  obrigatorio?: boolean;
}

export interface ServicoDetalhe {
  id: number;
  nome: string;
  descricao: string;
  publicoAlvo: string | null;
  categoria: Categoria;
  orgao?: Orgao;
  orgaoResponsavel: string;
  canal: Canal;
  canais?: CanalInfo[];
  fonte?: Fonte;
  urlFonte: string;
  dataVerificacao: string;
  precisaReverificacao: boolean;
  palavrasChave: string | null;
  requisitos: Requisito[];
  etapas: Etapa[];
  documentos: DocumentoDoServico[];
  aviso: string;
}

export interface ServicoRequest {
  categoriaId: number;
  nome: string;
  descricao: string;
  publicoAlvo: string | null;
  orgaoId: number;
  canal: Canal;
  urlFonte: string;
  dataVerificacao: string;
  palavrasChave: string | null;
}

export interface ServicoRecomendado {
  servicoId: number;
  nome: string;
  categoria: string;
  orgaoResponsavel: string;
  urlFonte: string;
  justificativa: string;
  posicao?: number;
  pontuacao: number | null;
}

export interface RespostaAssistente {
  interacaoId: number;
  resultado: ResultadoInteracao;
  assuntoIdentificado: string;
  mensagem: string;
  recomendacoes: ServicoRecomendado[];
  sugestoesDeCategoria: string[];
  aviso: string;
}

export interface Indicadores {
  totalInteracoes: number;
  encontradas: number;
  pediramEsclarecimento: number;
  naoEncontradas: number;
  taxaOrientacaoEncontrada: number;
}

// Panorama do município (dados públicos agregados da Base dos Dados)
export interface Municipio {
  codigoIbge: number;
  nome: string;
  uf: string;
}

export interface ValorPanorama {
  codigo: string;
  nome: string;
  descricao: string;
  valor: number;
  unidade: string;
  referencia: string;
  periodo: string;
  fonte: string;
  urlFonte: string;
  dataConsulta: string;
}

export interface Panorama {
  municipio: Municipio;
  indicadores: ValorPanorama[];
  aviso: string;
}

// Sincronização com a Base dos Dados (SQL no BigQuery -> Oracle)
export interface IndicadorSincronizado {
  codigo: string;
  periodo: string;
  linhasRecebidas: number;
  novas: number;
  atualizadas: number;
  ignoradas: number;
}

export interface ResultadoSincronizacao {
  uf: string;
  inicio: string;
  fim: string;
  municipiosNovos: number;
  indicadores: IndicadorSincronizado[];
}

export interface StatusSincronizacao {
  configurada: boolean;
  emAndamento: boolean;
  uf: string;
  ultimaSincronizacao: ResultadoSincronizacao | null;
  ultimoErro: string | null;
}

export interface ErroApi {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
  caminho: string;
  campos?: { campo: string; mensagem: string }[];
}

export const ESFERA_ROTULO: Record<Esfera, string> = {
  FEDERAL: 'Federal',
  ESTADUAL: 'Estadual',
  MUNICIPAL: 'Municipal',
};

export const CANAL_ROTULO: Record<Canal, string> = {
  DIGITAL: '100% digital',
  PRESENCIAL: 'Presencial',
  DIGITAL_E_PRESENCIAL: 'Digital e presencial',
};
