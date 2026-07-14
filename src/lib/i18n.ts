import { cookies } from "next/headers";

export const supportedLocales = ["en-US", "pt-BR"] as const;
export type Locale = (typeof supportedLocales)[number];

export type AuthCopy = {
  accountAccess: string; close: string; tagline: string; signIn: string; createAccount: string;
  accountId: string; accountPlaceholder: string; password: string; passwordPlaceholder: string;
  enterPortal: string; entering: string; characterName: string; characterPlaceholder: string;
  email: string; newPasswordPlaceholder: string; confirmPassword: string; confirmPlaceholder: string;
  terms: string; creating: string; createFree: string; sharedAccount: string; myAccount: string;
  freeRegistration: string; playFree: string; joinNow: string; welcome: string; logout: string;
  createShort: string; recoverPassword: string; invalidFields: string; passwordMismatch: string;
  duplicate: string; accountCreated: string; invalidCredentials: string; accessGranted: string;
};

const en = {
  language: "Language", nav: { start: "Getting Started", guide: "Game Guide", system: "Game System", data: "Game Data", forum: "Forums", downloads: "Downloads", shop: "Item Mall" },
  gameMenu: ["Interface", "Game Options", "Controls", "Communications", "Items", "Combat", "Skills", "Abilities", "Quests", "Character Growth", "Trades"],
  menus: {
    start: ["Getting Ready", "Installation", "Launcher", "Client Setting", "Login", "Create a Character"],
    guide: ["Interface", "Game Options", "Controls", "Communications", "Items", "Combat", "Skills", "Abilities", "Quests", "Character Growth", "Trades"],
    system: ["Party", "Guild", "Guild Management", "Duel", "Statue War", "Guild War", "Guild Fortress", "Upgrade Items"],
    data: ["Human Classes", "Ak'kan Classes", "Human Skills", "Ak'kan Skills", "Upgrade Data"],
    forum: ["Latest News", "Update News", "General Discussion", "Trade", "Tip and Tech", "Bug Reports", "Screenshots"],
    downloads: ["Client Download"],
    shop: ["Charge Points", "Purchase History", "Item List"],
  },
  quick: { beginner: "Beginner's Guide", client: "Client Download" },
  war: { title: "Time Information", territory: "Statue War Time", sunday: "Every Sunday", guild: "Guild War Time", saturday: "Every Saturday" },
  server: { title: "Server Status", maintenance: "Server Maintenance", schedule: "Thu. 05:00 ~ 06:00" },
  banners: { season: "Season I", rise: "The Rise of the Warborn", rewards: "Exclusive rewards through July 31", launch: "LAUNCH EVENT", call: "CALL TO ARMS", bonus: "EXP +50% · DROP +30% · JUL 14–21" },
  newsTitle: "Latest News", newTag: "NEW", noticeTag: "NOTICE", readMore: "MORE",
  news: [
    { title: "The Warborn journey begins now", date: "7/14/2026", text: "The gates of Vharos are open. Rally your guild, choose your faction, and prepare for the first season." },
    { title: "Server Foundation Event", date: "7/12/2026", text: "Create your account during launch and receive a supply chest, temporary mount, and exclusive title." },
    { title: "Guide for New Warriors", date: "7/10/2026", text: "Learn about classes, starting zones, and every reward that will accelerate your first steps." },
    { title: "Version 1.0.0 Notes", date: "7/08/2026", text: "Combat balancing, stability improvements, and the opening of the Ashen Fortress." },
  ],
  updates: { title: "Update News", release: "1.0.0 — Release Notes", balance: "0.9.8 — Class Balance", install: "Installation Guide Updated" },
  screenshots: { title: "Screenshot", fortress: "Ashen Fortress", valley: "Valley of the Forgotten", siege: "Siege of Vharos" },
  shop: { label: "Premium", featured: "Best Selling Item", founderDesc: "Exclusive founder items", orbDesc: "EXP +30% / 1 hour", stoneDesc: "Revive at your location" },
  guide: "WAR GUIDE", ranking: "Ranking", footer: { rights: "© 2026 Warborn. All rights reserved.", terms: "Terms", privacy: "Privacy", support: "Support" },
  auth: {
    accountAccess:"Account access", close:"Close", tagline:"One account. Two worlds.", signIn:"SIGN IN", createAccount:"CREATE ACCOUNT", accountId:"Account ID", accountPlaceholder:"Your account ID", password:"Password", passwordPlaceholder:"Your password", enterPortal:"ENTER THE PORTAL", entering:"SIGNING IN...", characterName:"Character name", characterPlaceholder:"Your hero", email:"Email", newPasswordPlaceholder:"Min. 8 characters", confirmPassword:"Confirm password", confirmPlaceholder:"Repeat password", terms:"I accept the Terms of Use and Privacy Policy.", creating:"CREATING ACCOUNT...", createFree:"CREATE FREE ACCOUNT", sharedAccount:"This account will be used on both the website and game client.", myAccount:"My Account", freeRegistration:"Free Registration", playFree:"PLAY FOR FREE", joinNow:"JOIN NOW", welcome:"Welcome,", logout:"LOG OUT", createShort:"Join Member", recoverPassword:"Find ID/PW", invalidFields:"Check the fields. Use a simple ID and a password of at least 8 characters.", passwordMismatch:"The passwords do not match.", duplicate:"This ID or email is already in use.", accountCreated:"Account created! Preparing your journey...", invalidCredentials:"Invalid account ID or password.", accessGranted:"Access granted. Welcome back!"
  } satisfies AuthCopy,
};

