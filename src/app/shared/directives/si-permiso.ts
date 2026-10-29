import { Directive, inject, input, effect, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';
import { Permiso } from '../../core/models/api';
@Directive({ selector: '[siPermiso]' })
export class SiPermiso {
  siPermiso = input.required<Permiso>();
  private auth = inject(AuthService);
  private template = inject(TemplateRef);
  private container = inject(ViewContainerRef);
  private visible = false;
  constructor() {
    effect(() => {
      const mostrar = this.auth.tienePermiso(this.siPermiso());
      if (mostrar !== this.visible) {
        this.container.clear();
        if (mostrar) this.container.createEmbeddedView(this.template);
        this.visible = mostrar;
      }
    });
  }
}
