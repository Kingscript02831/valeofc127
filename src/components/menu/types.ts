
export interface MenuItem {
  icon: string;
  label: string;
  path: string;
}

export const menuItems: MenuItem[] = [
  {
    icon: "noticias",
    label: "Notícias",
    path: "/noticias",
  },
  {
    icon: "eventos",
    label: "Eventos",
    path: "/eventos",
  },
  {
    icon: "produtos",
    label: "Produtos",
    path: "/products",
  },
  {
    icon: "perfil",
    label: "Perfil",
    path: "/perfil",
  },
  {
    icon: "notificacoes",
    label: "Notificações",
    path: "/notify",
  },
  {
    icon: "reels",
    label: "Reels",
    path: "/reels",
  },
  {
    icon: "posts",
    label: "Posts",
    path: "/",
  },
];
