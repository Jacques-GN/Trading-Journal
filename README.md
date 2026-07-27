# Trading Journal — Discipline over Prediction

Application desktop/mobile de journal de trading conçue pour développer la discipline du trader via la documentation rigoureuse de chaque trade et la visualisation objective des statistiques comportementales.

> *"Track behavior, not only profits."*

---

## Pourquoi cet outil

La plupart des traders échouent non pas par manque de stratégie, mais par manque de discipline. Cette application met en évidence les corrélations objectives entre **comportement** et **résultats** : quelles émotions mènent aux pertes, quelles sessions sont rentables, quelles erreurs se répètent, et si vous suivez réellement vos propres règles.

## Fonctionnalités principales

### 7 vues complètes

1. **Dashboard** — KPIs clés (Net P/L, Win Rate, Profit Factor, Expectancy), courbe d'équité, habitudes quotidiennes, calendrier heatmap mensuel
2. **Journal des trades** — Filtres avancés, table desktop + cards mobile, formulaire complet à 6 sections
3. **Statistiques avancées** — 5 onglets : Performance, Distribution, Setups & instruments, Comportement, **Discipline**
4. **Rapport mensuel** — Grille de cartes mensuelles + heatmap quotidien + export CSV/JSON/PDF
5. **Règles de trading** — Règles par catégorie avec sévérité + panel des violations chiffrées
6. **Check psychologique** — Check-in quotidien, streak, analytics émotions, tendances discipline
7. **Gestion des comptes** — Multi-comptes avec soldes calculés automatiquement

### Formulaire de trade — capture complète

Chaque trade enregistre :

| Catégorie | Champs |
|---|---|
| **Setup** | Instrument, classe d'actif, direction, type d'ordre, stratégie |
| **Contexte marché** | Session (Londres/NY/Asie/Sydney), biais de marché (haussier/baissier/neutre), timeframe |
| **Prix** | Entrée, sortie, stop loss, take profit, taille de position, risque % |
| **Discipline** | Setup valide (Y/N), règles suivies (Y/N), raison d'entrée, raison de sortie, règle violée |
| **Psychologie** | Émotion dominante, score d'émotion (1-10), confiance (1-10), discipline (1-10) |
| **Réflexion** | Notes, leçon apprise, plus grosse erreur, amélioration prochain trade |

### Diagrammes comportementaux (onglet Discipline)

- **Score de discipline** — jauge radiale : % setup valide + % règles suivies + P/L discipliné vs indiscipliné
- **Distribution du risque par trade** — histogramme avec zone recommandée 1-2% surlignée
- **Calibration de la confiance** — win rate par bucket de confiance (1-3, 4-6, 7-8, 9-10), détecte l'overconfidence
- **Biais de marché vs direction** — stacked bars révélant les trades contre-tendance
- **Erreurs récurrentes** — top 8 des plus grosses erreurs avec leur coût cumulé
- **Heatmap Session × Stratégie** — matrice colorée P/L par session et stratégie
- **Suivi des améliorations** — win rate après application vs non-application des leçons

### Statistiques financières

- **Métriques globales** : Capital initial, Net P/L, Solde final, Drawdown max
- **Ratios de performance** : Win Rate, Profit/Loss Ratio, Profit Factor, Expectancy
- **Money management** : Kelly Criterion, R/R moyen, taille de position moyenne
- **Distribution R-multiples** : -3R à +3R+
- **Performance par** : instrument, stratégie, période, émotion, session, timeframe, biais
- **Comparaison 20 derniers trades vs global** — détecte régression ou amélioration

## Stack technique

- **Framework** : Next.js 16 (App Router) + TypeScript
- **UI** : Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- **Database** : Prisma ORM + SQLite (persistance locale)
- **Charts** : Recharts
- **State** : Zustand + TanStack Query
- **Animations** : Framer Motion
- **Toasts** : Sonner

## Démarrage rapide

