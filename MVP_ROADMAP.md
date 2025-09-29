# Budget Douala - MVP Roadmap

## 🎯 Stratégie MVP : "Saisie Rapide + Budgets Visuels"

### Principe MVP
**Objectif** : Valider l'hypothèse que la saisie ultra-rapide (≤3s) résout un vrai problème utilisateur à Douala.

**Valeur core** : Remplacer le carnet papier/notes téléphone par une saisie digitale fluide avec suivi budgétaire immédiat.

---

## 📦 MVP v1.0 - Fonctionnalités Essentielles

### ✅ **INCLUS dans MVP**

#### 1. **Saisie Rapide** (Core Value)
```typescript
// 3 boutons prédéfinis les plus fréquents
+1 500 Transport    // Trajet travail quotidien
+5 000 Alimentation // Repas/courses
+2 500 Data         // Recharge internet

// Parsing simple mais efficace
"1500 transport" → Transaction enregistrée
"5000 food"      → Transaction enregistrée
```

#### 2. **Budgets Visuels Simples**
```typescript
// 5 catégories essentielles seulement
- Transport     : 32 550 XAF (calculé : 1500×21.7)
- Alimentation  : 50 000 XAF (paramétrable)
- Data/Comm     : 12 500 XAF
- Fonds Loyer   : 38 500 XAF (35k + 10% marge)
- Épargne       : 25 000 XAF (10% du salaire 250k)

// Visualisation : barres horizontales Budget vs Réel
// Couleurs : Vert (OK) / Rouge (dépassé)
```

#### 3. **Stockage Local Sécurisé**
```typescript
// IndexedDB + chiffrement AES-GCM basique
// PIN 4 chiffres (simplifié pour MVP)
// Pas d'auto-lock (ajouté en v2)

interface Transaction {
  id: string
  date: string        // ISO format
  amount: number      // XAF entier
  category: string    // transport|food|data|rent|savings
  note?: string       // optionnel
}
```

#### 4. **Navigation Mobile Simple**
```
┌─────────────────┐
│   🏠 Accueil    │ ← Dashboard budgets
├─────────────────┤
│   ⚡ Saisie     │ ← Écran principal (boutons rapides)
├─────────────────┤
│   📊 Budgets    │ ← Vue mensuelle
├─────────────────┤
│   ⚙️  Réglages   │ ← PIN + montants de base
└─────────────────┘
```

#### 5. **Format XAF Correct**
```typescript
formatXAF(38500) // "38 500 XAF"
// Espaces comme séparateurs, pas de décimales
// Fuseau Africa/Douala pour les dates
```

---

### ❌ **EXCLU du MVP** (Reporté v2+)

