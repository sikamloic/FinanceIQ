# Budget Douala - Spécifications Techniques

## 📋 Vue d'ensemble du projet

**Application PWA** : Budget personnel offline-first pour mobile  
**Cible** : Utilisateurs à Douala (Cameroun)  
**Devise** : XAF (Franc CFA) - montants entiers uniquement  
**Fuseau horaire** : Africa/Douala  
**Sécurité** : Chiffrement local AES-GCM 256, aucun backend  

---

## 🎯 Objectifs fonctionnels

### 1.1 Onboarding & Sécurité
- **PIN obligatoire** : 6 chiffres pour déverrouiller l'app
- **Chiffrement local** : AES-GCM 256 + PBKDF2 (SHA-256, ≥200k itérations)
- **Auto-verrouillage** : après 5 min d'inactivité (paramétrable)
- **Reset complet** : option d'effacement total avec confirmation

### 1.2 Saisie Ultra-Rapide (≤ 3s)
- **Boutons prédéfinis** :
  - `+1 500 Transport` (trajet travail)
  - 2 autres boutons configurables (ex: +5 000 Alimentation)
- **Parsing intelligent** : `1500 transport trajet` → montant + catégorie + note
- **Revenus Extra** : répartition auto 60% Épargne / 30% Projets / 10% Loisirs

### 1.3 Budgets & Enveloppes (Valeurs par défaut)
```
Salaire mensuel     : 250 000 XAF
Loyer mensuel       : 35 000 XAF
Marge loyer         : 5% ou 10% (toggle)
Épargne sur salaire : 10%
Transport quotidien : 1 500 XAF × 21,7 jours = 32 550 XAF/mois
```

**Calculs automatiques** :
- Fonds Loyer = 35 000 × 1,10 = 38 500 XAF (si marge 10%)
- Épargne d'urgence = 250 000 × 10% = 25 000 XAF
- Transport = 1 500 × 21,7 = 32 550 XAF

### 1.4 Coussin d'Urgence
**Objectif** : 3 × dépenses essentielles (~438 000 XAF)  
**Essentiels** : Fonds Loyer + Alimentation + Transport + Data + Charges + Santé

### 1.5 Rappels Intelligents
- **Jours 1-5** (19h-21h aléatoire) : "Salaire arrivé ? Vire 38 500 XAF + 25 000 XAF"
- **Jour 8** : "Revue budget (Data/Transport/Aide familiale)"
- **Loyer** : J-30 et J-7 si date d'échéance fournie
- **Fallback** : notifications in-app + export .ics calendrier

### 1.6 Rapport & Export
- **Mensuel** : Revenus, Dépenses, Top 3 catégories, Solde
- **Export CSV** : UTF-8, séparateur `;`, colonnes détaillées

---

## 🏗️ Architecture Technique

### Stack Technologique
```typescript
Frontend    : React + Vite + TypeScript (strict)
Storage     : IndexedDB via Dexie
Crypto      : WebCrypto API (AES-GCM, PBKDF2)
PWA         : Service Worker Workbox
State       : Zustand
Tests       : Vitest + Playwright
Qualité     : ESLint + Prettier
A11y        : WCAG AA
Performance : LCP/TTI < 2s, bundle < 200KB gz
```

### Structure du Projet
```
budget-douala/
├── src/
│   ├── app.tsx
│   ├── main.tsx
│   ├── routes/           # QuickAdd, Budgets, Report, Settings, Lock
│   ├── components/       # Button, NumberPad, Bars, Toast
│   ├── domain/           # Logique métier
│   │   ├── envelopes.ts  # Calculs budgets (marge 5/10%, transport 21.7)
│   │   ├── extras.ts     # Répartition 60/30/10
│   │   ├── emergencyFund.ts
│   │   ├── reminders.ts  # Notifications + fallback
│   │   ├── csv.ts        # Export
│   │   ├── format.ts     # Format XAF (espaces)
│   │   └── parse.ts      # Parsing tolérant
│   ├── data/
│   │   ├── db.ts         # Schema Dexie
│   │   ├── crypto.ts     # Chiffrement
│   │   ├── repositories.ts
│   │   └── lock.ts       # Gestion session
│   └── pwa/
│       ├── sw.ts         # Service Worker
│       └── manifest.webmanifest
├── public/               # Icônes PWA
├── tests/               # Unit + E2E
└── README.md
```

### Modèle de Données (Dexie + Chiffrement)
```typescript
// Tables principales (payloads chiffrés)
settings     { id, salary, rentMonthly, rentMarginPct, ... }
categories   { id, name, type, isEssential, ... }
envelopes    { id, month, categoryId, amountBudgeted }
transactions { id, date, type, amount, categoryId, note, ... }
goals        { id, key, target, progressCache }
reminders    { id, kind, window, enabled, ... }
```

---

## 🧮 Règles Métier Critiques

### Calculs Financiers (Précision XAF)
```typescript
// Enveloppes mensuelles
rentFund = Math.round(rentMonthly × (1 + rentMarginPct/100))
emergency = Math.round(salary × salarySavePct/100)
transport = Math.round(transportDaily × 21.7)

// Répartition Extra (conservation somme exacte)
const splits = calculateExtraSplit(amount, {save: 60, projects: 30, fun: 10})
// Gérer arrondi pour que sum(splits) === amount
```

### Format Monétaire XAF
```typescript
formatCurrencyXAF(38500) // "38 500 XAF"
// Espaces comme séparateurs de milliers, pas de décimales
```