### Prérequis
- Node.js 20+ / Bun
- Aucune configuration externe requise (SQLite embarqué)

### Installation

```bash
# Installer les dépendances
bun install

# Configurer la base de données
cp .env.example .env  # si fourni, sinon DATABASE_URL="file:./db/custom.db"
bun run db:push

# Lancer le serveur de développement
bun run dev
```

L'application est disponible sur `http://localhost:3000`.

Au premier lancement, des données de démonstration réalistes sont automatiquement seedées :
- 3 comptes (Forex Primaire $50k, Crypto Swing $10k, Actions US $25k)
- 6 stratégies (Breakout, Pullback, Range, News, Scalp, Trend Following)
- ~44 trades sur 90 jours racontant une courbe d'apprentissage
- 6 règles + 14 jours de check-ins psychologiques + 3 objectifs

### Scripts disponibles

```bash
bun run dev        # Serveur de développement (port 3000)
bun run build      # Build de production
bun run start      # Démarrer en production
bun run lint       # Vérification ESLint
bun run db:push    # Synchroniser le schéma Prisma avec la DB
bun run db:reset   # Reset complet de la DB
```

## Structure du projet

```
src/
├── app/
│   ├── page.tsx                    # App shell (vue unique, routing interne via Zustand)
│   ├── layout.tsx                  # Layout racine avec thème sombre par défaut
│   └── api/
│       ├── trades/                 # CRUD trades (GET, POST, GET/:id, PUT, DELETE)
│       ├── accounts/               # CRUD comptes
│       ├── strategies/             # CRUD stratégies
│       ├── rules/                  # CRUD règles
│       ├── mindset/                # Upsert check-in psychologique
│       ├── stats/                  # Statistiques calculées
│       └── seed/                   # Seed des données de démo
├── lib/
│   ├── db.ts                       # Client Prisma + helpers
│   ├── store.ts                    # Store Zustand (vue courante, compte courant)
│   ├── stats.ts                    # Fonctions pures de calcul statistique
│   ├── format.ts                   # Formatters (devise, %, R-multiples)
│   ├── enums.ts                    # Constantes (sessions, émotions, raisons, etc.)
│   └── seed.ts                     # Données de démonstration
└── components/
    ├── layout/                     # Shell, sidebar, bottom-nav, topbar
    ├── dashboard/                  # Vue Dashboard
    ├── journal/                    # Vue Journal + formulaire + détail
    ├── statistics/                 # Vue Statistiques (5 onglets, 13+ charts)
    ├── monthly/                    # Vue Rapport mensuel
    ├── rules/                      # Vue Règles
    ├── mindset/                    # Vue Check psychologique
    ├── accounts/                   # Vue Comptes
    └── ui/                         # Composants shadcn/ui
```

## Design

- **Thème sombre par défaut** (zinc-950 background, zinc-900 cards)
- **Accent emerald-500** pour les gains, **rose-500** pour les pertes
- **Police monospace** pour l'alignement des données financières
- **Sidebar desktop** / **bottom-nav mobile** (5 boutons + menu "Plus")
- **Responsive** : du mobile (390px) au desktop (1920px+)

## Données et confidentialité

Toutes les données sont stockées **localement** dans SQLite (`db/custom.db`). Aucune donnée n'est envoyée vers un serveur externe. Pour repartir de zéro, supprimez simplement le fichier `db/custom.db` et relancez `bun run db:push`.

## Roadmap suggérée

- [ ] Import CSV depuis brokers (MT4/MT5, Binance, Interactive Brokers)
- [ ] API de prix en temps réel (TradingView widget, Alpha Vantage)
- [ ] Synchronisation cloud multi-appareils (Supabase, Firebase)
- [ ] Mode collaboration (partage de journal avec mentor)
- [ ] Backtesting de stratégies
- [ ] Notifications de discipline (rappels, alertes de surtrading)
- [ ] PWA offline-first

## Licence

Projet personnel — usage libre.

---

*Built with discipline, for discipline.*
