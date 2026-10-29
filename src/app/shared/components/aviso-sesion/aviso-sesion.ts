import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth-service';
@Component({
  selector: 'app-aviso-sesion',
  templateUrl: './aviso-sesion.html',
  styleUrl: './aviso-sesion.css',
})
export class AvisoSesion {
  readonly auth = inject(AuthService);
}
