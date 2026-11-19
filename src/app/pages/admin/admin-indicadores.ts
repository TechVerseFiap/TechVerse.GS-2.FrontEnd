// Painel: indicador de impacto (buscas com orientação encontrada) e sincronização com o gov.br e a Base dos Dados
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Api, mensagemDeErro } from '../../core/api';
import { Indicadores, ResultadoCatalogo, StatusSincronizacao } from '../../core/models';
import { Carregando, Erro } from '../../shared/estado';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-admin-indicadores',
  imports: [Icone, Carregando, Erro],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .numeros { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (min-width: 48rem) {
      .numeros { gap: 16px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    }
    .numero { font-size: clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem); font-weight: 700; color: var(--azul); line-height: 1.1; }
    .barra { height: 14px; border-radius: 999px; background: var(--azul-claro); overflow: hidden; }
    .barra span { display: block; height: 100%; background: var(--azul); }
  `,
  template: `
    <div class="pilha">
      <div class="pilha-pequena">
        <h1>Indicadores</h1>
        <p class="m-0 texto-suave">
          Calculados a partir das perguntas feitas ao assistente. O texto das perguntas não é guardado: só o resultado.
        </p>
      </div>

      @if (carregando()) {
        <app-carregando />
      } @else if (erro()) {
        <app-erro [mensagem]="erro()" (tentar)="carregar()" />
      } @else if (dados(); as d) {
        <section class="cartao pilha" aria-labelledby="t-taxa">
          <h2 id="t-taxa">Buscas que terminaram com uma orientação</h2>
          <p class="numero m-0">{{ d.taxaOrientacaoEncontrada }}%</p>
          <div class="barra" role="img" [attr.aria-label]="d.taxaOrientacaoEncontrada + '% das buscas encontraram uma orientação'">
            <span [style.width.%]="d.taxaOrientacaoEncontrada"></span>
          </div>
          @if (d.totalInteracoes === 0) {
            <p class="m-0 texto-suave texto-pequeno">Ainda não há perguntas registradas. Faça algumas no Assistente e volte aqui.</p>
          }
        </section>

        <div class="numeros">
          <div class="cartao pilha-pequena"><span class="texto-suave">Total de perguntas</span><span class="numero">{{ d.totalInteracoes }}</span></div>
          <div class="cartao pilha-pequena"><span class="texto-suave">Encontraram serviço</span><span class="numero">{{ d.encontradas }}</span></div>
          <div class="cartao pilha-pequena"><span class="texto-suave">Pediram esclarecimento</span><span class="numero">{{ d.pediramEsclarecimento }}</span></div>
          <div class="cartao pilha-pequena"><span class="texto-suave">Não encontradas</span><span class="numero">{{ d.naoEncontradas }}</span></div>
        </div>

        <div class="alerta alerta-info">
          <app-icone nome="info" />
          <p class="m-0">
            As buscas “não encontradas” mostram quais assuntos a equipe deve cadastrar primeiro. Para medir impacto real,
            combine este número com os testes com participantes descritos na proposta.
          </p>
        </div>
        <div><button type="button" class="botao botao-secundario" (click)="carregar()">Atualizar</button></div>
      }

      <section class="cartao pilha" aria-labelledby="t-sync">
        <div class="pilha-pequena">
          <h2 id="t-sync">Dados das fontes oficiais</h2>
          <p class="m-0 texto-suave">
            O catálogo é montado a partir das páginas de serviços do <a href="https://www.gov.br/pt-br/servicos" target="_blank" rel="noopener">gov.br</a>
            (requisitos, documentos, etapas e links oficiais) e os números do panorama vêm da
            <a href="https://basedosdados.org" target="_blank" rel="noopener">Base dos Dados</a>. Tudo é gravado no banco da API.
          </p>
        </div>

        @if (status(); as st) {
          @if (st.emAndamento) {
            <div class="alerta alerta-info" role="status" aria-live="polite">
              <span class="spinner" aria-hidden="true"></span>
              <p class="m-0"><strong>{{ st.etapaAtual }}</strong>@if (st.progresso) {<br />{{ st.progresso }}}</p>
            </div>
          }

          @if (st.ultimoCatalogo; as c) {
            <div class="pilha-pequena">
              <h3>Catálogo do gov.br</h3>
              <p class="m-0 texto-suave texto-pequeno">Atualizado em {{ dataHora(c.fim) }}</p>
            </div>
            <div class="numeros">
              <div class="cartao pilha-pequena"><span class="texto-suave">Serviços encontrados</span><span class="numero">{{ c.encontrados }}</span></div>
              <div class="cartao pilha-pequena"><span class="texto-suave">Novos</span><span class="numero">{{ c.novos }}</span></div>
              <div class="cartao pilha-pequena"><span class="texto-suave">Atualizados</span><span class="numero">{{ c.atualizados }}</span></div>
              <div class="cartao pilha-pequena"><span class="texto-suave">Já conferidos</span><span class="numero">{{ c.pulados }}</span></div>
            </div>
            <p class="m-0 texto-pequeno">
              @for (cat of categorias(c); track cat[0]; let ultimo = $last) {
                <strong>{{ cat[0] }}</strong>: {{ cat[1] }}{{ ultimo ? '' : ' · ' }}
              }
              @if (c.erros) { <span class="texto-suave"> · {{ c.erros }} página(s) não puderam ser lidas</span> }
            </p>
          }
          @if (st.erroCatalogo) {
            <div class="alerta alerta-erro" role="alert"><app-icone nome="alerta" /><p class="m-0">gov.br: {{ st.erroCatalogo }}</p></div>
          }

          @if (st.ultimaSincronizacao; as r) {
            <div class="pilha-pequena">
              <h3>Panorama (Base dos Dados)</h3>
              <p class="m-0 texto-suave texto-pequeno">Atualizado em {{ dataHora(r.fim) }} · municípios de {{ r.uf }}</p>
            </div>
            <div class="tabela-caixa">
              <table class="tabela tabela-responsiva">
                <caption class="sr-only">Resultado da última atualização por indicador</caption>
                <thead>
                  <tr><th scope="col">Indicador</th><th scope="col">Período</th><th scope="col">Novos</th><th scope="col">Atualizados</th></tr>
                </thead>
                <tbody>
                  @for (i of r.indicadores; track i.codigo) {
                    <tr>
                      <td data-label="Indicador"><strong>{{ nomes[i.codigo] ?? i.codigo }}</strong></td>
                      <td data-label="Período">{{ i.periodo }}</td>
                      <td data-label="Novos">{{ i.novas }}</td>
                      <td data-label="Atualizados">{{ i.atualizadas }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
          @if (!st.configurada) {
            <div class="alerta alerta-atencao">
              <app-icone nome="alerta" />
              <p class="m-0">A API não tem a chave do BigQuery: o panorama mostra os dados da última carga.</p>
            </div>
          } @else if (st.ultimoErro) {
            <div class="alerta alerta-erro" role="alert"><app-icone nome="alerta" /><p class="m-0">Base dos Dados: {{ st.ultimoErro }}</p></div>
          }

          @if (!st.emAndamento) {
            <div class="pilha-pequena">
              <div>
                <button type="button" class="botao botao-primario" (click)="sincronizar()" [disabled]="iniciando()">
                  <app-icone nome="grafico" [tamanho]="18" />Sincronizar agora
                </button>
              </div>
              <p class="m-0 texto-pequeno texto-suave">
                Na primeira vez pode levar de 10 a 20 minutos (são centenas de páginas). Depois, só o que mudou é lido de novo.
              </p>
            </div>
          }
        }

        @if (erroSincronizacao()) {
          <div class="alerta alerta-erro" role="alert">
            <app-icone nome="alerta" />
            <p class="m-0">{{ erroSincronizacao() }}</p>
          </div>
        }
      </section>
    </div>
  `,
})
export class AdminIndicadores implements OnInit, OnDestroy {
  private readonly api = inject(Api);
  protected readonly dados = signal<Indicadores | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');

  protected readonly status = signal<StatusSincronizacao | null>(null);
  protected readonly iniciando = signal(false);
  protected readonly erroSincronizacao = signal('');
  protected readonly nomes: Record<string, string> = {
    POPULACAO: 'População',
    SALDO_EMPREGO_FORMAL: 'Saldo de empregos formais',
    FAMILIAS_BOLSA_FAMILIA: 'Famílias no Bolsa Família',
    VALOR_BOLSA_FAMILIA: 'Valor pago pelo Bolsa Família',
    ESTABELECIMENTOS_SUS: 'Estabelecimentos do SUS',
  };
  // Enquanto a sincronização roda, consulta o status a cada 3 segundos
  private acompanhamento?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.carregar();
    this.carregarStatus();
  }

  ngOnDestroy(): void {
    clearTimeout(this.acompanhamento);
  }

  protected carregarStatus(): void {
    this.api.statusSincronizacao().subscribe({
      next: (st) => {
        const terminou = this.status()?.emAndamento && !st.emAndamento;
        this.status.set(st);
        clearTimeout(this.acompanhamento);
        if (st.emAndamento) {
          this.acompanhamento = setTimeout(() => this.carregarStatus(), 3000);
        } else if (terminou) {
          this.carregar();
        }
      },
      error: (e) => this.erroSincronizacao.set(mensagemDeErro(e)),
    });
  }

  protected sincronizar(): void {
    this.iniciando.set(true);
    this.erroSincronizacao.set('');
    this.api.iniciarSincronizacao().subscribe({
      next: (st) => { this.status.set(st); this.iniciando.set(false); this.carregarStatus(); },
      error: (e) => { this.erroSincronizacao.set(mensagemDeErro(e)); this.iniciando.set(false); },
    });
  }

  protected categorias(c: ResultadoCatalogo): [string, number][] {
    return Object.entries(c.porCategoria);
  }

  // "2026-11-19T01:35:16.06" -> "19/11 às 01:35"
  protected dataHora(iso: string): string {
    return `${iso.substring(8, 10)}/${iso.substring(5, 7)} às ${iso.substring(11, 16)}`;
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.indicadores().subscribe({
      next: (d) => { this.dados.set(d); this.carregando.set(false); },
      error: (e) => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }
}
