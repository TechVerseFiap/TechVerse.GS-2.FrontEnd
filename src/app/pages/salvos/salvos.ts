// Lista de serviços salvos neste aparelho
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Salvos } from '../../core/salvos';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-salvos',
  imports: [RouterLink, Icone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container secao pilha" style="max-width: 760px">
      <div class="pilha-pequena">
        <h1>Serviços salvos</h1>
        <p class="m-0 texto-suave">Ficam guardados só neste aparelho. Não pedimos cadastro.</p>
      </div>

      @if (salvos.itens().length) {
        <ul class="pilha" style="list-style: none; margin: 0; padding: 0">
          @for (s of salvos.itens(); track s.id) {
            <li class="cartao linha-entre">
              <div class="pilha-pequena">
                <span class="rotulo-sobre">{{ s.categoria }}</span>
                <a class="cartao-titulo" [routerLink]="['/servicos', s.id]">{{ s.nome }}</a>
              </div>
              <button type="button" class="botao botao-perigo botao-pequeno" (click)="salvos.remover(s.id)">
                <app-icone nome="lixeira" [tamanho]="18" />
                Remover<span class="sr-only"> {{ s.nome }}</span>
              </button>
            </li>
          }
        </ul>
      } @else {
        <div class="alerta alerta-info">
          <app-icone nome="info" />
          <p class="m-0">
            Você ainda não salvou nenhum serviço. Use o botão <strong>Salvar para depois</strong> em um serviço para
            encontrá-lo aqui.
          </p>
        </div>
        <div><a class="botao botao-primario" routerLink="/assistente">Falar com o assistente</a></div>
      }
    </div>
  `,
})
export class SalvosPagina {
  protected readonly salvos = inject(Salvos);
}
