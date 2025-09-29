# Guide de Style - Budget Douala

## 🚫 Règles Strictes

### Interdiction Totale des Emojis
- **JAMAIS d'emojis** dans le code, les interfaces, ou les messages
- Utiliser **Heroicons** pour toutes les icônes
- Composant `<Icon>` centralisé pour la cohérence

### Système d'Icônes Heroicons
```tsx
import { Icon, FinanceIcons, ActionIcons, StatusIcons } from './ui'

// Catégories financières
<Icon name={FinanceIcons.salary} />     // currency (salaire)
<Icon name={FinanceIcons.rent} />       // home (loyer)
<Icon name={FinanceIcons.transport} />  // truck (transport)
<Icon name={FinanceIcons.food} />       // shopping-bag (alimentation)
<Icon name={FinanceIcons.data} />       // phone (data/internet)
<Icon name={FinanceIcons.health} />     // heart (santé)
<Icon name={FinanceIcons.leisure} />    // film (loisirs)
<Icon name={FinanceIcons.other} />      // ellipsis (autres)
<Icon name={FinanceIcons.savings} />    // banknotes (épargne)

// Actions
<Icon name={ActionIcons.add} />         // plus (ajouter)
<Icon name={ActionIcons.edit} />        // pencil (éditer)
<Icon name={ActionIcons.delete} />      // trash (supprimer)
<Icon name={ActionIcons.save} />        // check (sauvegarder)
<Icon name={ActionIcons.cancel} />      // x-mark (annuler)
<Icon name={ActionIcons.reset} />       // arrow-path (reset)
<Icon name={ActionIcons.next} />        // arrow-right (suivant)
<Icon name={ActionIcons.back} />        // arrow-left (retour)

// États/Status
<Icon name={StatusIcons.success} />     // check-circle (succès)
<Icon name={StatusIcons.error} />       // x-circle (erreur)
<Icon name={StatusIcons.warning} />     // exclamation-triangle (attention)
<Icon name={StatusIcons.info} />        // information-circle (info)
```

### Messages et Logs
```typescript
// ✅ CORRECT
console.log('Settings sauvegardés avec succès')
console.error('Erreur chargement settings:', error)

// ❌ INTERDIT
console.log('✅ Settings sauvegardés avec succès')
console.error('❌ Erreur chargement settings:', error)
```

### Interface Utilisateur
```tsx
// ✅ CORRECT
<Button>+ Ajouter</Button>
<h3>i Conseil</h3>
<span>✓ Succès</span>

// ❌ INTERDIT  
<Button>➕ Ajouter</Button>
<h3>💡 Conseil</h3>
<span>🎉 Succès</span>
```

### Validation et Messages d'Erreur
```typescript
// ✅ CORRECT
newErrors.rentMonthly = `! Loyer critique : ${percentage}%`
newWarnings.salarySavePct = `i Épargne faible : ${percent}%`

// ❌ INTERDIT
newErrors.rentMonthly = `⚠️ Loyer critique : ${percentage}%`
newWarnings.salarySavePct = `💡 Épargne faible : ${percent}%`
```

## Justification

1. **Professionnalisme** : Interface business-friendly
2. **Cohérence** : Rendu uniforme sur tous les systèmes
3. **Lisibilité** : Caractères standards plus clairs
4. **Maintenance** : Évite les problèmes d'encodage
5. **Accessibilité** : Compatible avec tous les lecteurs d'écran

## Application

Cette règle s'applique à **tous les fichiers** :
- Pages React (.tsx)
- Composants (.tsx) 
- Hooks (.ts)
- Utilitaires (.ts)
- Tests (.test.ts)
- Documentation (.md)

**Aucune exception autorisée.**
