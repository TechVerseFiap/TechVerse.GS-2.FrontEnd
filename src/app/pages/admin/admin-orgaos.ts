// Painel: CRUD dos órgãos responsáveis pelos serviços
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Api, mensagemDeErro } from '../../core/api';
import { ESFERA_ROTULO, Esfera, Orgao } from '../../core/models';
import { Carregando, Erro } from '../../shared/estado';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-admin-orgaos',
  imports: [Icone, Carregando, Erro],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pilha">
      <h1>Órgãos responsáveis</h1>
      <p class="m-0 texto-suave">Quem presta cada serviço. Um órgão com serviços ligados não pode ser excluído.</p>

      @if (mensagem()) {
        <div class="alerta" [class.alerta-sucesso]="!erroAcao()" [class.alerta-erro]="erroAcao()" role="status" aria-live="polite">
          <app-icone [nome]="erroAcao() ? 'alerta' : 'check'" />
          <p class="m-0">{{ mensagem() }}</p>
        </div>
      }

      <form class="cartao pilha" (submit)="salvar($event)" novalidate>
        <h2>{{ editandoId() ? 'Editar órgão' : 'Novo órgão' }}</h2>
        <div class="campo">
          <label for="o-nome">Nome *</label>
          <input id="o-nome" class="entrada" maxlength="150" [value]="nome()" (input)="nome.set($any($event.target).value)" />
        </div>
        <div class="grade-form">
          <div class="campo">
            <label for="o-sigla">Sigla *</label>
            <input id="o-sigla" class="entrada" maxlength="20" placeholder="Ex.: MTE" [value]="sigla()" (input)="sigla.set($any($event.target).value)" />
          </div>
          <div class="campo">
            <label for="o-esfera">Esfera *</label>
            <select id="o-esfera" class="entrada" [value]="esfera()" (change)="esfera.set($any($event.target).value)">
              @for (e of esferas; track e[0]) {
                <option [value]="e[0]">{{ e[1] }}</option>
              }
            </select>
          </div>
        </div>
        <div class="linha">
          <button type="submit" class="botao botao-primario">{{ editandoId() ? 'Salvar alterações' : 'Adicionar' }}</button>
          @if (editandoId()) {
            <button type="button" class="botao botao-secundario" (click)="limpar()">Cancelar edição</button>
          }
        </div>
      </form>

      @if (carregando()) {
        <app-carregando />
      } @else if (erro()) {
        <app-erro [mensagem]="erro()" (tentar)="carregar()" />
      } @else {
        <div class="tabela-caixa">
          <table class="tabela tabela-responsiva">
            <caption class="sr-only">Órgãos cadastrados</caption>
            <thead><tr><th scope="col">Nome</th><th scope="col">Sigla</th><th scope="col">Esfera</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead>
            <tbody>
              @for (o of itens(); track o.id) {
                <tr>
                  <td data-label="Nome"><strong>{{ o.nome }}</strong></td>
                  <td data-label="Sigla">{{ o.sigla }}</td>
                  <td data-label="Esfera">{{ rotuloEsfera[o.esfera] }}</td>
                  <td class="celula-acoes">
                    <div class="linha" style="gap: 4px; flex-wrap: nowrap">
                      <button type="button" class="botao-texto" (click)="editar(o)">Editar<span class="sr-only"> {{ o.nome }}</span></button>
                      @if (confirmando() === o.id) {
                        <button type="button" class="botao botao-perigo-cheio botao-pequeno" (click)="excluir(o)">Confirmar</button>
                        <button type="button" class="botao-texto" (click)="confirmando.set(null)">Cancelar</button>
                      } @else {
                        <button type="button" class="botao-texto" style="color: var(--vermelho)" (click)="confirmando.set(o.id)">Excluir<span class="sr-only"> {{ o.nome }}</span></button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AdminOrgaos implements OnInit {
  private readonly api = inject(Api);
  protected readonly esferas = Object.entries(ESFERA_ROTULO) as [Esfera, string][];
  protected readonly rotuloEsfera = ESFERA_ROTULO;
  protected readonly itens = signal<Orgao[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');
  protected readonly erroAcao = signal(false);
  protected readonly confirmando = signal<number | null>(null);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly nome = signal('');
  protected readonly sigla = signal('');
  protected readonly esfera = signal<Esfera>('FEDERAL');

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.listarOrgaos().subscribe({
      next: (o) => { this.itens.set([...o].sort((a, b) => a.nome.localeCompare(b.nome))); this.carregando.set(false); },
      error: (e) => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }

  protected editar(o: Orgao): void {
    this.editandoId.set(o.id);
    this.nome.set(o.nome);
    this.sigla.set(o.sigla);
    this.esfera.set(o.esfera);
  }

  protected limpar(): void {
    this.editandoId.set(null);
    this.nome.set('');
    this.sigla.set('');
    this.esfera.set('FEDERAL');
  }

  protected salvar(ev: Event): void {
    ev.preventDefault();
    if (!this.nome().trim() || !this.sigla().trim()) return this.mostrar('Nome e sigla são obrigatórios.', true);
    const body = { nome: this.nome().trim(), sigla: this.sigla().trim().toUpperCase(), esfera: this.esfera() };
    const id = this.editandoId();
    (id ? this.api.atualizarOrgao(id, body) : this.api.criarOrgao(body)).subscribe({
      next: () => { this.mostrar(id ? 'Órgão atualizado.' : 'Órgão cadastrado.', false); this.limpar(); this.carregar(); },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  protected excluir(o: Orgao): void {
    this.confirmando.set(null);
    this.api.excluirOrgao(o.id).subscribe({
      next: () => { this.mostrar(`Órgão "${o.nome}" excluído.`, false); this.carregar(); },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  private mostrar(msg: string, erro: boolean): void {
    this.erroAcao.set(erro);
    this.mensagem.set(msg);
  }
}
