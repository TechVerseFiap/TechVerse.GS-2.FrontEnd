// Detalhe do serviço: requisitos, checklist de documentos, etapas e fonte oficial
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, mensagemDeErro } from '../../core/api';
import { CANAL_ROTULO, ServicoDetalhe } from '../../core/models';
import { Salvos } from '../../core/salvos';
import { AvisoOficial, Carregando, Erro } from '../../shared/estado';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-servico',
  imports: [RouterLink, DatePipe, Icone, Carregando, Erro, AvisoOficial],
  templateUrl: './servico.html',
  styleUrl: './servico.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicoPagina {
  private readonly api = inject(Api);
  protected readonly salvos = inject(Salvos);

  readonly id = input.required<string>();

  protected readonly servico = signal<ServicoDetalhe | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly separados = signal<Set<number>>(new Set());
  protected readonly canal = CANAL_ROTULO;

  protected readonly progresso = computed(() => {
    const total = this.servico()?.documentos.length ?? 0;
    return { feitos: this.separados().size, total };
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
    this.separados.set(new Set());
    this.api.detalharServico(id).subscribe({
      next: (s) => {
        this.servico.set(s);
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }

  // Checklist de documentos (só nesta tela)
  protected marcar(documentoId: number, marcado: boolean): void {
    this.separados.update((atual) => {
      const novo = new Set(atual);
      if (marcado) novo.add(documentoId);
      else novo.delete(documentoId);
      return novo;
    });
  }

  protected alternarSalvo(s: ServicoDetalhe): void {
    this.salvos.alternar({ id: s.id, nome: s.nome, categoria: s.categoria.nome });
  }

  protected dominio(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
}
