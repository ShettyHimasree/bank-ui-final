import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-private-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class PrivateNavbarComponent {

  private router = inject(Router);
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
