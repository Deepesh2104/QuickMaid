import { CanActivateFn } from '@angular/router';

/**
 * Placeholder functional auth guard. The current build is a UI prototype
 * with no real authentication, so this always allows. Wire it to a real
 * AuthService when backend integration lands.
 */
export const authGuard: CanActivateFn = () => true;
