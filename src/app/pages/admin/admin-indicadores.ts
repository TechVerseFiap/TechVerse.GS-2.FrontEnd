// Painel: indicador de impacto (buscas com orientação encontrada)
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Api, mensagemDeErro } from '../../core/api';
import { Indicadores } from '../../core/models';
import { Carregando, Erro } from '../../shared/estado';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-admin-indicadores',
  imports: [Icone, Carregando, Erro],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .numeros { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .numero { font-size: 2.25rem; font-weight: 700; color: var(--azul); line-height: 1.1; }
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
    </div>
  `,
})
export class AdminIndicadores implements OnInit {
  private readonly api = inject(Api);
  protected readonly dados = signal<Indicadores | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');

  ngOnInit(): void {
    this.carregar();
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
