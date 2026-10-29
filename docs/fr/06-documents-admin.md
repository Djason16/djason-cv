# 6. Documents de l'admin

[← Documentation](README.md)

La page admin crée des **devis**, **factures** et **contrats** en PDF, à partir des clients, missions et services de la base de données.
Rien n'est gardé sur le serveur : le PDF est téléchargé directement.

| Partie | Où |
| ------ | -- |
| Écran | `components/views/Admin/DocumentsModal.vue` (une seule fenêtre, `kind` = devis, facture ou contrat) |
| Données, questions à l'admin, remplissage du modèle | `composables/useDocuments.js` (missions, clients et services, regroupés par document) |
| Règles et montants | `utils/documents.js` (règles de paiement par service, totaux, échéances, prix) |
| Vérifications avant création | `utils/documentChecks.js` |
| Modèles | `components/views/Documents/` : `DocumentContainer` (devis / facture), `ContractContainer` (contrat) |
| Export PDF | `utils/pdf.js` (html2pdf.js, dans le navigateur) |

## Un document par groupe

| Client | Regroupé par | Documents |
| ------ | ------------ | --------- |
| Entreprise | client et mois | Facture seulement (mensuelle, le jour affiché `XX`) |
| Particulier, freelance, association | client, jour de la mission et service | Devis, facture et contrat |

## Vérifications

Rien n'est créé s'il manque quelque chose. Une alerte liste ce qu'il faut corriger, par exemple :

- ton SIRET ou ton adresse dans le `.env` ([Configuration](02-configuration.md))
- l'adresse du client
- le prix de la mission
- IBAN / BIC
- pour un contrat : un taux d'intérêt actif aujourd'hui (admin → Taux d'intérêt)

## Modifier un modèle

Modifie librement les composants de `components/views/Documents/`, mais **garde leurs classes CSS** :
les sauts de page du PDF en dépendent.
