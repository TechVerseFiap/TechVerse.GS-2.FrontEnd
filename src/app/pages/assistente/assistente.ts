// Conversa com o assistente e exibição das recomendações
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, mensagemDeErro } from '../../core/api';
import { Categoria, RespostaAssistente } from '../../core/models';
import { Salvos } from '../../core/salvos';
import { AvisoOficial } from '../../shared/estado';
import { Icone } from '../../shared/icone';

interface Troca {
  id: number;
  pergunta: string;
  resposta?: RespostaAssistente;
  erro?: string;
  carregando: boolean;
}

@Component({
  selector: 'app-assistente',
  imports: [RouterLink, Icone, AvisoOficial],
  templateUrl: './assistente.html',
  styleUrl: './assistente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Assistente implements OnInit {
  private readonly api = inject(Api);
  protected readonly salvos = inject(Salvos);

  readonly q = input<string>();

  protected readonly conversa = signal<Troca[]>([]);
  protected readonly texto = signal('');
  protected readonly erroCampo = signal('');
  protected readonly categorias = signal<Categoria[]>([]);
  private readonly campo = viewChild<ElementRef<HTMLTextAreaElement>>('campo');
  private seq = 0;

  // Envia automaticamente a pergunta vinda da página inicial (?q=)
  constructor() {
    effect(() => {
      const pergunta = this.q()?.trim();
      if (pergunta) {
        untracked(() => this.enviar(pergunta));
      }
    });
  }

  ngOnInit(): void {
    this.api.listarCategorias().subscribe({ next: (c) => this.categorias.set(c), error: () => undefined });
  }

  // Valida o campo e envia nova pergunta
  protected submeter(evento?: Event): void {
    evento?.preventDefault();
    const pergunta = this.texto().trim();
    if (pergunta.length < 3) {
      this.erroCampo.set('Escreva pelo menos 3 letras sobre o que você precisa.');
      this.campo()?.nativeElement.focus();
      return;
    }
    this.erroCampo.set('');
    this.texto.set('');
    this.enviar(pergunta);
  }

  // Chama a API e atualiza a conversa
  protected enviar(pergunta: string): void {
    const id = ++this.seq;
    this.conversa.update((c) => [...c, { id, pergunta, carregando: true }]);
    this.api.perguntar(pergunta).subscribe({
      next: (resposta) => this.atualizar(id, { resposta, carregando: false }),
      error: (e) => this.atualizar(id, { erro: mensagemDeErro(e), carregando: false }),
    });
  }

  protected tentarDeNovo(troca: Troca): void {
    this.conversa.update((c) => c.filter((t) => t.id !== troca.id));
    this.enviar(troca.pergunta);
  }

  protected idDaCategoria(nome: string): number | undefined {
    return this.categorias().find((c) => c.nome === nome)?.id;
  }

  protected alternarSalvo(servicoId: number, nome: string, categoria: string): void {
    this.salvos.alternar({ id: servicoId, nome, categoria });
  }

  private atualizar(id: number, dados: Partial<Troca>): void {
    this.conversa.update((c) => c.map((t) => (t.id === id ? { ...t, ...dados } : t)));
  }
}
