// Painel: lista e exclusão de serviços
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, mensagemDeErro } from '../../core/api';
import { CANAL_ROTULO, ServicoResumo } from '../../core/models';
import { Carregando, Erro } from '../../shared/estado';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-admin-servicos',
  imports: [RouterLink, Icone, Carregando, Erro],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pilha">
      <div class="linha-entre">
        <div class="pilha-pequena">
          <h1>Serviços</h1>
          <p class="m-0 texto-suave">Toda orientação precisa de fonte oficial e data de verificação.</p>
        </div>
        <a class="botao botao-primario" routerLink="novo"><app-icone nome="mais" [tamanho]="18" />Novo serviço</a>
      </div>

      @if (mensagem()) {
        <div class="alerta" [class.alerta-sucesso]="!erroAcao()" [class.alerta-erro]="erroAcao()" role="status">
          <app-icone [nome]="erroAcao() ? 'alerta' : 'check'" />
          <p class="m-0">{{ mensagem() }}</p>
        </div>
      }

      @if (carregando()) {
        <app-carregando />
      } @else if (erro()) {
        <app-erro [mensagem]="erro()" (tentar)="carregar()" />
      } @else {
        <div class="tabela-caixa">
          <table class="tabela">
            <caption class="sr-only">Serviços cadastrados no catálogo</caption>
            <thead>
              <tr>
                <th scope="col">Serviço</th>
                <th scope="col">Categoria</th>
                <th scope="col">Canal</th>
                <th scope="col">Situação</th>
                <th scope="col"><span class="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              @for (s of servicos(); track s.id) {
                <tr>
                  <td><strong>{{ s.nome }}</strong></td>
                  <td>{{ s.categoria }}</td>
                  <td>{{ canal[s.canal] }}</td>
                  <td>
                    @if (s.precisaReverificacao) {
                      <span class="chip chip-atencao">Reverificar fonte</span>
                    } @else {
                      <span class="chip chip-neutro">Em dia</span>
                    }
                  </td>
                  <td>
                    @if (confirmando() === s.id) {
                      <div class="linha" style="gap: 6px; flex-wrap: nowrap">
                        <button type="button" class="botao botao-perigo-cheio botao-pequeno" (click)="excluir(s)">Confirmar exclusão</button>
                        <button type="button" class="botao-texto" (click)="confirmando.set(null)">Cancelar</button>
                      </div>
                    } @else {
                      <div class="linha" style="gap: 4px; flex-wrap: nowrap">
                        <a class="botao-texto" [routerLink]="[s.id]"><app-icone nome="editar" [tamanho]="18" />Editar<span class="sr-only"> {{ s.nome }}</span></a>
                        <button type="button" class="botao-texto" style="color: var(--vermelho)" (click)="confirmando.set(s.id)">
                          <app-icone nome="lixeira" [tamanho]="18" />Excluir<span class="sr-only"> {{ s.nome }}</span>
                        </button>
                      </div>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5">Nenhum serviço cadastrado.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AdminServicos implements OnInit {
  private readonly api = inject(Api);
  protected readonly servicos = signal<ServicoResumo[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');
  protected readonly erroAcao = signal(false);
  protected readonly confirmando = signal<number | null>(null);
  protected readonly canal = CANAL_ROTULO;

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.listarServicos().subscribe({
      next: (s) => {
        this.servicos.set(s);
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }

  protected excluir(s: ServicoResumo): void {
    this.confirmando.set(null);
    this.api.excluirServico(s.id).subscribe({
      next: () => {
        this.erroAcao.set(false);
        this.mensagem.set(`Serviço "${s.nome}" excluído.`);
        this.servicos.update((l) => l.filter((x) => x.id !== s.id));
      },
      error: (e) => {
        this.erroAcao.set(true);
        this.mensagem.set(mensagemDeErro(e));
      },
    });
  }
}
