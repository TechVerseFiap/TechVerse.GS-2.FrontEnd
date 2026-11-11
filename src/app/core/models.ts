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

export interface ServicoResumo {
  id: number;
  nome: string;
  descricao: string;
  categoriaId: number;
  categoria: string;
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
}

export interface VinculoDocumento {
  documentoId: number;
  observacao: string | null;
}

export interface ServicoDetalhe {
  id: number;
  nome: string;
  descricao: string;
  publicoAlvo: string | null;
  categoria: Categoria;
  orgaoResponsavel: string;
  canal: Canal;
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
  orgaoResponsavel: string;
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
  pontuacao: number;
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

export interface ErroApi {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
  caminho: string;
  campos?: { campo: string; mensagem: string }[];
}

export const CANAL_ROTULO: Record<Canal, string> = {
  DIGITAL: '100% digital',
  PRESENCIAL: 'Presencial',
  DIGITAL_E_PRESENCIAL: 'Digital e presencial',
};
