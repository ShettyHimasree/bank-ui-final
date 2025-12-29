import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PrivateNavbarComponent } from '../private-navbar/navbar.component';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterModule, PrivateNavbarComponent],
  templateUrl: './private-layout.component.html'
})
export class PrivateLayoutComponent {}
