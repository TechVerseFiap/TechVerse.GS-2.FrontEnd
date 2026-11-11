import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Categoria,
  DocumentoDoServico,
  RespostaAssistente,
  ServicoDetalhe,
  ServicoRecomendado,
  ServicoRequest,
  ServicoResumo,
} from '../models';
import { MockDb, ServicoMock, criarMockDb } from './mock-db';

const db: MockDb = criarMockDb();
const ATRASO_MS = 250;
const AVISO_SERVICO = 'Informação de orientação. Requisitos, documentos e prazos podem mudar e dependem do órgão responsável. Confirme sempre no canal oficial.';
const AVISO_ASSISTENTE = 'O Cidadão Fácil orienta, mas não confirma direitos nem concede benefícios. Requisitos e decisões finais dependem do órgão responsável: confirme no canal oficial.';

// Modo demonstração: responde no lugar da API, com as mesmas rotas, regras e erros
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMock || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  const caminho = req.url.substring(environment.apiUrl.length).split('?')[0];
  try {
    return responder(req, caminho);
  } catch (e) {
    if (e instanceof HttpErrorResponse) {
      return throwError(() => e).pipe(delay(ATRASO_MS));
    }
    throw e;
  }
};

function ok<T>(body: T, status = 200): Observable<HttpEvent<T>> {
  return of(new HttpResponse<T>({ status, body })).pipe(delay(ATRASO_MS));
}

function erro(status: number, mensagem: string, caminho: string): never {
  const nomes: Record<number, string> = { 400: 'Bad Request', 404: 'Not Found', 409: 'Conflict', 422: 'Unprocessable Entity' };
  throw new HttpErrorResponse({
    status,
    error: { timestamp: new Date().toISOString(), status, erro: nomes[status], mensagem, caminho: '/api' + caminho },
  });
}

