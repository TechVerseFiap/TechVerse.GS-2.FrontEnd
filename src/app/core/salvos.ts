import { Injectable, computed, signal } from '@angular/core';

export interface ServicoSalvo {
  id: number;
  nome: string;
  categoria: string;
}

// Serviços salvos só neste navegador, sem cadastro (proposta, item 6.6)
@Injectable({ providedIn: 'root' })
export class Salvos {
  private readonly chave = 'cf-salvos';
  readonly itens = signal<ServicoSalvo[]>(this.carregar());
  readonly total = computed(() => this.itens().length);

  estaSalvo(id: number): boolean {
    return this.itens().some((s) => s.id === id);
  }

  alternar(servico: ServicoSalvo): void {
    this.itens.update((lista) =>
      lista.some((s) => s.id === servico.id) ? lista.filter((s) => s.id !== servico.id) : [...lista, servico],
    );
    this.persistir();
  }

  remover(id: number): void {
    this.itens.update((lista) => lista.filter((s) => s.id !== id));
    this.persistir();
  }

  private carregar(): ServicoSalvo[] {
    try {
      return JSON.parse(localStorage.getItem(this.chave) ?? '[]') as ServicoSalvo[];
    } catch {
      return [];
    }
  }

  private persistir(): void {
    try {
      localStorage.setItem(this.chave, JSON.stringify(this.itens()));
    } catch {
    }
  }
}
