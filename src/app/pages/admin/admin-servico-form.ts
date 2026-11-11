// Painel: cadastro e edição de serviço, com requisitos, etapas e documentos
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api, mensagemDeErro } from '../../core/api';
import { Canal, CANAL_ROTULO, Categoria, Documento, ServicoDetalhe, ServicoRequest } from '../../core/models';
import { Carregando, Erro } from '../../shared/estado';
import { Icone } from '../../shared/icone';

function hojeLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const HOJE = hojeLocal();

@Component({
  selector: 'app-admin-servico-form',
  imports: [ReactiveFormsModule, RouterLink, Icone, Carregando, Erro],
  templateUrl: './admin-servico-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .itens { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
    .item { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .item .entrada { flex: 1 1 240px; }
    .ordem { width: 90px; flex: 0 0 90px !important; }
    fieldset { border: none; margin: 0; padding: 0; }
  `,
})
export class AdminServicoForm implements OnInit {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly id = input<string>();
  protected readonly editando = computed(() => !!this.id());

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly todosDocumentos = signal<Documento[]>([]);
  protected readonly servico = signal<ServicoDetalhe | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erroCarga = signal('');
  protected readonly salvando = signal(false);
  protected readonly mensagem = signal('');
  protected readonly erroAcao = signal(false);
  protected readonly tentouEnviar = signal(false);
  protected readonly hoje = HOJE;
  protected readonly canais = Object.entries(CANAL_ROTULO) as [Canal, string][];

  protected readonly documentosDisponiveis = computed(() => {
    const ligados = new Set(this.servico()?.documentos.map((d) => d.documentoId) ?? []);
    return this.todosDocumentos().filter((d) => !ligados.has(d.id));
  });

  // Formulário com as mesmas validações da API
  protected readonly form = this.fb.nonNullable.group({
    categoriaId: [0, [Validators.required, Validators.min(1)]],
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    descricao: ['', [Validators.required, Validators.maxLength(500)]],
    publicoAlvo: ['', [Validators.maxLength(255)]],
    orgaoResponsavel: ['', [Validators.required, Validators.maxLength(120)]],
    canal: ['DIGITAL' as Canal, [Validators.required]],
    urlFonte: ['https://', [Validators.required, Validators.maxLength(255), Validators.pattern(/^https:\/\/[^\s.]+\.[^\s]+$/i)]],
    dataVerificacao: [HOJE, [Validators.required]],
    palavrasChave: ['', [Validators.maxLength(400)]],
  });

  protected readonly novoRequisito = signal('');
  protected readonly novaEtapaOrdem = signal(1);
  protected readonly novaEtapaTexto = signal('');
  protected readonly novoDocumentoId = signal(0);
  protected readonly novaObservacao = signal('');

  ngOnInit(): void {
    this.api.listarCategorias().subscribe({
      next: (c) => {
        this.categorias.set(c);
        if (this.editando()) {
          this.carregarServico();
        } else {
          this.carregando.set(false);
        }
      },
      error: (e) => this.falharCarga(e),
    });
    this.api.listarDocumentos().subscribe({ next: (d) => this.todosDocumentos.set(d), error: () => undefined });
  }

  protected carregarServico(): void {
    this.carregando.set(true);
    this.erroCarga.set('');
    this.api.detalharServico(Number(this.id())).subscribe({
      next: (s) => {
        this.servico.set(s);
        this.form.setValue({
          categoriaId: s.categoria.id,
          nome: s.nome,
          descricao: s.descricao,
          publicoAlvo: s.publicoAlvo ?? '',
          orgaoResponsavel: s.orgaoResponsavel,
          canal: s.canal,
          urlFonte: s.urlFonte,
          dataVerificacao: s.dataVerificacao,
          palavrasChave: s.palavrasChave ?? '',
        });
        this.novaEtapaOrdem.set((s.etapas.at(-1)?.ordem ?? 0) + 1);
        this.carregando.set(false);
      },
      error: (e) => this.falharCarga(e),
    });
  }

  protected erroDe(campo: keyof typeof this.form.controls): string {
    const c = this.form.controls[campo];
    if (!c.errors || !(c.touched || this.tentouEnviar())) return '';
    if (c.errors['required'] || c.errors['min']) return 'Campo obrigatório.';
    if (c.errors['maxlength']) return `Máximo de ${c.errors['maxlength'].requiredLength} caracteres.`;
    if (c.errors['pattern']) return 'Use o link oficial completo, começando com https://';
    return 'Valor inválido.';
  }

  // Envia POST (novo) ou PUT (edição)
  protected salvar(): void {
    this.tentouEnviar.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrar('Revise os campos marcados em vermelho.', true);
      return;
    }
    const v = this.form.getRawValue();
    const body: ServicoRequest = {
      ...v,
      categoriaId: Number(v.categoriaId),
      publicoAlvo: v.publicoAlvo || null,
      palavrasChave: v.palavrasChave || null,
    };
    this.salvando.set(true);
    const chamada = this.editando()
      ? this.api.atualizarServico(Number(this.id()), body)
      : this.api.criarServico(body);
    chamada.subscribe({
      next: (s) => {
        this.salvando.set(false);
        if (this.editando()) {
          this.servico.set(s);
          this.mostrar('Serviço atualizado.', false);
        } else {
          this.router.navigate(['/admin/servicos', s.id]);
        }
      },
      error: (e) => {
        this.salvando.set(false);
        this.mostrar(mensagemDeErro(e), true);
      },
    });
  }

  // Requisitos
  protected adicionarRequisito(): void {
    const texto = this.novoRequisito().trim();
    if (!texto) return this.mostrar('Escreva o requisito antes de adicionar.', true);
    this.api.adicionarRequisito(this.sid(), texto).subscribe({
      next: () => { this.novoRequisito.set(''); this.recarregar('Requisito adicionado.'); },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }
  protected salvarRequisito(id: number, texto: string): void {
    this.api.atualizarRequisito(id, texto).subscribe({
      next: () => this.recarregar('Requisito atualizado.'),
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }
  protected excluirRequisito(id: number): void {
    this.api.excluirRequisito(id).subscribe({
      next: () => this.recarregar('Requisito excluído.'),
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  // Etapas
  protected adicionarEtapa(): void {
    const texto = this.novaEtapaTexto().trim();
    if (!texto) return this.mostrar('Escreva a etapa antes de adicionar.', true);
    this.api.adicionarEtapa(this.sid(), this.novaEtapaOrdem(), texto).subscribe({
      next: () => { this.novaEtapaTexto.set(''); this.recarregar('Etapa adicionada.'); },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }
  protected salvarEtapa(id: number, ordem: string, texto: string): void {
    this.api.atualizarEtapa(id, Number(ordem), texto).subscribe({
      next: () => this.recarregar('Etapa atualizada.'),
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }
  protected excluirEtapa(id: number): void {
    this.api.excluirEtapa(id).subscribe({
      next: () => this.recarregar('Etapa excluída.'),
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  // Documentos
  protected vincularDocumento(): void {
    const documentoId = Number(this.novoDocumentoId());
    if (!documentoId) return this.mostrar('Escolha um documento.', true);
    this.api.vincularDocumento(this.sid(), { documentoId, observacao: this.novaObservacao().trim() || null }).subscribe({
      next: () => { this.novoDocumentoId.set(0); this.novaObservacao.set(''); this.recarregar('Documento vinculado.'); },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }
  protected desvincular(documentoId: number): void {
    this.api.desvincularDocumento(this.sid(), documentoId).subscribe({
      next: () => this.recarregar('Documento desvinculado.'),
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  // Apoio
  private sid(): number {
    return Number(this.id());
  }

  private recarregar(msg: string): void {
    this.api.detalharServico(this.sid()).subscribe({
      next: (s) => {
        this.servico.set(s);
        this.novaEtapaOrdem.set((s.etapas.at(-1)?.ordem ?? 0) + 1);
        this.mostrar(msg, false);
      },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  private mostrar(msg: string, erro: boolean): void {
    this.erroAcao.set(erro);
    this.mensagem.set(msg);
  }

  private falharCarga(e: unknown): void {
    this.erroCarga.set(mensagemDeErro(e));
    this.carregando.set(false);
  }
}