---

## 🔒 Sécurité & Confidentialité

### Chiffrement Local
```typescript
// Dérivation clé depuis PIN 6 chiffres
const key = await deriveKeyFromPin(pin, salt, 200000) // PBKDF2

// Chiffrement données sensibles
const encrypted = await encryptJSON(data, key) // AES-GCM 256
```

### Principes
- **Aucun backend** : 100% local
- **Pas de tracking** : aucun analytics tiers
- **Offline-first** : fonctionne sans réseau
- **Réinitialisation** : effacement complet possible

---

## 📱 UX/UI Mobile-First

### Saisie Rapide
- **Gros boutons** tactiles
- **Pavé numérique** ergonomique
- **Feedback visuel** : "✅ 1 500 XAF · Transport · Trajet travail"
- **Latence cible** : ≤ 3s du tap à la confirmation

### Budgets Visuels
- **Barres horizontales** Budget vs Réel
- **Code couleur** : Vert/Ambre/Rouge selon dépassement
- **Reste disponible** affiché clairement

### Accessibilité (WCAG AA)
- Labels explicites
- Navigation clavier
- Contrastes suffisants
- aria-live pour confirmations

---

## 🔔 Gestion des Notifications

### Stratégie Multi-Niveau
1. **Notifications natives** (si permissions accordées)
2. **Bannières in-app** (fallback)
3. **Export calendrier** (.ics) pour fiabilité

### Limitations Navigateur
- **Android/Chrome** : notifications de fond OK
- **iOS/Safari** : limitations importantes
- **Solution** : fallback obligatoire + documentation

---

## 🧪 Stratégie de Tests

### Tests Unitaires (Vitest)
```typescript
// Calculs financiers
test('envelope calculation with 10% margin', () => {
  expect(calculateRentFund(35000, 10)).toBe(38500)
})

// Parsing tolérant
test('parse flexible input', () => {
  expect(parseTransaction('1500 transport trajet')).toEqual({
    amount: 1500,
    category: 'transport',
    note: 'trajet'
  })
})

// Chiffrement
test('encrypt/decrypt cycle preserves data', async () => {
  const data = { test: 'value' }
  const encrypted = await encryptJSON(data, key)
  const decrypted = await decryptJSON(encrypted, key)
  expect(decrypted).toEqual(data)
})
```

### Tests d'Intégration
- QuickAdd → Transaction → Mise à jour Budgets
- Revenu Extra → Proposition répartition → Enregistrement
- Export CSV → Format UTF-8 correct

### Tests E2E (Playwright)
```typescript
test('quick expense flow', async ({ page }) => {
  await page.goto('/quick-add')
  await page.click('[data-testid="transport-1500"]')
  await expect(page.locator('.success-toast')).toContainText('1 500 XAF')
  // Vérifier mise à jour budget
})
```

---

## 📊 Critères de Performance

### Métriques Cibles
- **LCP** : < 2s (mobile milieu de gamme)
- **TTI** : < 2s
- **Bundle initial** : < 200KB gzippé
- **Lighthouse PWA** : ≥ 90

### Optimisations
- Code splitting par route
- Service Worker cache-first
- Lazy loading composants
- Compression assets

---

## 🚀 Scripts NPM

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  }
}
```

---

## ✅ Definition of Done

### Fonctionnalités Core
- [ ] PWA installable + offline fonctionnel
- [ ] PIN 6 chiffres + chiffrement AES-GCM opérationnel
- [ ] QuickAdd +1 500 Transport en ≤ 3s
- [ ] Calculs budgets (marge 5%/10%, transport 21,7)
- [ ] Coussin d'urgence ~438 000 XAF + progression
- [ ] Rappels 1-5 & 8 dans plage horaire + fallback
- [ ] Rappels loyer J-30/J-7 si date fournie
- [ ] Rapport mensuel + Export CSV UTF-8

### Qualité
- [ ] Tests unitaires/intégration/E2E verts
- [ ] A11y WCAG AA validée
- [ ] Performance Lighthouse ≥ 90
- [ ] TypeScript strict sans erreurs
- [ ] Documentation README complète

---

## ⚠️ Risques & Limitations Identifiés

### Techniques
1. **Notifications iOS** : limitations Safari → fallback obligatoire
2. **Stockage local** : quotas navigateur → gestion d'erreurs
3. **Performance mobile** : optimisation bundle critique
4. **Chiffrement** : impact performance sur mobiles anciens

### Fonctionnels
1. **Pas de sync** : données perdues si device cassé
2. **Pas de backup cloud** : responsabilité utilisateur
3. **Parsing limité** : peut échouer sur formats exotiques
4. **Calendrier export** : dépend du client email/calendrier

### Recommandations
- **Documentation** claire des limitations
- **Guide sauvegarde** pour l'utilisateur
- **Tests** sur vrais devices mobiles
- **Monitoring** erreurs côté client (sans tracking)

---

## 📝 Prochaines Étapes

1. **Setup projet** : Vite + React + TypeScript + Dexie
2. **Data layer** : Schema DB + chiffrement + repositories
3. **Domain layer** : Calculs financiers + règles métier
4. **UI Core** : QuickAdd → Budgets → Settings
5. **PWA** : Service Worker + manifest + notifications
6. **Tests** : Unit → Integration → E2E
7. **Perf** : Optimisation + audit Lighthouse
8. **Documentation** : README + guide utilisateur

---

*Spécifications v1.0 - Budget Douala PWA*
