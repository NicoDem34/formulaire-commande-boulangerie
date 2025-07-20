# formulaire-commande-boulangerie
Formulaire de commande bilingue pour la boulangerie de Goult

## Lancer le formulaire en local

Deux méthodes sont possibles :

1. **Ouvrir `index.html`** : il suffit de double‑cliquer sur `index.html` dans votre explorateur de fichiers pour afficher le formulaire dans votre navigateur.
2. **Démarrer un petit serveur HTTP** : depuis ce dossier, lancez par exemple `python3 -m http.server` puis ouvrez `http://localhost:8000/index.html` dans votre navigateur.

## Modifier les produits

Toutes les informations sur les catégories et produits sont stockées dans `data.js`. Ce fichier définit la constante `DATA` utilisée par l'application. Pour modifier un produit, éditez simplement ses propriétés (nom, description, prix ou jours de disponibilité) à l'intérieur de ce fichier.

## Rôle de `app.js`

Le fichier `app.js` gère la logique du formulaire : changement de langue, génération des listes de produits et (une fois implémentée) l'affichage du récapitulatif de commande.
