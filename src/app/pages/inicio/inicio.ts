// Página inicial: pergunta livre, categorias e serviços em destaque
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api, mensagemDeErro } from '../../core/api';
import { Categoria, ServicoResumo } from '../../core/models';
import { Carregando, Erro } from '../../shared/estado';
import { Icone, iconeDaCategoria } from '../../shared/icone';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, Icone, Carregando, Erro],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio implements OnInit {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  protected readonly pergunta = signal('');
  protected readonly erroPergunta = signal('');
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly destaques = signal<ServicoResumo[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly icone = iconeDaCategoria;

  protected readonly exemplos = [
    'Perdi o emprego',
    'Quero um curso gratuito',
    'Preciso tirar a identidade',
    'Como entrar no CadÚnico',
  ];

  ngOnInit(): void {
    this.carregar();
  }

  // Carrega categorias e serviços em destaque
  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.listarCategorias().subscribe({
      next: (cats) => {
        this.categorias.set(cats);
        this.api.listarServicos().subscribe({
          next: (servs) => {
            this.destaques.set(servs.slice(0, 3));
            this.carregando.set(false);
          },
          error: (e) => this.falhar(e),
        });
      },
      error: (e) => this.falhar(e),
    });
  }

  // Valida a pergunta e abre o assistente
  protected perguntar(evento?: Event): void {
    evento?.preventDefault();
    const texto = this.pergunta().trim();
    if (texto.length < 3) {
      this.erroPergunta.set('Escreva pelo menos 3 letras sobre o que você precisa.');
      return;
    }
    this.erroPergunta.set('');
    this.router.navigate(['/assistente'], { queryParams: { q: texto } });
  }

  protected usarExemplo(texto: string): void {
    this.router.navigate(['/assistente'], { queryParams: { q: texto } });
  }

  private falhar(e: unknown): void {
    this.erro.set(mensagemDeErro(e));
    this.carregando.set(false);
  }
}
