import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { AvisoSesion } from '../../shared/components/aviso-sesion/aviso-sesion';
import { AuthService } from '../../core/auth/auth-service';
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar, AvisoSesion],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  constructor() {
    inject(AuthService)
      .obtenerPerfil()
      .subscribe({
        error: () => {
          /* The security interceptor handles an invalid session. */
        },
      });
  }
}
