import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';
@Component({ selector: 'app-header', styleUrl: './header.css', templateUrl: './header.html' })
export class Header {
  auth = inject(AuthService);
}
