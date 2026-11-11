import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Categoria,
  CategoriaRequest,
  Documento,
  DocumentoDoServico,
  DocumentoRequest,
  ErroApi,
  Etapa,
  Indicadores,
  Requisito,
  RespostaAssistente,
  ServicoDetalhe,
  ServicoRequest,
  ServicoResumo,
  VinculoDocumento,
} from './models';

// Serviço com todas as chamadas HTTP à API
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  // Categorias
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.base}/categorias`);
  }
  buscarCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.base}/categorias/${id}`);
  }
  criarCategoria(body: CategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.base}/categorias`, body);
  }
  atualizarCategoria(id: number, body: CategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.base}/categorias/${id}`, body);
  }
  excluirCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categorias/${id}`);
  }

  // Serviços
  listarServicos(filtro: { categoria?: number; busca?: string } = {}): Observable<ServicoResumo[]> {
    let params = new HttpParams();
    if (filtro.categoria != null) params = params.set('categoria', filtro.categoria);
    if (filtro.busca) params = params.set('busca', filtro.busca);
    return this.http.get<ServicoResumo[]>(`${this.base}/servicos`, { params });
  }
  detalharServico(id: number): Observable<ServicoDetalhe> {
    return this.http.get<ServicoDetalhe>(`${this.base}/servicos/${id}`);
  }
  criarServico(body: ServicoRequest): Observable<ServicoDetalhe> {
    return this.http.post<ServicoDetalhe>(`${this.base}/servicos`, body);
  }
  atualizarServico(id: number, body: ServicoRequest): Observable<ServicoDetalhe> {
    return this.http.put<ServicoDetalhe>(`${this.base}/servicos/${id}`, body);
  }
  excluirServico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/servicos/${id}`);
  }

  // Requisitos
  adicionarRequisito(servicoId: number, descricao: string): Observable<Requisito> {
    return this.http.post<Requisito>(`${this.base}/servicos/${servicoId}/requisitos`, { descricao });
  }
  atualizarRequisito(id: number, descricao: string): Observable<Requisito> {
    return this.http.put<Requisito>(`${this.base}/requisitos/${id}`, { descricao });
  }
  excluirRequisito(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/requisitos/${id}`);
  }

  // Etapas
  adicionarEtapa(servicoId: number, ordem: number, descricao: string): Observable<Etapa> {
    return this.http.post<Etapa>(`${this.base}/servicos/${servicoId}/etapas`, { ordem, descricao });
  }
  atualizarEtapa(id: number, ordem: number, descricao: string): Observable<Etapa> {
    return this.http.put<Etapa>(`${this.base}/etapas/${id}`, { ordem, descricao });
  }
  excluirEtapa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/etapas/${id}`);
  }

  // Documentos
  listarDocumentos(): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.base}/documentos`);
  }
  criarDocumento(body: DocumentoRequest): Observable<Documento> {
    return this.http.post<Documento>(`${this.base}/documentos`, body);
  }
  atualizarDocumento(id: number, body: DocumentoRequest): Observable<Documento> {
    return this.http.put<Documento>(`${this.base}/documentos/${id}`, body);
  }
  excluirDocumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/documentos/${id}`);
  }
  vincularDocumento(servicoId: number, body: VinculoDocumento): Observable<DocumentoDoServico> {
    return this.http.post<DocumentoDoServico>(`${this.base}/servicos/${servicoId}/documentos`, body);
  }
  desvincularDocumento(servicoId: number, documentoId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/servicos/${servicoId}/documentos/${documentoId}`);
  }

  // Assistente
  perguntar(mensagem: string): Observable<RespostaAssistente> {
    return this.http.post<RespostaAssistente>(`${this.base}/assistente/perguntas`, { mensagem });
  }
  indicadores(): Observable<Indicadores> {
    return this.http.get<Indicadores>(`${this.base}/assistente/indicadores`);
  }
}

// Converte erros HTTP em mensagens simples para o cidadão
export function mensagemDeErro(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Não conseguimos falar com o servidor. Verifique sua internet e tente de novo. '
        + 'Se for o primeiro acesso do dia, o servidor pode levar até 1 minuto para acordar.';
    }
    const corpo = err.error as Partial<ErroApi> | null;
    if (corpo?.campos?.length) {
      return corpo.campos.map((c) => c.mensagem).join(' ');
    }
    if (corpo?.mensagem) {
      return corpo.mensagem;
    }
  }
  return 'Algo deu errado. Tente novamente em instantes.';
}
