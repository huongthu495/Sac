import { RenderMode } from '@angular/ssr';
import type { ServerRoute } from '@angular/ssr/types/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
