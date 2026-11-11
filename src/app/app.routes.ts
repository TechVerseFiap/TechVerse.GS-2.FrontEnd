// Rotas da aplicação, carregadas sob demanda
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Cidadão Fácil — Início',
    loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'assistente',
    title: 'Assistente — Cidadão Fácil',
    loadComponent: () => import('./pages/assistente/assistente').then((m) => m.Assistente),
  },
  {
    path: 'categorias/:id',
    title: 'Serviços da categoria — Cidadão Fácil',
    loadComponent: () => import('./pages/categoria/categoria').then((m) => m.CategoriaPagina),
  },
  {
    path: 'servicos/:id',
    title: 'Detalhe do serviço — Cidadão Fácil',
    loadComponent: () => import('./pages/servico/servico').then((m) => m.ServicoPagina),
  },
  {
    path: 'salvos',
    title: 'Serviços salvos — Cidadão Fácil',
    loadComponent: () => import('./pages/salvos/salvos').then((m) => m.SalvosPagina),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'servicos' },
      {
        path: 'servicos',
        title: 'Painel · Serviços — Cidadão Fácil',
        loadComponent: () => import('./pages/admin/admin-servicos').then((m) => m.AdminServicos),
      },
      {
        path: 'servicos/novo',
        title: 'Painel · Novo serviço — Cidadão Fácil',
        loadComponent: () => import('./pages/admin/admin-servico-form').then((m) => m.AdminServicoForm),
      },
      {
        path: 'servicos/:id',
        title: 'Painel · Editar serviço — Cidadão Fácil',
        loadComponent: () => import('./pages/admin/admin-servico-form').then((m) => m.AdminServicoForm),
      },
      {
        path: 'categorias',
        title: 'Painel · Categorias — Cidadão Fácil',
        loadComponent: () => import('./pages/admin/admin-categorias').then((m) => m.AdminCategorias),
      },
      {
        path: 'documentos',
        title: 'Painel · Documentos — Cidadão Fácil',
        loadComponent: () => import('./pages/admin/admin-documentos').then((m) => m.AdminDocumentos),
      },
      {
        path: 'indicadores',
        title: 'Painel · Indicadores — Cidadão Fácil',
        loadComponent: () => import('./pages/admin/admin-indicadores').then((m) => m.AdminIndicadores),
      },
    ],
  },
  {
    path: '**',
    title: 'Página não encontrada — Cidadão Fácil',
    loadComponent: () => import('./pages/nao-encontrada/nao-encontrada').then((m) => m.NaoEncontrada),
  },
];
