import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth-service';
import { FieldError } from '../../../../shared/components/field-error/field-error';
import { errorFormulario } from '../../../../core/utils/http-error';
@Component({
  imports: [ReactiveFormsModule, FieldError],
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly destroyRef = inject(DestroyRef);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  form = inject(FormBuilder).nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.maxLength(72)]],
  });
  cargando = signal(false);
  error = signal('');
  enviar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.cargando()) return;
    this.error.set('');
    this.cargando.set(true);
    const { username, password } = this.form.getRawValue();
    this.auth
      .login(username, password)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: () => {
          const destino = this.route.snapshot.queryParamMap.get('returnUrl');
          void this.router.navigateByUrl(
            destino?.startsWith('/') && !destino.startsWith('//') ? destino : '/ordenes',
          );
        },
        error: (e) => this.error.set(errorFormulario(this.form, e)),
      });
  }
}
