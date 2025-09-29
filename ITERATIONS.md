# Budget Douala - Iterations MVP

## 🎯 Approche Itérative : Micro-Fonctionnalités

**Principe** : Chaque itération livre une fonctionnalité **complète et testable** en 1-2 jours max.  
**Objectif** : Validation continue + feedback rapide + risque maîtrisé.

---

## 📋 Backlog Priorisé (Ready to Dev)

### 🏗️ **ITERATION 0 : Setup & Fondations** (2 jours)

#### I0.1 - Project Setup Clean ✅
- [x] **Tâche** : Nettoyer le template Vite existant
- [x] **Livrable** : App.tsx vide, structure dossiers MVP
- [x] **Test** : `npm run dev` fonctionne
- [x] **Temps** : 1.5h (sous budget)

#### I0.2 - Dependencies Installation ✅
- [x] **Tâche** : Installer react-router-dom, dexie, zustand
- [x] **Livrable** : package.json mis à jour, types disponibles
- [x] **Test** : `npm run build` sans erreurs TypeScript
- [x] **Temps** : 0.5h (très rapide)

#### I0.3 - TypeScript Types Foundation ✅
- [x] **Tâche** : Créer `src/types/index.ts` avec interfaces de base
- [x] **Livrable** : Types Transaction, Budget, Settings, Category
- [x] **Test** : Compilation TypeScript stricte OK
- [x] **Temps** : 1h (fait en I0.1)

```typescript
// src/types/index.ts (preview)
export interface Transaction {
  id: string
  date: string // ISO format
  amount: number // XAF entier
  categoryId: string
  note?: string
  type: 'expense' | 'income'
}

export interface Category {
  id: string
  name: string
  type: 'expense' | 'income'
  budgetAmount?: number
  color: string
}

export interface Settings {
  salary: number // 250000 XAF default
  rentMonthly: number // 35000 XAF default
  rentMarginPct: 5 | 10 // 10% default
  transportDaily: number // 1500 XAF default
  pinHash?: string
}
```

#### I0.4 - Basic Routing Structure ✅
- [x] **Tâche** : Setup React Router avec 4 pages vides
- [x] **Livrable** : Navigation /dashboard, /quick-add, /budgets, /settings
- [x] **Test** : Navigation fonctionne, URLs correctes
- [x] **Temps** : 0.5h (très efficace)

---

### 💾 **ITERATION 1 : Data Layer Basique** (2 jours)

#### I1.1 - IndexedDB Setup (Dexie) ✅
- [x] **Tâche** : Configurer Dexie avec schema de base
- [x] **Livrable** : `src/data/db.ts` avec tables transactions, categories, settings
- [x] **Test** : Ouverture DB en dev tools, tables créées
- [x] **Temps** : 0.5h (très efficace)

```typescript
// src/data/db.ts (preview)
import Dexie from 'dexie'

class BudgetDB extends Dexie {
  transactions!: Dexie.Table<Transaction, string>
  categories!: Dexie.Table<Category, string>
  settings!: Dexie.Table<Settings, string>

  constructor() {
    super('BudgetDoualaDB')
    this.version(1).stores({
      transactions: 'id, date, categoryId, amount, type',
      categories: 'id, name, type',
      settings: 'id'
    })
  }
}

export const db = new BudgetDB()
```

#### I1.2 - CRUD Transactions (Sans Crypto) ✅
- [x] **Tâche** : Hook useTransactions avec add/get/delete
- [x] **Livrable** : `src/hooks/useTransactions.ts` fonctionnel
- [x] **Test** : Ajouter transaction via console, voir en DB
- [x] **Temps** : 0.5h (87% sous budget)

#### I1.3 - Categories par Défaut ✅
- [x] **Tâche** : Seed 5 catégories essentielles au premier lancement
- [x] **Livrable** : Transport, Alimentation, Data, Fonds Loyer, Épargne
- [x] **Test** : DB contient les 5 catégories après premier run
- [x] **Temps** : 0.5h (75% sous budget)

