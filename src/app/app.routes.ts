import { Routes } from '@angular/router';

// PUBLIC PAGES
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

// LAYOUTS
import { PublicLayoutComponent } from './components/public-layout/layout.component';
import { PrivateLayoutComponent } from './components/private-layout/private-layout.component';

// PRIVATE PAGES
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DepositComponent } from './components/deposit/deposit.component';
import { WithdrawComponent } from './components/withdraw/withdraw.component';
import { TransferComponent } from './components/transfer/transfer.component';
import { HistoryComponent } from './components/history/history.component';
import { ContactComponent } from './components/contact/contact.component';

// AUTH GUARD
import { authGuard } from './auth.guard';

export const routes: Routes = [

  // 🔓 PUBLIC LAYOUT
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },

  // 🔐 PRIVATE LAYOUT
  {
    path: 'app',
    component: PrivateLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'deposit', component: DepositComponent, canActivate: [authGuard] },
      { path: 'withdraw', component: WithdrawComponent, canActivate: [authGuard] },
      { path: 'transfer', component: TransferComponent, canActivate: [authGuard] },
      { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
      { path: 'contact', component: ContactComponent, canActivate: [authGuard] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ❗ SAFETY FALLBACK
  { path: '**', redirectTo: '' }
];
