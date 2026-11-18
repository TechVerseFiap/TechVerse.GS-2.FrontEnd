// Tela de login (simulado) para acessar o painel do catálogo
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Autenticacao } from '../../core/autenticacao';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, Icone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .caixa { max-width: 440px; margin: 32px auto 0; }
    .topo { display: flex; align-items: center; gap: 12px; }
    .selo {
      width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--azul-claro); color: var(--azul);
    }
    .senha { position: relative; }
    .senha .entrada { width: 100%; padding-right: 56px; }
    .mostrar {
      position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
      width: 44px; height: 44px; border: 0; border-radius: 8px;
      background: transparent; color: var(--azul); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .mostrar[aria-pressed='true'] { background: var(--azul-claro); }
    .botao { width: 100%; }
  `,
  template: `
    <div class="container">
      <div class="caixa cartao pilha">
        <div class="topo">
          <span class="selo"><app-icone nome="cadeado" [tamanho]="26" /></span>
          <div class="pilha-pequena">
            <h1 style="font-size: 1.5rem">Entrar no painel</h1>
            <p class="m-0 texto-suave texto-pequeno">Área da equipe que mantém o catálogo.</p>
          </div>
        </div>

        @if (falhou()) {
          <div #alertaErro class="alerta alerta-erro" role="alert" tabindex="-1">
            <app-icone nome="alerta" />
            <p class="m-0">RM ou senha incorretos. Confira e tente de novo.</p>
          </div>
        }

        <form class="pilha" [formGroup]="form" (ngSubmit)="entrar()" novalidate>
          <div class="campo">
            <label for="login-rm">RM</label>
            <input id="login-rm" class="entrada" formControlName="rm" inputmode="numeric" autocomplete="username"
              maxlength="10" placeholder="Ex.: 566539"
              [attr.aria-invalid]="invalido('rm')" [attr.aria-describedby]="invalido('rm') ? 'erro-rm' : null" />
            @if (invalido('rm')) {
              <span id="erro-rm" class="campo-erro">Informe o seu RM.</span>
            }
          </div>

          <div class="campo">
            <label for="login-senha">Senha</label>
            <div class="senha">
              <input id="login-senha" class="entrada" formControlName="senha" autocomplete="current-password"
                [type]="mostrarSenha() ? 'text' : 'password'"
                [attr.aria-invalid]="invalido('senha')" [attr.aria-describedby]="invalido('senha') ? 'erro-senha' : null" />
              <button type="button" class="mostrar" (click)="mostrarSenha.set(!mostrarSenha())"
                [attr.aria-pressed]="mostrarSenha()" aria-label="Mostrar senha">
                <app-icone nome="olho" [tamanho]="20" />
              </button>
            </div>
            @if (invalido('senha')) {
              <span id="erro-senha" class="campo-erro">Informe a senha.</span>
            }
          </div>

          <button type="submit" class="botao botao-primario">Entrar</button>
        </form>

        <div class="alerta alerta-info">
          <app-icone nome="info" />
          <p class="m-0 texto-pequeno">
            Login de demonstração do projeto acadêmico: aceita o RM de um integrante da equipe e a senha
            informada no README. Não use senhas reais.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  private readonly auth = inject(Autenticacao);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Rota para onde voltar após o login (vem da guarda)
  readonly voltar = input<string>('');

  protected readonly mostrarSenha = signal(false);
  protected readonly falhou = signal(false);
  private readonly alertaErro = viewChild<ElementRef<HTMLElement>>('alertaErro');

  protected readonly form = this.fb.nonNullable.group({
    rm: ['', Validators.required],
    senha: ['', Validators.required],
  });

  constructor() {
    if (this.auth.logado()) this.router.navigateByUrl('/admin');
  }

  protected invalido(campo: 'rm' | 'senha'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  protected entrar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { rm, senha } = this.form.getRawValue();
    if (this.auth.entrar(rm, senha)) {
      const destino = this.voltar().startsWith('/admin') ? this.voltar() : '/admin';
      this.router.navigateByUrl(destino);
    } else {
      this.falhou.set(true);
      this.form.controls.senha.reset();
      setTimeout(() => this.alertaErro()?.nativeElement.focus());
    }
  }
}
