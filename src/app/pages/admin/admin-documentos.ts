// Painel: CRUD de documentos
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Api, mensagemDeErro } from '../../core/api';
import { Documento } from '../../core/models';
import { Carregando, Erro } from '../../shared/estado';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-admin-documentos',
  imports: [Icone, Carregando, Erro],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pilha">
      <div class="pilha-pequena">
        <h1>Documentos</h1>
        <p class="m-0 texto-suave">Tipos de documento que os serviços podem pedir. Não guardamos documentos de pessoas.</p>
      </div>

      @if (mensagem()) {
        <div class="alerta" [class.alerta-sucesso]="!erroAcao()" [class.alerta-erro]="erroAcao()" role="status" aria-live="polite">
          <app-icone [nome]="erroAcao() ? 'alerta' : 'check'" />
          <p class="m-0">{{ mensagem() }}</p>
        </div>
      }

      <form class="cartao pilha" (submit)="salvar($event)" novalidate>
        <h2>{{ editandoId() ? 'Editar documento' : 'Novo documento' }}</h2>
        <div class="grade-form">
          <div class="campo">
            <label for="d-nome">Nome *</label>
            <input id="d-nome" class="entrada" maxlength="100" [value]="nome()" (input)="nome.set($any($event.target).value)" />
          </div>
          <div class="campo">
            <label for="d-desc">Para que serve (linguagem simples)</label>
            <input id="d-desc" class="entrada" maxlength="300" [value]="descricao()" (input)="descricao.set($any($event.target).value)" />
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
            <caption class="sr-only">Documentos cadastrados</caption>
            <thead><tr><th scope="col">Nome</th><th scope="col">Para que serve</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead>
            <tbody>
              @for (d of itens(); track d.id) {
                <tr>
                  <td><strong>{{ d.nome }}</strong></td>
                  <td>{{ d.descricao }}</td>
                  <td>
                    <div class="linha" style="gap: 4px; flex-wrap: nowrap">
                      <button type="button" class="botao-texto" (click)="editar(d)">Editar<span class="sr-only"> {{ d.nome }}</span></button>
                      @if (confirmando() === d.id) {
                        <button type="button" class="botao botao-perigo-cheio botao-pequeno" (click)="excluir(d)">Confirmar</button>
                        <button type="button" class="botao-texto" (click)="confirmando.set(null)">Cancelar</button>
                      } @else {
                        <button type="button" class="botao-texto" style="color: var(--vermelho)" (click)="confirmando.set(d.id)">Excluir<span class="sr-only"> {{ d.nome }}</span></button>
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
export class AdminDocumentos implements OnInit {
  private readonly api = inject(Api);
  protected readonly itens = signal<Documento[]>([]);
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
    this.api.listarDocumentos().subscribe({
      next: (d) => { this.itens.set(d); this.carregando.set(false); },
      error: (e) => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }

  protected editar(d: Documento): void {
    this.editandoId.set(d.id);
    this.nome.set(d.nome);
    this.descricao.set(d.descricao ?? '');
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
    (id ? this.api.atualizarDocumento(id, body) : this.api.criarDocumento(body)).subscribe({
      next: () => { this.mostrar(id ? 'Documento atualizado.' : 'Documento criado.', false); this.limpar(); this.carregar(); },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  protected excluir(d: Documento): void {
    this.confirmando.set(null);
    this.api.excluirDocumento(d.id).subscribe({
      next: () => { this.mostrar(`Documento "${d.nome}" excluído.`, false); this.carregar(); },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  private mostrar(msg: string, erro: boolean): void {
    this.erroAcao.set(erro);
    this.mensagem.set(msg);
  }
}
