// Layout do painel administrativo do catálogo
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .admin { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; padding-top: 24px; }
    .admin-menu { flex: 1 1 200px; max-width: 240px; }
    .admin-menu ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
    .admin-menu a {
      display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 12px;
      border-radius: 8px; color: var(--texto); text-decoration: none; font-weight: 700;
    }
    .admin-menu a:hover { background: var(--azul-claro); }
    .admin-menu a.ativo { background: var(--azul); color: #fff; }
    :host-context(.alto-contraste) .admin-menu a.ativo { color: #000; }
    .admin-conteudo { flex: 999 1 560px; min-width: 0; }
    @media (max-width: 700px) {
      .admin-menu { max-width: none; }
      .admin-menu ul { flex-direction: row; flex-wrap: wrap; }
    }
  `,
  template: `
    <div class="container">
      <div class="alerta alerta-info" style="margin-top: 20px">
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
export class AdminLayout {}
