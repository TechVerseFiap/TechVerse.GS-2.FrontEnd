import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Ícones SVG inline (decorativos)
const PATHS: Record<string, string> = {
  busca: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  trabalho: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
  educacao: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  documentos: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M14 10h4M14 14h4M6 16c.8-1.6 5.2-1.6 6 0"/>',
  beneficios: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  saude: '<path d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="4"/>',
  categoria: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  seta: '<path d="M9 6l6 6-6 6"/>',
  voltar: '<path d="M15 6l-6 6 6 6"/>',
  enviar: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  externo: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/>',
  alerta: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17v.01"/>',
  salvar: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  contraste: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/>',
  editar: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  lixeira: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  grafico: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
};

@Component({
  selector: 'app-icone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', style: 'display:inline-flex;flex-shrink:0' },
  template: `<svg
    [attr.width]="tamanho()"
    [attr.height]="tamanho()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    focusable="false"
    [innerHTML]="svg()"
  ></svg>`,
})
export class Icone {
  private readonly sanitizer = inject(DomSanitizer);
  readonly nome = input.required<string>();
  readonly tamanho = input<number>(22);
  protected readonly svg = computed(() => this.sanitizer.bypassSecurityTrustHtml(PATHS[this.nome()] ?? ''));
}

// Escolhe o ícone pelo nome da categoria
export function iconeDaCategoria(nome: string): string {
  const n = nome.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  if (n.includes('trabalh')) return 'trabalho';
  if (n.includes('educa')) return 'educacao';
  if (n.includes('document')) return 'documentos';
  if (n.includes('benef')) return 'beneficios';
  if (n.includes('saude')) return 'saude';
  return 'categoria';
}
