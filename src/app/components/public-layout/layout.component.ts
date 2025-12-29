import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicNavbarComponent } from '../public-navbar/navbar.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterModule, PublicNavbarComponent],
  templateUrl: './layout.component.html'
})
export class PublicLayoutComponent {}