// Simula cada endpoint da API
function responder(req: HttpRequest<unknown>, caminho: string): Observable<HttpEvent<unknown>> {
  const m = req.method;
  const body = req.body as Record<string, unknown>;
  let r: RegExpMatchArray | null;

  // Categorias
  if (caminho === '/categorias' && m === 'GET') return ok([...db.categorias].sort((a, b) => a.nome.localeCompare(b.nome)));
  if (caminho === '/categorias' && m === 'POST') {
    const nome = String(body['nome'] ?? '').trim();
    if (db.categorias.some((c) => c.nome.toLowerCase() === nome.toLowerCase())) erro(409, `Já existe uma categoria com o nome '${nome}'.`, caminho);
    const c: Categoria = { id: ++db.seq, nome, descricao: (body['descricao'] as string) ?? null };
    db.categorias.push(c);
    return ok(c, 201);
  }
  if ((r = caminho.match(/^\/categorias\/(\d+)$/))) {
    const c = categoria(+r[1], caminho);
    if (m === 'GET') return ok(c);
    if (m === 'PUT') {
      const nome = String(body['nome'] ?? '').trim();
      if (db.categorias.some((x) => x.id !== c.id && x.nome.toLowerCase() === nome.toLowerCase())) erro(409, `Já existe outra categoria com o nome '${nome}'.`, caminho);
      c.nome = nome;
      c.descricao = (body['descricao'] as string) ?? null;
      return ok(c);
    }
    if (m === 'DELETE') {
      const qtd = db.servicos.filter((s) => s.categoriaId === c.id).length;
      if (qtd > 0) erro(409, `A categoria '${c.nome}' possui ${qtd} serviço(s) vinculado(s). Mova ou exclua os serviços antes.`, caminho);
      db.categorias = db.categorias.filter((x) => x.id !== c.id);
      return ok(null, 204);
    }
  }
  if ((r = caminho.match(/^\/categorias\/(\d+)\/servicos$/)) && m === 'GET') {
    categoria(+r[1], caminho);
    return ok(db.servicos.filter((s) => s.categoriaId === +r![1]).map(resumo));
  }

  // Serviços
  if (caminho === '/servicos' && m === 'GET') {
    const cat = req.params.get('categoria');
    const busca = (req.params.get('busca') ?? '').toLowerCase();
    let lista = db.servicos;
    if (cat) lista = lista.filter((s) => s.categoriaId === +cat);
    if (busca) lista = lista.filter((s) => s.nome.toLowerCase().includes(busca) || s.descricao.toLowerCase().includes(busca));
    return ok([...lista].sort((a, b) => a.nome.localeCompare(b.nome)).map(resumo));
  }
  if (caminho === '/servicos' && m === 'POST') {
    const s = { id: ++db.seq } as ServicoMock;
    preencher(s, body as unknown as ServicoRequest, caminho);
    db.servicos.push(s);
    return ok(detalhe(s), 201);
  }
  if ((r = caminho.match(/^\/servicos\/(\d+)$/))) {
    const s = servico(+r[1], caminho);
    if (m === 'GET') return ok(detalhe(s));
    if (m === 'PUT') {
      preencher(s, body as unknown as ServicoRequest, caminho);
      return ok(detalhe(s));
    }
    if (m === 'DELETE') {
      if (db.interacoes.some((i) => i.servicoIds.includes(s.id))) erro(409, `O serviço '${s.nome}' já foi recomendado pelo assistente e faz parte do histórico. Não pode ser excluído.`, caminho);
      db.servicos = db.servicos.filter((x) => x.id !== s.id);
      db.requisitos = db.requisitos.filter((x) => x.servicoId !== s.id);
      db.etapas = db.etapas.filter((x) => x.servicoId !== s.id);
      db.vinculos = db.vinculos.filter((x) => x.servicoId !== s.id);
      return ok(null, 204);
    }
  }

  // Requisitos
  if ((r = caminho.match(/^\/servicos\/(\d+)\/requisitos$/))) {
    const s = servico(+r[1], caminho);
    if (m === 'GET') return ok(db.requisitos.filter((x) => x.servicoId === s.id));
    if (m === 'POST') {
      const req2 = { id: ++db.seq, servicoId: s.id, descricao: String(body['descricao']).trim() };
      db.requisitos.push(req2);
      return ok(req2, 201);
    }
  }
  if ((r = caminho.match(/^\/requisitos\/(\d+)$/))) {
    const item = db.requisitos.find((x) => x.id === +r![1]) ?? erro(404, `Requisito com id ${r[1]} não foi encontrado(a).`, caminho);
    if (m === 'GET') return ok(item);
    if (m === 'PUT') { item.descricao = String(body['descricao']).trim(); return ok(item); }
    if (m === 'DELETE') { db.requisitos = db.requisitos.filter((x) => x !== item); return ok(null, 204); }
  }

  // Etapas
  if ((r = caminho.match(/^\/servicos\/(\d+)\/etapas$/))) {
    const s = servico(+r[1], caminho);
    if (m === 'GET') return ok(etapasDe(s.id));
    if (m === 'POST') {
      const ordem = Number(body['ordem']);
      if (db.etapas.some((e) => e.servicoId === s.id && e.ordem === ordem)) erro(409, `Já existe uma etapa de ordem ${ordem} neste serviço.`, caminho);
      const e = { id: ++db.seq, servicoId: s.id, ordem, descricao: String(body['descricao']).trim() };
      db.etapas.push(e);
      return ok(e, 201);
    }
  }
  if ((r = caminho.match(/^\/etapas\/(\d+)$/))) {
    const item = db.etapas.find((x) => x.id === +r![1]) ?? erro(404, `Etapa com id ${r[1]} não foi encontrado(a).`, caminho);
    if (m === 'GET') return ok(item);
    if (m === 'PUT') {
      const ordem = Number(body['ordem']);
      if (db.etapas.some((e) => e.servicoId === item.servicoId && e.ordem === ordem && e.id !== item.id)) erro(409, `Já existe outra etapa de ordem ${ordem} neste serviço.`, caminho);
      item.ordem = ordem;
      item.descricao = String(body['descricao']).trim();
      return ok(item);
    }
    if (m === 'DELETE') { db.etapas = db.etapas.filter((x) => x !== item); return ok(null, 204); }
  }

  // Documentos
  if (caminho === '/documentos' && m === 'GET') return ok([...db.documentos].sort((a, b) => a.nome.localeCompare(b.nome)));
  if (caminho === '/documentos' && m === 'POST') {
    const nome = String(body['nome'] ?? '').trim();
    if (db.documentos.some((d) => d.nome.toLowerCase() === nome.toLowerCase())) erro(409, `Já existe um documento com o nome '${nome}'.`, caminho);
    const d = { id: ++db.seq, nome, descricao: (body['descricao'] as string) ?? null };
    db.documentos.push(d);
    return ok(d, 201);
  }
  if ((r = caminho.match(/^\/documentos\/(\d+)$/))) {
    const d = db.documentos.find((x) => x.id === +r![1]) ?? erro(404, `Documento com id ${r[1]} não foi encontrado(a).`, caminho);
    if (m === 'GET') return ok(d);
    if (m === 'PUT') {
      const nome = String(body['nome'] ?? '').trim();
      if (db.documentos.some((x) => x.id !== d.id && x.nome.toLowerCase() === nome.toLowerCase())) erro(409, `Já existe outro documento com o nome '${nome}'.`, caminho);
      d.nome = nome;
      d.descricao = (body['descricao'] as string) ?? null;
      return ok(d);
    }
    if (m === 'DELETE') {
      if (db.vinculos.some((v) => v.documentoId === d.id)) erro(409, `O documento '${d.nome}' está vinculado a pelo menos um serviço. Desvincule antes de excluir.`, caminho);
      db.documentos = db.documentos.filter((x) => x !== d);
      return ok(null, 204);
    }
  }
  if ((r = caminho.match(/^\/servicos\/(\d+)\/documentos$/))) {
    const s = servico(+r[1], caminho);
    if (m === 'GET') return ok(documentosDe(s.id));
    if (m === 'POST') {
      const docId = Number(body['documentoId']);
      const d = db.documentos.find((x) => x.id === docId) ?? erro(404, `Documento com id ${docId} não foi encontrado(a).`, caminho);
      if (db.vinculos.some((v) => v.servicoId === s.id && v.documentoId === docId)) erro(409, `O documento '${d.nome}' já está vinculado a este serviço.`, caminho);
      const v = { servicoId: s.id, documentoId: docId, observacao: (body['observacao'] as string) || null };
      db.vinculos.push(v);
      return ok({ documentoId: d.id, nome: d.nome, descricao: d.descricao, observacao: v.observacao }, 201);
    }
  }
  if ((r = caminho.match(/^\/servicos\/(\d+)\/documentos\/(\d+)$/)) && m === 'DELETE') {
    const antes = db.vinculos.length;
    db.vinculos = db.vinculos.filter((v) => !(v.servicoId === +r![1] && v.documentoId === +r![2]));
    if (db.vinculos.length === antes) erro(422, `O documento ${r[2]} não está vinculado ao serviço ${r[1]}.`, caminho);
    return ok(null, 204);
  }

  // Assistente e indicadores
  if (caminho === '/assistente/perguntas' && m === 'POST') return ok(assistente(String(body['mensagem'] ?? ''), caminho));
  if (caminho === '/assistente/indicadores' && m === 'GET') {
    const total = db.interacoes.length;
    const cont = (r2: string) => db.interacoes.filter((i) => i.resultado === r2).length;
    const enc = cont('ENCONTRADO');
    return ok({
      totalInteracoes: total,
      encontradas: enc,
      pediramEsclarecimento: cont('PEDIU_ESCLARECIMENTO'),
      naoEncontradas: cont('NAO_ENCONTRADO'),
      taxaOrientacaoEncontrada: total === 0 ? 0 : Math.round((enc * 1000) / total) / 10,
    });
  }

  return erro(404, 'Endpoint não encontrado.', caminho);
}

