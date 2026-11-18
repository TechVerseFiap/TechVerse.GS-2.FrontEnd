// Layout do painel administrativo do catálogo
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Autenticacao } from '../../core/autenticacao';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .sessao {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px;
      margin-top: 20px; padding: 10px 16px; border-radius: var(--raio);
      background: var(--superficie); border: 1px solid var(--borda);
    }
    .sessao p { display: flex; align-items: center; gap: 8px; }
    .admin { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; padding-top: 20px; }
    .admin-menu { flex: 1 1 200px; max-width: 240px; }
    .admin-menu ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
    .admin-menu a {
      display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 12px;
      border-radius: 8px; color: var(--texto); text-decoration: none; font-weight: 700; white-space: nowrap;
    }
    .admin-menu a:hover { background: var(--azul-claro); }
    .admin-menu a.ativo { background: var(--azul); color: #fff; }
    :host-context(.alto-contraste) .admin-menu a.ativo { color: #000; }
    .admin-conteudo { flex: 999 1 560px; min-width: 0; }

    /* Celular: menu vira uma faixa de abas rolável, colada no topo */
    @media (max-width: 720px) {
      .admin { gap: 16px; padding-top: 12px; }
      .admin-menu {
        flex-basis: 100%; max-width: none; padding: 6px; border-radius: 999px;
        position: sticky; top: 0; z-index: 5; overflow-x: auto; scrollbar-width: none;
      }
      .admin-menu::-webkit-scrollbar { display: none; }
      .admin-menu ul { flex-direction: row; gap: 4px; }
      .admin-menu a { min-height: 40px; padding: 0 14px; border-radius: 999px; font-size: 0.9375rem; }
      .admin-conteudo { flex-basis: 100%; }
      .aviso-painel { display: none; }
      .sessao { flex-wrap: nowrap; margin-top: 12px; padding: 4px 6px 4px 14px; font-size: 0.9375rem; }
      .sessao p { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }
  `,
  template: `
    <div class="container">
      <div class="sessao">
        <p class="m-0">
          <app-icone nome="cadeado" [tamanho]="18" />
          <span>Olá, <strong>{{ auth.primeiroNome() }}</strong><span class="texto-suave">&nbsp;· RM {{ auth.usuario()?.rm }}</span></span>
        </p>
        <button type="button" class="botao-texto" (click)="sair()"><app-icone nome="sair" [tamanho]="18" />Sair</button>
      </div>
      <div class="alerta alerta-info aviso-painel" style="margin-top: 12px">
        <app-icone nome="info" />
        <p class="m-0">Painel da equipe que mantém o catálogo. Toda mudança aqui é feita direto na API.</p>
      </div>
      <div class="admin">
        <nav class="admin-menu cartao" aria-label="Menu do painel">
          <ul>
            <li><a routerLink="servicos" routerLinkActive="ativo" ariaCurrentWhenActive="page"><app-icone nome="documentos" [tamanho]="20" />Serviços</a></li>
            <li><a routerLink="categorias" routerLinkActive="ativo" ariaCurrentWhenActive="page"><app-icone nome="categoria" [tamanho]="20" />Categorias</a></li>
            <li><a routerLink="documentos" routerLinkActive="ativo" ariaCurrentWhenActive="page"><app-icone nome="check" [tamanho]="20" />Documentos</a></li>
            <li><a routerLink="indicadores" routerLinkActive="ativo" ariaCurrentWhenActive="page"><app-icone nome="grafico" [tamanho]="20" />Indicadores</a></li>
          </ul>
        </nav>
        <section class="admin-conteudo">
          <router-outlet />
        </section>
      </div>
    </div>
  `,
})
export class AdminLayout {
  protected readonly auth = inject(Autenticacao);
  private readonly router = inject(Router);

  protected sair(): void {
    this.auth.sair();
    this.router.navigateByUrl('/login');
  }
}
