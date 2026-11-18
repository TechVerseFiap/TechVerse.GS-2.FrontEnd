// Panorama da cidade: busca do município e indicadores públicos (IBGE, CAGED, CGU e CNES via Base dos Dados)
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { Api, mensagemDeErro } from '../../core/api';
import { Categoria, Municipio, Panorama, ValorPanorama } from '../../core/models';
import { AvisoOficial, Carregando, Erro } from '../../shared/estado';
import { Icone } from '../../shared/icone';

const CHAVE_CIDADE = 'cf-cidade';

// Ícone e assunto do catálogo ligados a cada indicador
const APOIO: Record<string, { icone: string; categoria?: string; convite?: string }> = {
  POPULACAO: { icone: 'cidade' },
  SALDO_EMPREGO_FORMAL: { icone: 'trabalho', categoria: 'Trabalho', convite: 'Ver serviços de trabalho' },
  FAMILIAS_BOLSA_FAMILIA: { icone: 'beneficios', categoria: 'Benefícios', convite: 'Ver serviços de benefícios' },
  VALOR_BOLSA_FAMILIA: { icone: 'beneficios' },
  ESTABELECIMENTOS_SUS: { icone: 'saude', categoria: 'Saúde', convite: 'Ver serviços de saúde' },
};

@Component({
  selector: 'app-panorama',
  imports: [RouterLink, DatePipe, Icone, Carregando, Erro, AvisoOficial],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './panorama.css',
  template: `
    <div class="container">
      <nav class="migalhas" aria-label="Você está em">
        <ol>
          <li><a routerLink="/">Início</a></li>
          <li aria-current="page">Panorama da cidade</li>
        </ol>
      </nav>

      <div class="secao pilha" style="padding-top: 8px">
        <header class="pilha-pequena">
          <h1>Panorama da sua cidade</h1>
          <p class="m-0 descricao">
            Números públicos sobre o seu município: população, empregos com carteira, Bolsa Família e unidades do SUS.
            Ajudam a entender onde você mora. Não pedimos nenhum dado seu.
          </p>
        </header>

        <!-- Busca do município -->
        <form class="cartao pilha busca" role="search" (submit)="$event.preventDefault(); escolherPrimeiro()">
          <label for="busca-cidade" class="rotulo">Nome do município (estado de São Paulo)</label>
          <div class="campo-busca">
            <app-icone nome="busca" [tamanho]="20" />
            <input
              id="busca-cidade"
              class="entrada"
              type="search"
              autocomplete="off"
              maxlength="60"
              placeholder="Ex.: Caieiras"
              [value]="termo()"
              (input)="digitar($any($event.target).value)"
              aria-describedby="busca-ajuda"
              aria-controls="resultados-cidade"
            />
          </div>
          <span id="busca-ajuda" class="campo-ajuda">Digite pelo menos 2 letras. Acentos são opcionais.</span>

          <p class="sr-only" role="status" aria-live="polite">{{ statusBusca() }}</p>
          @if (erroBusca()) {
            <p class="m-0 campo-erro">{{ erroBusca() }}</p>
          }
          @if (resultados().length) {
            <ul id="resultados-cidade" class="resultados" aria-label="Municípios encontrados">
              @for (m of resultados(); track m.codigoIbge) {
                <li>
                  <button type="button" class="resultado" (click)="escolher(m)">
                    <app-icone nome="local" [tamanho]="18" />
                    <span>{{ m.nome }}<span class="texto-suave"> - {{ m.uf }}</span></span>
                  </button>
                </li>
              }
            </ul>
          } @else if (semResultado()) {
            <p class="m-0 texto-suave">Nenhum município encontrado com "{{ termo() }}". Confira a grafia.</p>
          }
        </form>

        <!-- Indicadores -->
        @if (carregando()) {
          <app-carregando texto="Buscando os números da cidade..." />
        } @else if (erro()) {
          <app-erro [mensagem]="erro()" (tentar)="carregar(codigoAtual()!)" />
        } @else if (panorama(); as p) {
          <section class="pilha" aria-labelledby="t-cidade">
            <div class="linha-entre">
              <div class="pilha-pequena">
                <h2 id="t-cidade">{{ p.municipio.nome }} - {{ p.municipio.uf }}</h2>
                <p class="m-0 texto-pequeno texto-suave">Código IBGE {{ p.municipio.codigoIbge }}</p>
              </div>
            </div>

            <ul class="indicadores">
              @for (v of p.indicadores; track v.codigo) {
                <li class="cartao indicador">
                  <div class="linha" style="gap: 10px; flex-wrap: nowrap">
                    <span class="indicador-icone"><app-icone [nome]="apoio(v).icone" [tamanho]="24" /></span>
                    <h3 class="m-0 indicador-nome">{{ v.nome }}</h3>
                  </div>
                  <p class="m-0 indicador-valor">
                    {{ formatar(v) }}
                    @if (v.unidade !== 'reais') { <span class="indicador-unidade">{{ v.unidade }}</span> }
                  </p>
                  <p class="m-0 texto-pequeno"><span class="chip chip-neutro chip-mini">{{ rotuloPeriodo(v) }}</span></p>
                  <p class="m-0 texto-pequeno texto-suave">{{ v.descricao }}</p>
                  <p class="m-0 texto-pequeno fonte">
                    <app-icone nome="check" [tamanho]="16" />
                    <span>
                      Fonte: <a [href]="v.urlFonte" target="_blank" rel="noopener noreferrer">{{ v.fonte }}<span class="sr-only"> (abre em nova aba)</span></a>
                      · consultado em {{ v.dataConsulta | date: 'dd/MM/yyyy' }}
                    </span>
                  </p>
                  @if (linkCategoria(v); as l) {
                    <a class="botao-texto convite" [routerLink]="['/categorias', l.id]">
                      {{ l.texto }} <app-icone nome="seta" [tamanho]="16" />
                    </a>
                  }
                </li>
              }
            </ul>

            <app-aviso-oficial [texto]="p.aviso" />
          </section>
        } @else {
          <div class="cartao pilha-pequena vazio">
            <app-icone nome="cidade" [tamanho]="32" />
            <p class="m-0"><strong>Escolha um município para ver o panorama.</strong></p>
            <p class="m-0 texto-suave texto-pequeno">Os dados cobrem os 645 municípios do estado de São Paulo.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class PanoramaPagina implements OnInit, OnDestroy {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  // Município vindo da URL (?cidade=3509007), para o link poder ser compartilhado
  readonly cidade = input<string>();

  protected readonly termo = signal('');
  protected readonly resultados = signal<Municipio[]>([]);
  protected readonly semResultado = signal(false);
  protected readonly erroBusca = signal('');
  protected readonly panorama = signal<Panorama | null>(null);
  protected readonly carregando = signal(false);
  protected readonly erro = signal('');
  protected readonly codigoAtual = signal<number | null>(null);
  private readonly categorias = signal<Categoria[]>([]);

  protected readonly statusBusca = computed(() => {
    if (this.resultados().length) return `${this.resultados().length} município(s) encontrado(s).`;
    if (this.semResultado()) return 'Nenhum município encontrado.';
    return '';
  });

  private readonly digitacao = new Subject<string>();
  private assinatura?: Subscription;

  private readonly moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  private readonly inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  private readonly comSinal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0, signDisplay: 'exceptZero' });

  ngOnInit(): void {
    // Busca enquanto digita, esperando uma pausa curta para não chamar a API a cada letra
    this.assinatura = this.digitacao
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((t) => {
          if (t.length < 2) return of<Municipio[] | null>(null);
          return this.api.buscarMunicipios(t).pipe(
            catchError((e) => { this.erroBusca.set(mensagemDeErro(e)); return of<Municipio[]>([]); }),
          );
        }),
      )
      .subscribe((lista) => {
        this.resultados.set(lista ?? []);
        this.semResultado.set(lista !== null && lista.length === 0 && !this.erroBusca());
      });

    this.api.listarCategorias().subscribe({ next: (c) => this.categorias.set(c), error: () => undefined });

    const codigo = Number(this.cidade()) || Number(lerCidadeSalva()) || 0;
    if (codigo) this.carregar(codigo);
  }

  ngOnDestroy(): void {
    this.assinatura?.unsubscribe();
  }

  protected digitar(valor: string): void {
    this.termo.set(valor);
    this.erroBusca.set('');
    this.digitacao.next(valor.trim());
  }

  protected escolherPrimeiro(): void {
    const primeiro = this.resultados()[0];
    if (primeiro) this.escolher(primeiro);
  }

  protected escolher(m: Municipio): void {
    this.resultados.set([]);
    this.semResultado.set(false);
    this.termo.set(m.nome);
    this.router.navigate([], { queryParams: { cidade: m.codigoIbge }, replaceUrl: true });
    this.carregar(m.codigoIbge);
  }

  protected carregar(codigo: number): void {
    this.codigoAtual.set(codigo);
    this.carregando.set(true);
    this.erro.set('');
    this.api.panorama(codigo).subscribe({
      next: (p) => {
        this.panorama.set(p);
        this.carregando.set(false);
        salvarCidade(codigo);
      },
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }

  protected apoio(v: ValorPanorama) {
    return APOIO[v.codigo] ?? { icone: 'grafico' };
  }

  protected formatar(v: ValorPanorama): string {
    if (v.unidade === 'reais') return this.moeda.format(v.valor);
    if (v.codigo === 'SALDO_EMPREGO_FORMAL') return this.comSinal.format(v.valor);
    return this.inteiro.format(v.valor);
  }

  protected rotuloPeriodo(v: ValorPanorama): string {
    return v.periodo.includes('/') ? `Mês de referência: ${v.periodo}` : `Ano de referência: ${v.periodo}`;
  }

  protected linkCategoria(v: ValorPanorama): { id: number; texto: string } | null {
    const a = this.apoio(v);
    if (!a.categoria) return null;
    const c = this.categorias().find((x) => x.nome === a.categoria);
    return c ? { id: c.id, texto: a.convite ?? `Ver ${c.nome}` } : null;
  }
}

// O último município escolhido fica só neste aparelho
function lerCidadeSalva(): string | null {
  try {
    return localStorage.getItem(CHAVE_CIDADE);
  } catch {
    return null;
  }
}

function salvarCidade(codigo: number): void {
  try {
    localStorage.setItem(CHAVE_CIDADE, String(codigo));
  } catch {
    // Sem armazenamento disponível: segue sem lembrar a cidade
  }
}
