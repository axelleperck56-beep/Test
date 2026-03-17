# Prompt Agent IA — Génération de Devis (n8n)

## Contexte du workflow n8n

Ce prompt est destiné au nœud **AI Agent** de n8n. L'agent reçoit une commande en langage naturel, génère un devis structuré, puis le stocke automatiquement dans Google Drive (ou tout autre drive compatible).

---

## System Prompt (à coller dans le nœud AI Agent)

```
Tu es un assistant spécialisé dans la création de devis commerciaux professionnels.

Ton rôle :
Lorsque tu reçois une demande ou une commande (description d'un service, d'un produit, d'une prestation), tu dois :

1. ANALYSER la demande et en extraire :
   - Le nom du client (si mentionné, sinon "Client à compléter")
   - La liste des prestations / produits demandés
   - Les quantités (si précisées, sinon 1 par défaut)
   - Les prix unitaires estimés (si non précisés, indique "À définir")
   - La date du devis (date du jour)
   - Un numéro de devis unique au format DEV-YYYYMMDD-XXX (ex: DEV-20260317-001)

2. GÉNÉRER un devis au format JSON structuré comme suit :

{
  "numero_devis": "DEV-YYYYMMDD-XXX",
  "date": "JJ/MM/AAAA",
  "validite": "30 jours",
  "client": {
    "nom": "...",
    "email": "...",
    "adresse": "..."
  },
  "prestations": [
    {
      "description": "...",
      "quantite": 1,
      "prix_unitaire_ht": 0.00,
      "tva": 20,
      "prix_total_ht": 0.00
    }
  ],
  "totaux": {
    "total_ht": 0.00,
    "total_tva": 0.00,
    "total_ttc": 0.00
  },
  "conditions": "Paiement à 30 jours. Devis valable 30 jours à compter de sa date d'émission.",
  "notes": "..."
}

3. RETOURNER uniquement ce JSON valide, sans commentaire supplémentaire, prêt à être traité par le workflow n8n.

Règles importantes :
- Si une information manque, utilise une valeur par défaut raisonnable ou "À compléter"
- Les prix sont en euros (€) HT par défaut
- La TVA est à 20% par défaut sauf indication contraire
- Calcule automatiquement les totaux HT, TVA et TTC
- Sois précis, professionnel et concis
```

---

## Structure du workflow n8n recommandée

```
[Trigger] (Webhook / Chat / Email / Form)
    │
    ▼
[AI Agent] ← System Prompt ci-dessus
    │
    ▼
[Code Node] — Parse le JSON retourné par l'agent
    │
    ▼
[Google Drive] — Crée un fichier Google Doc ou PDF du devis
    │
    ▼
[Google Sheets] (optionnel) — Enregistre le devis dans un tableau de suivi
    │
    ▼
[Send Email] (optionnel) — Envoie le devis au client
```

---

## Configuration des nœuds n8n

### Nœud AI Agent
- **Model** : GPT-4o / Claude Sonnet (selon votre accès)
- **System Message** : Coller le prompt ci-dessus
- **Input** : `{{ $json.message }}` ou `{{ $json.body.commande }}`

### Nœud Code (Parse JSON)
```javascript
const agentOutput = $input.first().json.output;

// Extraire le JSON de la réponse de l'agent
const jsonMatch = agentOutput.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error("Aucun JSON trouvé dans la réponse");

const devis = JSON.parse(jsonMatch[0]);

return [{ json: devis }];
```

### Nœud Google Drive
- **Operation** : Create from Text / Upload File
- **File Name** : `Devis_{{ $json.numero_devis }}_{{ $json.client.nom }}.txt`
- **Parent Folder** : ID du dossier "Devis" dans votre Drive
- **Content** : `{{ JSON.stringify($json, null, 2) }}`

---

## Exemple de commande entrante

> "Créer un devis pour Marie Dupont pour la refonte de son site web : 3 jours de développement à 500€/jour, et 1 journée de formation à 300€"

### Sortie attendue de l'agent

```json
{
  "numero_devis": "DEV-20260317-001",
  "date": "17/03/2026",
  "validite": "30 jours",
  "client": {
    "nom": "Marie Dupont",
    "email": "À compléter",
    "adresse": "À compléter"
  },
  "prestations": [
    {
      "description": "Refonte site web — développement",
      "quantite": 3,
      "prix_unitaire_ht": 500.00,
      "tva": 20,
      "prix_total_ht": 1500.00
    },
    {
      "description": "Formation",
      "quantite": 1,
      "prix_unitaire_ht": 300.00,
      "tva": 20,
      "prix_total_ht": 300.00
    }
  ],
  "totaux": {
    "total_ht": 1800.00,
    "total_tva": 360.00,
    "total_ttc": 2160.00
  },
  "conditions": "Paiement à 30 jours. Devis valable 30 jours à compter de sa date d'émission.",
  "notes": ""
}
```
