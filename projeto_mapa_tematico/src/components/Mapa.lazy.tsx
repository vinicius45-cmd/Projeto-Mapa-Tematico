import { lazy } from 'react';

// Isso faz com que o bundle inicial do JS fique muito mais leve
export const MapaLazy = lazy(() => 
  import('./Mapa').then(module => ({ default: module.Mapa }))
);