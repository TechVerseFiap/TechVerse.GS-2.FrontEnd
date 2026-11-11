// Serviços de uma categoria, com filtro local
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, mensagemDeErro } from '../../core/api';
import { CANAL_ROTULO, Categoria, ServicoResumo } from '../../core/models';
import { Carregando, Erro } from '../../shared/estado';
import { Icone, iconeDaCategoria } from '../../shared/icone';

@Component({
  selector: 'app-categoria',
  imports: [RouterLink, Icone, Carregando, Erro],
  templateUrl: './categoria.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriaPagina {
  private readonly api = inject(Api);

  readonly id = input.required<string>();

  protected readonly categoria = signal<Categoria | null>(null);
  protected readonly servicos = signal<ServicoResumo[]>([]);
  protected readonly filtro = signal('');
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly canal = CANAL_ROTULO;
  protected readonly icone = iconeDaCategoria;

  protected readonly filtrados = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    return f
      ? this.servicos().filter((s) => s.nome.toLowerCase().includes(f) || s.descricao.toLowerCase().includes(f))
      : this.servicos();
  });

  constructor() {
    effect(() => {
      const id = Number(this.id());
      untracked(() => this.carregar(id));
    });
  }

  protected carregar(id = Number(this.id())): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.buscarCategoria(id).subscribe({
      next: (c) => {
        this.categoria.set(c);
        this.api.listarServicos({ categoria: id }).subscribe({
          next: (s) => {
            this.servicos.set(s);
            this.carregando.set(false);
          },
          error: (e) => this.falhar(e),
        });
      },
      error: (e) => this.falhar(e),
    });
  }

  private falhar(e: unknown): void {
    this.erro.set(mensagemDeErro(e));
    this.carregando.set(false);
  }
}
