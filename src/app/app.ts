// Componente raiz: barra de acessibilidade, cabeçalho, menu e rodapé
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { Preferencias } from './core/preferencias';
import { Salvos } from './core/salvos';
import { Icone } from './shared/icone';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icone],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly prefs = inject(Preferencias);
  protected readonly salvos = inject(Salvos);
  protected readonly modoDemo = environment.useMock;
}
