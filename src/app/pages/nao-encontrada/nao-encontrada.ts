// Página para rotas inexistentes
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrada',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container secao pilha" style="max-width: 640px">
      <h1>Página não encontrada</h1>
      <p class="m-0">O endereço pode estar errado ou a página mudou de lugar.</p>
      <div class="linha">
        <a class="botao botao-primario" routerLink="/">Voltar ao início</a>
        <a class="botao botao-secundario" routerLink="/assistente">Falar com o assistente</a>
      </div>
    </div>
  `,
})
export class NaoEncontrada {}