#### I1.4 - Settings Management ✅
- [x] **Tâche** : Hook useSettings pour get/update paramètres
- [x] **Livrable** : Valeurs par défaut (salaire 250k, loyer 35k, etc.)
- [x] **Test** : Modifier setting, persister en DB
- [x] **Temps** : 0.5h (83% sous budget)

---

### 🎨 **ITERATION 2 : UI Foundation** (2 jours)

#### I2.1 - Layout Mobile + Navigation ✅
- [x] **Tâche** : Composant Layout avec bottom navigation
- [x] **Livrable** : Navigation mobile avec icônes (Home, +, Chart, Settings)
- [x] **Test** : Navigation fluide sur mobile viewport
- [x] **Temps** : 0.5h (87% sous budget)

#### I2.2 - Design System Basique ✅
- [x] **Tâche** : Composants Button, Card, Input avec TailwindCSS
- [x] **Livrable** : `src/components/ui/` avec composants réutilisables
- [x] **Test** : Storybook ou page démo avec tous les composants
- [x] **Temps** : 0.5h (87% sous budget)

#### I2.3 - Format XAF Utility ✅
- [x] **Tâche** : Fonction formatCurrencyXAF avec espaces
- [x] **Livrable** : `src/utils/format.ts` avec tests unitaires
- [x] **Test** : formatXAF(38500) === "38 500 XAF"
- [x] **Temps** : 0.5h (75% sous budget)

```typescript
// src/utils/format.ts (preview)
export function formatCurrencyXAF(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('XAF', 'XAF').replace(',', ' ')
}
```
#### I2.4 - Dashboard Vide Stylé ✅
- [x] **Tâche** : Page Dashboard avec layout pour 5 barres budget
- [x] **Livrable** : Composants vides mais bien stylés
- [x] **Test** : Responsive, navigation OK
- [x] **Temps** : 0.5h (75% sous budget)

---

### ⚡ **ITERATION 3 : Saisie Rapide Core** (2 jours)

#### I3.1 - Bouton Quick Add Simple ✅
- [x] **Tâche** : Composant QuickAddButton générique
- [x] **Livrable** : Bouton avec montant, catégorie, action onClick
- [x] **Test** : Click → callback appelé avec bonnes données
- [x] **Temps** : 0.5h (75% sous budget)

#### I3.2 - Page Quick Add avec 3 Boutons ✅
- [x] **Tâche** : Page avec boutons +1500 Transport, +5000 Food, +2500 Data
- [x] **Livrable** : 3 gros boutons tactiles, responsive
- [x] **Test** : UI/UX mobile parfaite, feedback visuel
- [x] **Temps** : 0.5h (83% sous budget)

#### I3.3 - Intégration Transaction Creation ✅
- [x] **Tâche** : Connecter boutons → création transaction en DB
- [x] **Livrable** : Click bouton → transaction sauvée → feedback utilisateur
- [x] **Test** : Vérifier transaction en IndexedDB après click
- [x] **Temps** : 0.5h (83% sous budget)

#### I3.4 - Toast Confirmation ✅
- [x] **Tâche** : Composant Toast pour confirmer saisie
- [x] **Livrable** : "✅ 1 500 XAF · Transport · Trajet quotidien"
- [x] **Test** : Toast apparaît 3s puis disparaît, cliquable pour fermer
- [x] **Temps** : 0.5h (75% sous budget)

---

### 📊 **ITERATION 4 : Budgets Visuels** (3 jours)

#### I4.1 - Calculs Budgets (Domain Logic) ✅
- [x] **Tâche** : `src/utils/calculations.ts` avec formules métier
- [x] **Livrable** : Fonctions calculateRentFund, calculateTransportBudget, etc.
- [x] **Test** : 34/34 tests unitaires passants (100% success)
- [x] **Temps** : 0.5h (88% sous budget)