- ~~Notifications/rappels~~ → v2
- ~~Coussin d'urgence~~ → v2  
- ~~Revenus Extra avec répartition~~ → v2
- ~~Export CSV~~ → v2
- ~~Rapport mensuel détaillé~~ → v2
- ~~PWA complète~~ → v2 (juste responsive web d'abord)
- ~~Parsing complexe~~ → v2 (juste mots-clés simples)
- ~~Chiffrement PBKDF2 200k~~ → v2 (crypto simple d'abord)

---

## 🏗️ Architecture MVP Simplifiée

### Structure Projet
```
src/
├── components/
│   ├── QuickAddButton.tsx    # Boutons +1500 Transport
│   ├── BudgetBar.tsx         # Barre Budget vs Réel
│   ├── NumberPad.tsx         # Saisie montants
│   └── Layout.tsx            # Navigation mobile
├── pages/
│   ├── Dashboard.tsx         # Vue budgets
│   ├── QuickAdd.tsx          # Saisie rapide
│   ├── Budgets.tsx           # Détail par catégorie
│   └── Settings.tsx          # PIN + montants
├── hooks/
│   ├── useTransactions.tsx   # CRUD transactions
│   ├── useBudgets.tsx        # Calculs budgets
│   └── useStorage.tsx        # IndexedDB + crypto
├── utils/
│   ├── format.ts             # formatXAF, dates
│   ├── crypto.ts             # AES simple
│   └── calculations.ts       # Budgets + totaux
└── types/
    └── index.ts              # Transaction, Budget, Settings
```

### Stack MVP
```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^6.x",
    "dexie": "^4.x",
    "zustand": "^4.x",
    "tailwindcss": "^4.1.13"
  },
  "devDependencies": {
    "vitest": "^2.x",
    "@testing-library/react": "^16.x",
    "typescript": "~5.8.3"
  }
}
```

---

## 🎯 User Stories MVP

### Story 1 : Saisie Transport Quotidienne
```
EN TANT QU'utilisateur à Douala
JE VEUX enregistrer mes 1500 XAF de transport en 1 tap
AFIN DE suivre mes dépenses sans friction

Critères d'acceptation :
- Bouton "+1 500 Transport" visible dès l'ouverture
- 1 tap → confirmation visuelle → retour dashboard
- Temps total ≤ 3 secondes
- Montant ajouté au budget Transport du mois
```

### Story 2 : Vision Budgétaire Immédiate  
```
EN TANT QU'utilisateur
JE VEUX voir instantanément où j'en suis dans mes budgets
AFIN DE savoir si je peux encore dépenser

Critères d'acceptation :
- Dashboard avec 5 barres Budget vs Réel
- Couleur rouge si dépassement
- Montant restant affiché clairement
- Mise à jour temps réel après saisie
```

### Story 3 : Configuration Personnelle
```
EN TANT QU'utilisateur
JE VEUX ajuster mes montants budgétaires
AFIN DE coller à ma situation personnelle

Critères d'acceptation :
- Écran réglages avec sliders/inputs
- Salaire, loyer, budgets modifiables
- Sauvegarde sécurisée (PIN)
- Recalcul automatique des budgets
```

---

## 📊 Métriques de Succès MVP

### Techniques
- **Performance** : Saisie ≤ 3s (mesurée)
- **Fiabilité** : 0 perte de données sur 1 mois d'usage
- **Utilisabilité** : 90% des saisies réussies du 1er coup

### Fonctionnelles  
- **Adoption** : Utilisateur saisit ≥5 transactions/semaine
- **Rétention** : Utilisation continue sur 2 semaines
- **Valeur** : Utilisateur dit "plus rapide que carnet papier"

---

## 🚀 Plan de Développement MVP (4 semaines)

### Semaine 1 : Fondations
- [ ] Setup Vite + React + TypeScript + TailwindCSS
- [ ] Architecture composants de base
- [ ] IndexedDB + Dexie setup
- [ ] Types TypeScript (Transaction, Budget, Settings)
- [ ] Utils format XAF + dates Africa/Douala

### Semaine 2 : Data Layer + Crypto
- [ ] CRUD transactions (Dexie)
- [ ] Chiffrement AES simple (WebCrypto)
- [ ] Hook useTransactions + useStorage
- [ ] Tests unitaires data layer
- [ ] Calculs budgets (transport 21.7, marge loyer)

### Semaine 3 : UI Core
- [ ] Composant QuickAddButton (+1500 Transport)
- [ ] Page QuickAdd avec 3 boutons principaux
- [ ] Composant BudgetBar (Budget vs Réel)
- [ ] Page Dashboard avec 5 barres budgets
- [ ] Navigation mobile (React Router)

### Semaine 4 : Finition MVP
- [ ] Page Settings (PIN + montants budgets)
- [ ] Page Budgets (détail par catégorie)
- [ ] Tests d'intégration complets
- [ ] Optimisation performance mobile
- [ ] Documentation utilisateur

---

## 🔄 Validation & Itération

### Tests Utilisateur (Semaine 5)
1. **Onboarding** : 5 utilisateurs à Douala testent l'app
2. **Métriques** : Temps de saisie, taux d'erreur, satisfaction
3. **Feedback** : Interviews 15min post-test
4. **Décision** : Continuer v2 ou pivoter selon résultats

### Critères Go/No-Go v2
- ✅ **Go** : ≥80% utilisateurs préfèrent à leur méthode actuelle
- ❌ **No-Go** : Trop de friction, pas d'adoption, bugs bloquants

---

## 🎯 Vision v2+ (Si MVP validé)

### Fonctionnalités Avancées
- PWA complète (offline, installable)
- Notifications intelligentes (rappels salaire)
- Coussin d'urgence avec progression
- Export CSV + rapport mensuel
- Revenus Extra avec répartition auto
- Parsing NLP plus sophistiqué
- Chiffrement renforcé (PBKDF2 200k)

### Métriques v2
- 1000+ utilisateurs actifs à Douala
- Temps de saisie moyen ≤ 2s
- Rétention 30 jours > 60%
- NPS > 50

---

**MVP Focus** : Prouver que la saisie ultra-rapide + budgets visuels créent de la valeur réelle pour les utilisateurs de Douala avant d'ajouter la complexité.

*Prêt à commencer le développement ?* 🚀
