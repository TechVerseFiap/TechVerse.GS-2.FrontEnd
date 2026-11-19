// Painel: indicador de impacto (buscas com orientação encontrada) e atualização dos dados pela Base dos Dados
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Api, mensagemDeErro } from '../../core/api';
import { Indicadores, ResultadoSincronizacao, StatusSincronizacao } from '../../core/models';
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

      <section class="cartao pilha" aria-labelledby="t-bd">
        <div class="pilha-pequena">
          <h2 id="t-bd">Dados da Base dos Dados</h2>
          <p class="m-0 texto-suave">
            Os números do panorama da cidade vêm da <a href="https://basedosdados.org" target="_blank" rel="noopener">Base dos Dados</a>.
            A API consulta as tabelas públicas com SQL no BigQuery e grava o período mais recente no banco.
          </p>
        </div>

        @if (status(); as st) {
          @if (!st.configurada) {
            <div class="alerta alerta-atencao">
              <app-icone nome="alerta" />
              <p class="m-0">A API ainda não tem a chave de acesso ao BigQuery. O panorama mostra os dados da última carga.</p>
            </div>
          }
          @if (resultado(); as r) {
            <p class="m-0" role="status">
              Atualizado em {{ r.fim.substring(8, 10) }}/{{ r.fim.substring(5, 7) }} às {{ r.fim.substring(11, 16) }}
              (municípios de {{ r.uf }}{{ r.municipiosNovos ? ', ' + r.municipiosNovos + ' novos' : '' }}).
            </p>
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
        }

        @if (erroSincronizacao()) {
          <div class="alerta alerta-erro" role="alert">
            <app-icone nome="alerta" />
            <p class="m-0">{{ erroSincronizacao() }}</p>
          </div>
        }

        @if (sincronizando()) {
          <app-carregando texto="Consultando a Base dos Dados. Isso pode levar 1 a 2 minutos..." />
        } @else {
          <div>
            <button type="button" class="botao botao-primario" (click)="sincronizar()"
              [disabled]="!status()?.configurada || status()?.emAndamento">
              <app-icone nome="grafico" [tamanho]="18" />Atualizar com a Base dos Dados
            </button>
          </div>
        }
      </section>
    </div>
  `,
})
export class AdminIndicadores implements OnInit {
  private readonly api = inject(Api);
  protected readonly dados = signal<Indicadores | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');

  protected readonly status = signal<StatusSincronizacao | null>(null);
  protected readonly resultado = signal<ResultadoSincronizacao | null>(null);
  protected readonly sincronizando = signal(false);
  protected readonly erroSincronizacao = signal('');
  protected readonly nomes: Record<string, string> = {
    POPULACAO: 'População',
    SALDO_EMPREGO_FORMAL: 'Saldo de empregos formais',
    FAMILIAS_BOLSA_FAMILIA: 'Famílias no Bolsa Família',
    VALOR_BOLSA_FAMILIA: 'Valor pago pelo Bolsa Família',
    ESTABELECIMENTOS_SUS: 'Estabelecimentos do SUS',
  };

  ngOnInit(): void {
    this.carregar();
    this.carregarStatus();
  }

  protected carregarStatus(): void {
    this.api.statusSincronizacao().subscribe({
      next: (st) => {
        this.status.set(st);
        this.resultado.set(st.ultimaSincronizacao);
        if (st.ultimoErro) this.erroSincronizacao.set(st.ultimoErro);
      },
      error: (e) => this.erroSincronizacao.set(mensagemDeErro(e)),
    });
  }

  protected sincronizar(): void {
    this.sincronizando.set(true);
    this.erroSincronizacao.set('');
    this.api.sincronizarBaseDosDados().subscribe({
      next: (r) => { this.resultado.set(r); this.sincronizando.set(false); this.carregarStatus(); },
      error: (e) => { this.erroSincronizacao.set(mensagemDeErro(e)); this.sincronizando.set(false); },
    });
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