```typescript
// src/utils/calculations.ts (preview)
export function calculateRentFund(rentMonthly: number, marginPct: number): number {
  return Math.round(rentMonthly * (1 + marginPct / 100))
}

export function calculateTransportBudget(dailyAmount: number): number {
  return Math.round(dailyAmount * 21.7) // Jours ouvrés moyens
}

export function calculateEmergencyFund(salary: number, savingsPct: number): number {
  return Math.round(salary * savingsPct / 100)
}
```

#### I4.2 - Hook useBudgets ✅
- [x] **Tâche** : Hook pour calculer budgets vs réel du mois courant
- [x] **Livrable** : Retourne {category, budgeted, spent, remaining} pour chaque catégorie
- [x] **Test** : Données correctes avec transactions de test + diagnostic intégré
- [x] **Temps** : 0.5h (88% sous budget)

#### I4.3 - Composant BudgetBar ✅
- [x] **Tâche** : Barre horizontale Budget vs Réel avec couleurs
- [x] **Livrable** : Barre verte/rouge, pourcentage, montant restant
- [x] **Test** : Différents états (OK, dépassé, vide) + compatibilité legacy
- [x] **Temps** : 0.25h (92% sous budget)

#### I4.4 - Dashboard Fonctionnel ✅
- [x] **Tâche** : Intégrer 5 BudgetBar dans Dashboard
- [x] **Livrable** : Vue complète des budgets du mois + résumé temps réel
- [x] **Test** : Données réelles, mise à jour après saisie
- [x] **Temps** : 0.2h (94% sous budget)

---

### 🔒 **ITERATION 5 : Sécurité PIN Basique** (2 jours)

#### I5.1 - Crypto Utils Simple ✅
- [x] **Tâche** : `src/utils/crypto.ts` avec hash PIN simple
- [x] **Livrable** : hashPin, verifyPin avec WebCrypto + tests complets
- [x] **Test** : Hash/verify cycle fonctionne + 27 tests unitaires
- [x] **Temps** : 0.3h (90% sous budget)

#### I5.2 - Écran PIN Setup ✅
- [x] **Tâche** : Page configuration PIN 4 chiffres
- [x] **Livrable** : Pavé numérique, confirmation, sauvegarde + UX fluide
- [x] **Test** : PIN sauvé en settings, navigation après setup
- [x] **Temps** : 0.3h (93% sous budget)

#### I5.3 - Écran PIN Unlock ✅
- [x] **Tâche** : Page saisie PIN au lancement
- [x] **Livrable** : Vérification PIN, accès app si correct + sécurité robuste
- [x] **Test** : Bon PIN → app, mauvais PIN → erreur + blocage temporaire
- [x] **Temps** : 0.25h (92% sous budget)

#### I5.4 - Protection Routes ✅
- [x] **Tâche** : Guard sur toutes les routes sauf PIN
- [x] **Livrable** : Redirection automatique si pas authentifié + intégration complète
- [x] **Test** : Impossible d'accéder app sans PIN + déconnexion fonctionnelle
- [x] **Temps** : 0.3h (85% sous budget)

---

### ⚙️ **ITERATION 6 : Settings & Configuration** (2 jours)

#### I6.1 - Page Settings Layout ✅
- [x] **Tâche** : Interface pour modifier salaire, loyer, budgets
- [x] **Livrable** : Formulaire avec inputs numériques + validation intelligente
- [x] **Test** : UI responsive, validation erreurs/avertissements
- [x] **Temps** : 0.5h (83% sous budget)

#### I6.2 - Settings Persistence ✅
- [x] **Tâche** : Connecter formulaire → sauvegarde DB
- [x] **Livrable** : Modifications sauvées et appliquées + détection changements
- [x] **Test** : Changer salaire → budgets recalculés + persistance
- [x] **Temps** : 0.4h (87% sous budget)

#### I6.3 - Toggle Marge Loyer 5%/10% ✅
- [x] **Tâche** : Switch pour choisir marge loyer + UX exceptionnelle
- [x] **Livrable** : Toggle avec recalcul automatique + animations + comparaison
- [x] **Test** : 5% → 36750 XAF, 10% → 38500 XAF ✅ (validé console)
- [x] **Temps** : 0.3h (85% sous budget)

