import { Injectable, computed, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

// Login SIMULADO do painel (projeto acadêmico): usuários fixos do time, sem validação no servidor
export interface Integrante {
  rm: string;
  nome: string;
}

export const EQUIPE: readonly Integrante[] = [
  { rm: '566223', nome: 'Davi Marques de Andrade Munhoz' },
  { rm: '562559', nome: 'Diogo Oliveira Lima' },
  { rm: '566539', nome: 'Leandro Simoneli da Silva' },
  { rm: '562414', nome: 'Lucas dos Reis Aquino' },
  { rm: '565356', nome: 'Lucas Perez Bonato' },
];

// Senha única de demonstração, publicada no README (não é senha real de ninguém)
const SENHA_DEMO = 'techverse2026';
const CHAVE = 'cf-sessao-painel';

@Injectable({ providedIn: 'root' })
export class Autenticacao {
  readonly usuario = signal<Integrante | null>(lerSessao());
  readonly logado = computed(() => this.usuario() !== null);
  readonly primeiroNome = computed(() => this.usuario()?.nome.split(' ')[0] ?? '');

  // Confere RM e senha; aceita o RM com ou sem as letras "RM"
  entrar(rm: string, senha: string): boolean {
    const numero = rm.replace(/\D/g, '');
    const integrante = EQUIPE.find((i) => i.rm === numero);
    if (!integrante || senha !== SENHA_DEMO) return false;
    this.usuario.set(integrante);
    gravarSessao(integrante.rm);
    return true;
  }

  sair(): void {
    this.usuario.set(null);
    gravarSessao(null);
  }
}

// Guarda das rotas do painel: sem login, vai para /login e volta depois
export const exigeLogin: CanActivateFn = (_rota, estado) => {
  if (inject(Autenticacao).logado()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { voltar: estado.url } });
};

// Sessão guardada só enquanto a aba estiver aberta
function lerSessao(): Integrante | null {
  try {
    const rm = sessionStorage.getItem(CHAVE);
    return EQUIPE.find((i) => i.rm === rm) ?? null;
  } catch {
    return null;
  }
}

function gravarSessao(rm: string | null): void {
  try {
    if (rm) sessionStorage.setItem(CHAVE, rm);
    else sessionStorage.removeItem(CHAVE);
  } catch {
  }
}
