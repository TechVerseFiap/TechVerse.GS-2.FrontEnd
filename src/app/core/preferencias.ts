import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

// Acessibilidade: tamanho da letra e alto contraste, salvos no navegador
@Injectable({ providedIn: 'root' })
export class Preferencias {
  private readonly doc = inject(DOCUMENT);

  readonly nivelFonte = signal<number>(ler('cf-fonte', 0));
  readonly altoContraste = signal<boolean>(ler('cf-contraste', 0) === 1);

  constructor() {
    effect(() => {
      const html = this.doc.documentElement;
      html.style.fontSize = ['100%', '112.5%', '125%'][this.nivelFonte()];
      html.classList.toggle('alto-contraste', this.altoContraste());
      gravar('cf-fonte', this.nivelFonte());
      gravar('cf-contraste', this.altoContraste() ? 1 : 0);
    });
  }

  aumentarFonte(): void {
    this.nivelFonte.update((n) => Math.min(2, n + 1));
  }

  diminuirFonte(): void {
    this.nivelFonte.update((n) => Math.max(0, n - 1));
  }

  alternarContraste(): void {
    this.altoContraste.update((v) => !v);
  }
}

// Leitura e gravação seguras no armazenamento do navegador
function ler(chave: string, padrao: number): number {
  try {
    const v = localStorage.getItem(chave);
    return v === null ? padrao : Number(v);
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: number): void {
  try {
    localStorage.setItem(chave, String(valor));
  } catch {
  }
}