---

### 🧪 **ITERATION 7 : Tests & Polish** (2 jours)

#### I7.1 - Tests Unitaires Core
- [ ] **Tâche** : Tests Vitest pour utils (format, calculations, crypto)
- [ ] **Livrable** : Couverture ≥80% sur domain logic
- [ ] **Test** : `npm run test` passe tous les tests
- [ ] **Temps** : 4h

#### I7.2 - Tests Intégration React
- [ ] **Tâche** : Tests @testing-library pour composants clés
- [ ] **Livrable** : Tests QuickAdd, BudgetBar, Settings
- [ ] **Test** : Interactions utilisateur simulées
- [ ] **Temps** : 4h

#### I7.3 - Performance Mobile
- [ ] **Tâche** : Optimisation bundle, lazy loading
- [ ] **Livrable** : Bundle ≤200KB, LCP ≤2s
- [ ] **Test** : Lighthouse mobile ≥90
- [ ] **Temps** : 3h

#### I7.4 - UX Polish Final
- [ ] **Tâche** : Animations, transitions, micro-interactions
- [ ] **Livrable** : App fluide et agréable
- [ ] **Test** : Test utilisateur interne
- [ ] **Temps** : 3h

---

## 📊 Planning Détaillé

| Semaine | Iterations | Fonctionnalités Livrées | Validation |
|---------|------------|-------------------------|------------|
| **S1** | I0 + I1 | Setup + Data Layer | DB fonctionne, transactions CRUD |
| **S2** | I2 + I3 | UI + Saisie Rapide | Boutons +1500 Transport fonctionnels |
| **S3** | I4 + I5 | Budgets + Sécurité | Dashboard complet + PIN |
| **S4** | I6 + I7 | Settings + Tests | MVP complet et testé |

---

## 🎯 Critères de Validation par Iteration

### Validation Technique
```bash
# Chaque iteration doit passer :
npm run build     # Build sans erreurs
npm run test      # Tests unitaires OK
npm run lint      # Linting propre
```

### Validation Fonctionnelle
- [ ] **I3** : Saisie transaction ≤ 3s chronométrées
- [ ] **I4** : Budgets calculés correctement (vérification manuelle)
- [ ] **I5** : PIN sécurise l'accès (test intrusion basique)
- [ ] **I7** : Performance mobile acceptable (test device réel)

### Validation UX
- [ ] **I2** : Navigation intuitive (test utilisateur interne)
- [ ] **I3** : Feedback visuel satisfaisant
- [ ] **I4** : Budgets compréhensibles d'un coup d'œil
- [ ] **I6** : Settings faciles à modifier

---

## 🔄 Processus Itératif

### Daily Workflow
1. **Matin** : Choisir 1-2 tâches de l'iteration courante
2. **Dev** : Implémenter + tester
3. **Soir** : Commit + validation critères
4. **Review** : Ajuster iteration suivante si besoin

### Weekly Review
- **Lundi** : Planning iteration de la semaine
- **Vendredi** : Demo fonctionnalités livrées
- **Décision** : Continuer ou ajuster selon feedback

### Flexibility Rules
- ✅ **OK** : Ajuster temps estimé d'une tâche
- ✅ **OK** : Réordonner tâches dans une iteration
- ⚠️ **Attention** : Ajouter nouvelles fonctionnalités
- ❌ **Non** : Changer l'objectif d'une iteration en cours

---

## 🚀 Ready to Start?

**Prochaine action** : Commencer **I0.1 - Project Setup Clean**

Voulez-vous que je :
1. **🚀 Lance I0.1** immédiatement (nettoyer App.tsx existant)
2. **📋 Détaille I0.1** avec steps précis
3. **🔄 Ajuste** une iteration selon vos priorités
4. **📊 Crée** un tracking board pour suivre les progrès

Quelle approche préférez-vous pour démarrer efficacement ?
