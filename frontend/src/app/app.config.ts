import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideNgxStripe } from 'ngx-stripe';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNgxStripe('pk_test_51T4QnM1KXPQoXu1u3tRPuHlluRf9PLJ7FX3jEf0Nkhbes6C8DGVUJZ3MOG7lJTcxyDLFUTIP1zQIlqfyoKZJS08300vTj1pT3v') 
  ]
};