const pt: typeof en = {
  language: "Idioma", nav: { start: "Primeiros Passos", guide: "Guia do Jogo", system: "Sistema do Jogo", data: "Dados do Jogo", forum: "Fórum", downloads: "Downloads", shop: "Loja de Itens" },
  gameMenu: ["Interface", "Opções de jogo", "Controles", "Comunicação", "Itens", "Combate", "Habilidades", "Aptidões", "Missões", "Evolução do personagem", "Comércio"],
  menus: {
    start: ["Preparação", "Instalação", "Launcher", "Configuração do Cliente", "Login", "Criar um Personagem"],
    guide: ["Interface", "Opções do Jogo", "Controles", "Comunicações", "Items", "Combate", "Skills", "Abilities", "Quests", "Evolução do Personagem", "Comércio"],
    system: ["Grupo", "Guild", "Gerenciamento de Guild", "Duelo", "Statue War", "Guild War", "Guild Fortress", "Upgrade Items"],
    data: ["Human Classes", "Ak'kan Classes", "Human Skills", "Ak'kan Skills", "Dados de Upgrade"],
    forum: ["Últimas Notícias", "Notícias de Atualização", "Discussão Geral", "Comércio", "Dicas e Tecnologia", "Relatar Bugs", "Capturas de Tela"],
    downloads: ["Download do Cliente"],
    shop: ["Carregar Pontos", "Histórico de Compras", "Lista de Items"],
  },
  quick: { beginner: "Guia do Iniciante", client: "Baixar o Cliente" },
  war: { title: "Informações de Guerra", territory: "Guerra de Território", sunday: "Todo domingo", guild: "Guerra de Guildas", saturday: "Todo sábado" },
  server: { title: "Status do Servidor", maintenance: "Manutenção semanal", schedule: "Qui. 05:00 ~ 06:00" },
  banners: { season: "Temporada I", rise: "A Ascensão dos Warborn", rewards: "Recompensas exclusivas até 31 de julho", launch: "EVENTO DE LANÇAMENTO", call: "CHAMADO ÀS ARMAS", bonus: "EXP +50% · DROP +30% · 14–21 JUL" },
  newsTitle: "Últimas Notícias", newTag: "NOVO", noticeTag: "NOTÍCIA", readMore: "LER MAIS",
  news: [
    { title: "A jornada de Warborn começa agora", date: "14/07/2026", text: "Os portões de Vharos foram abertos. Reúna sua guilda, escolha sua facção e prepare-se para a primeira temporada." },
    { title: "Evento de fundação do servidor", date: "12/07/2026", text: "Crie sua conta durante o lançamento e receba um baú de suprimentos, montaria temporária e título exclusivo." },
    { title: "Guia para novos guerreiros", date: "10/07/2026", text: "Conheça as classes, os mapas iniciais e todas as recompensas que vão acelerar seus primeiros passos." },
    { title: "Notas da versão 1.0.0", date: "08/07/2026", text: "Balanceamento de combate, melhorias de estabilidade e a abertura da Fortaleza de Cinzas." },
  ],
  updates: { title: "Atualizações", release: "1.0.0 — Notas de lançamento", balance: "0.9.8 — Balanceamento de classes", install: "Guia de instalação atualizado" },
  screenshots: { title: "Capturas de Tela", fortress: "Fortaleza de Cinzas", valley: "Vale dos Esquecidos", siege: "Cerco de Vharos" },
  shop: { label: "Premium", featured: "Itens em Destaque", founderDesc: "Itens exclusivos de fundador", orbDesc: "EXP +30% / 1 hora", stoneDesc: "Revive no local" },
  guide: "GUIA DE GUERRA", ranking: "Ranking", footer: { rights: "© 2026 Warborn. Todos os direitos reservados.", terms: "Termos", privacy: "Privacidade", support: "Suporte" },
  auth: {
    accountAccess:"Acesso à conta", close:"Fechar", tagline:"Uma conta. Dois mundos.", signIn:"ENTRAR", createAccount:"CRIAR CONTA", accountId:"ID da conta", accountPlaceholder:"Seu ID de acesso", password:"Senha", passwordPlaceholder:"Sua senha", enterPortal:"ENTRAR NO PORTAL", entering:"ENTRANDO...", characterName:"Nome no jogo", characterPlaceholder:"Seu herói", email:"E-mail", newPasswordPlaceholder:"Mín. 8 caracteres", confirmPassword:"Confirmar senha", confirmPlaceholder:"Repita a senha", terms:"Eu aceito os Termos de Uso e a Política de Privacidade.", creating:"CRIANDO CONTA...", createFree:"CRIAR CONTA GRATUITA", sharedAccount:"Esta conta será usada no site e no cliente do jogo.", myAccount:"Minha Conta", freeRegistration:"Cadastro Gratuito", playFree:"JOGUE GRÁTIS", joinNow:"JUNTE-SE AGORA", welcome:"Bem-vindo,", logout:"SAIR", createShort:"Criar conta", recoverPassword:"Recuperar senha", invalidFields:"Confira os campos. Use um ID simples e uma senha de pelo menos 8 caracteres.", passwordMismatch:"As senhas não coincidem.", duplicate:"Este ID ou e-mail já está em uso.", accountCreated:"Conta criada! Preparando sua jornada...", invalidCredentials:"ID ou senha inválidos.", accessGranted:"Acesso autorizado. Bem-vindo de volta!"
  },
};

export const messages = { "en-US": en, "pt-BR": pt };
export function isLocale(value: string | undefined): value is Locale { return supportedLocales.includes(value as Locale); }
export function getMessages(locale: Locale) { return messages[locale]; }
export async function getLocale(accountLocale?: string): Promise<Locale> {
  const cookieLocale = (await cookies()).get("warborn_locale")?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  return isLocale(accountLocale) ? accountLocale : "en-US";
}
