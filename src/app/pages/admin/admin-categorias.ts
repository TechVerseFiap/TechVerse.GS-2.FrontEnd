// Painel: CRUD de categorias
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Api, mensagemDeErro } from '../../core/api';
import { Categoria } from '../../core/models';
import { Carregando, Erro } from '../../shared/estado';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-admin-categorias',
  imports: [Icone, Carregando, Erro],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pilha">
      <h1>Categorias</h1>

      @if (mensagem()) {
        <div class="alerta" [class.alerta-sucesso]="!erroAcao()" [class.alerta-erro]="erroAcao()" role="status" aria-live="polite">
          <app-icone [nome]="erroAcao() ? 'alerta' : 'check'" />
          <p class="m-0">{{ mensagem() }}</p>
        </div>
      }

      <form class="cartao pilha" (submit)="salvar($event)" novalidate>
        <h2>{{ editandoId() ? 'Editar categoria' : 'Nova categoria' }}</h2>
        <div class="grade-form">
          <div class="campo">
            <label for="c-nome">Nome *</label>
            <input id="c-nome" class="entrada" maxlength="60" [value]="nome()" (input)="nome.set($any($event.target).value)" />
          </div>
          <div class="campo">
            <label for="c-desc">Descrição</label>
            <input id="c-desc" class="entrada" maxlength="255" [value]="descricao()" (input)="descricao.set($any($event.target).value)" />
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
          <table class="tabela">
            <caption class="sr-only">Categorias cadastradas</caption>
            <thead><tr><th scope="col">Nome</th><th scope="col">Descrição</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead>
            <tbody>
              @for (c of itens(); track c.id) {
                <tr>
                  <td><strong>{{ c.nome }}</strong></td>
                  <td>{{ c.descricao }}</td>
                  <td>
                    <div class="linha" style="gap: 4px; flex-wrap: nowrap">
                      <button type="button" class="botao-texto" (click)="editar(c)">Editar<span class="sr-only"> {{ c.nome }}</span></button>
                      @if (confirmando() === c.id) {
                        <button type="button" class="botao botao-perigo-cheio botao-pequeno" (click)="excluir(c)">Confirmar</button>
                        <button type="button" class="botao-texto" (click)="confirmando.set(null)">Cancelar</button>
                      } @else {
                        <button type="button" class="botao-texto" style="color: var(--vermelho)" (click)="confirmando.set(c.id)">Excluir<span class="sr-only"> {{ c.nome }}</span></button>
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
export class AdminCategorias implements OnInit {
  private readonly api = inject(Api);
  protected readonly itens = signal<Categoria[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');
  protected readonly erroAcao = signal(false);
  protected readonly confirmando = signal<number | null>(null);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly nome = signal('');
  protected readonly descricao = signal('');

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.listarCategorias().subscribe({
      next: (c) => { this.itens.set(c); this.carregando.set(false); },
      error: (e) => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }

  protected editar(c: Categoria): void {
    this.editandoId.set(c.id);
    this.nome.set(c.nome);
    this.descricao.set(c.descricao ?? '');
  }

  protected limpar(): void {
    this.editandoId.set(null);
    this.nome.set('');
    this.descricao.set('');
  }

  protected salvar(ev: Event): void {
    ev.preventDefault();
    if (!this.nome().trim()) return this.mostrar('O nome é obrigatório.', true);
    const body = { nome: this.nome().trim(), descricao: this.descricao().trim() || null };
    const id = this.editandoId();
    (id ? this.api.atualizarCategoria(id, body) : this.api.criarCategoria(body)).subscribe({
      next: () => { this.mostrar(id ? 'Categoria atualizada.' : 'Categoria criada.', false); this.limpar(); this.carregar(); },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  protected excluir(c: Categoria): void {
    this.confirmando.set(null);
    this.api.excluirCategoria(c.id).subscribe({
      next: () => { this.mostrar(`Categoria "${c.nome}" excluída.`, false); this.carregar(); },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  private mostrar(msg: string, erro: boolean): void {
    this.erroAcao.set(erro);
    this.mensagem.set(msg);
  }
}