// Funções de apoio
function categoria(id: number, caminho: string): Categoria {
  return db.categorias.find((c) => c.id === id) ?? erro(404, `Categoria com id ${id} não foi encontrado(a).`, caminho);
}

function servico(id: number, caminho: string): ServicoMock {
  return db.servicos.find((s) => s.id === id) ?? erro(404, `Serviço com id ${id} não foi encontrado(a).`, caminho);
}

function precisaReverificacao(data: string): boolean {
  return (Date.now() - new Date(data + 'T00:00:00').getTime()) / 86_400_000 > 180;
}

function resumo(s: ServicoMock): ServicoResumo {
  const c = db.categorias.find((x) => x.id === s.categoriaId)!;
  return {
    id: s.id, nome: s.nome, descricao: s.descricao, categoriaId: c.id, categoria: c.nome,
    orgaoResponsavel: s.orgaoResponsavel, canal: s.canal, precisaReverificacao: precisaReverificacao(s.dataVerificacao),
  };
}

function etapasDe(servicoId: number) {
  return db.etapas.filter((e) => e.servicoId === servicoId).sort((a, b) => a.ordem - b.ordem);
}

function documentosDe(servicoId: number): DocumentoDoServico[] {
  return db.vinculos
    .filter((v) => v.servicoId === servicoId)
    .map((v) => {
      const d = db.documentos.find((x) => x.id === v.documentoId)!;
      return { documentoId: d.id, nome: d.nome, descricao: d.descricao, observacao: v.observacao };
    });
}

function detalhe(s: ServicoMock): ServicoDetalhe {
  return {
    ...s,
    categoria: db.categorias.find((c) => c.id === s.categoriaId)!,
    precisaReverificacao: precisaReverificacao(s.dataVerificacao),
    requisitos: db.requisitos.filter((x) => x.servicoId === s.id),
    etapas: etapasDe(s.id),
    documentos: documentosDe(s.id),
    aviso: AVISO_SERVICO,
  };
}

