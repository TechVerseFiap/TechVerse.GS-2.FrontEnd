// Componentes de estado reutilizáveis: carregando, erro e aviso oficial
import { ChangeDetectionStrategy, Component, OnDestroy, input, output, signal } from '@angular/core';
import { Icone } from './icone';

// Aviso que aparece só quando a espera passa de 6 segundos (servidor gratuito acordando)
@Component({
  selector: 'app-dica-lenta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (visivel()) {
    <span class="texto-pequeno texto-suave">O servidor pode estar iniciando. Na primeira vez isso pode levar até 1 minuto.</span>
  }`,
})
export class DicaLenta implements OnDestroy {
  protected readonly visivel = signal(false);
  private readonly timer = setTimeout(() => this.visivel.set(true), 6000);

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}

@Component({
  selector: 'app-carregando',
  imports: [DicaLenta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="estado" role="status" aria-live="polite">
    <span class="spinner" aria-hidden="true"></span>
    <span class="pilha-pequena">
      <span>{{ texto() }}</span>
      <app-dica-lenta />
    </span>
  </div>`,
})
export class Carregando {
  readonly texto = input('Carregando...');
}

@Component({
  selector: 'app-erro',
  imports: [Icone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="alerta alerta-erro" role="alert">
    <app-icone nome="alerta" />
    <div class="pilha-pequena">
      <p class="m-0">{{ mensagem() }}</p>
      @if (podeTentar()) {
        <button type="button" class="botao botao-secundario botao-pequeno" (click)="tentar.emit()">Tentar de novo</button>
      }
    </div>
  </div>`,
})
export class Erro {
  readonly mensagem = input.required<string>();
  readonly podeTentar = input(true);
  readonly tentar = output<void>();
}

@Component({
  selector: 'app-aviso-oficial',
  imports: [Icone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="alerta alerta-atencao" role="note">
    <app-icone nome="info" />
    <p class="m-0">{{ texto() }}</p>
  </div>`,
})
export class AvisoOficial {
  readonly texto = input(
    'Isto é uma orientação. Quem confirma requisitos e direitos é o órgão responsável: confira sempre no canal oficial.',
  );
}