function preencher(s: ServicoMock, b: ServicoRequest, caminho: string): void {
  const url = (b.urlFonte ?? '').trim().toLowerCase();
  if (!url.startsWith('https://')) erro(422, 'A URL da fonte oficial deve começar com https://', caminho);
  categoria(b.categoriaId, caminho);
  Object.assign(s, {
    categoriaId: b.categoriaId,
    nome: b.nome.trim(),
    descricao: b.descricao.trim(),
    publicoAlvo: b.publicoAlvo,
    orgaoResponsavel: b.orgaoResponsavel.trim(),
    canal: b.canal,
    urlFonte: b.urlFonte.trim(),
    dataVerificacao: b.dataVerificacao,
    palavrasChave: b.palavrasChave
      ? [...new Set(b.palavrasChave.split(',').map((p) => p.trim().toLowerCase()).filter(Boolean))].join(',')
      : null,
  });
}

// Mesma lógica de identificação do AssistenteBO da API Java
function normalizar(t: string): string {
  return t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function contem(texto: string, termo: string): boolean {
  return !!termo && (texto.includes(` ${termo} `) || texto.includes(` ${termo}s `));
}

function assistente(mensagem: string, caminho: string): RespostaAssistente {
  if (mensagem.trim().length < 3) erro(400, 'A mensagem deve ter entre 3 e 500 caracteres.', caminho);
  const texto = ` ${normalizar(mensagem)} `;
  const citadas = db.categorias.filter((c) => {
    const n = normalizar(c.nome);
    return contem(texto, n) || contem(texto, n.endsWith('s') ? n.slice(0, -1) : n);
  });

  const candidatos = db.servicos
    .map((s) => {
      const palavras = (s.palavrasChave ?? '').split(',').map((p) => p.trim()).filter((p) => p && contem(texto, normalizar(p)));
      const pontos = palavras.length * 2 + (palavras.length && citadas.some((c) => c.id === s.categoriaId) ? 1 : 0);
      return { s, palavras, pontos };
    })
    .filter((c) => c.palavras.length > 0)
    .sort((a, b) => b.pontos - a.pontos || a.s.nome.localeCompare(b.s.nome))
    .slice(0, 3);

  const rec = (s: ServicoMock, justificativa: string, pontuacao: number): ServicoRecomendado => ({
    servicoId: s.id, nome: s.nome, categoria: resumo(s).categoria, orgaoResponsavel: s.orgaoResponsavel,
    urlFonte: s.urlFonte, justificativa, pontuacao,
  });

  const id = ++db.seq;
  if (candidatos.length) {
    db.interacoes.push({ id, resultado: 'ENCONTRADO', servicoIds: candidatos.map((c) => c.s.id) });
    return {
      interacaoId: id, resultado: 'ENCONTRADO', assuntoIdentificado: resumo(candidatos[0].s).categoria,
      mensagem: `Encontrei ${candidatos.length} caminho(s) que podem ajudar. Abra o serviço para ver requisitos, documentos e etapas.`,
      recomendacoes: candidatos.map((c) => rec(c.s, `Pode ser relevante porque você mencionou: ${c.palavras.join(', ')}.`, c.pontos)),
      sugestoesDeCategoria: [], aviso: AVISO_ASSISTENTE,
    };
  }
  if (citadas.length) {
    const c = citadas[0];
    const opcoes = db.servicos.filter((s) => s.categoriaId === c.id).slice(0, 5);
    db.interacoes.push({ id, resultado: 'PEDIU_ESCLARECIMENTO', servicoIds: opcoes.map((s) => s.id) });
    return {
      interacaoId: id, resultado: 'PEDIU_ESCLARECIMENTO', assuntoIdentificado: c.nome,
      mensagem: opcoes.length
        ? `Entendi que o assunto é ${c.nome}. Qual destes serviços você procura? Se não for nenhum, conte com outras palavras.`
        : `Entendi que o assunto é ${c.nome}, mas ainda não há serviços cadastrados nessa categoria.`,
      recomendacoes: opcoes.map((s) => rec(s, `Serviço da categoria ${c.nome}.`, 1)),
      sugestoesDeCategoria: [], aviso: AVISO_ASSISTENTE,
    };
  }
  db.interacoes.push({ id, resultado: 'NAO_ENCONTRADO', servicoIds: [] });
  return {
    interacaoId: id, resultado: 'NAO_ENCONTRADO', assuntoIdentificado: 'NAO_IDENTIFICADO',
    mensagem: 'Não encontrei no catálogo um serviço para o que você descreveu. Tente explicar com outras palavras ou escolha uma das categorias abaixo.',
    recomendacoes: [], sugestoesDeCategoria: db.categorias.map((c) => c.nome).sort(), aviso: AVISO_ASSISTENTE,
  };
}
