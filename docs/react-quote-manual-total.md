# Invoice Ninja React : heures conservées, taux supprimé, total manuel

## Comportement demandé

Uniquement pour les tâches des devis React :
- afficher et modifier les **Heures** ;
- masquer uniquement le **Taux horaire**, sans masquer les taux de taxe ;
- permettre la saisie libre du **Total** sans multiplication automatique par les heures ;
- préserver les produits, les factures et le suivi des tâches.

Le backend de ce dépôt gère déjà les champs JSON manual_total et task_hours dans app/DataMapper/InvoiceItem.php, le PDF dans app/Utils/Traits/MakesInvoiceValues.php et app/Utils/HtmlEngine.php, et les tests dans tests/Unit/CleanLineItemsTest.php.

Lorsqu'un total est saisi manuellement : quantity=1, cost=total saisi, manual_total=true, task_hours=heures réelles. Une tâche historique est convertie lors de sa première modification en conservant son ancien total quantity * cost.

## Sources frontend et correction

Le dépôt Laravel n'inclut pas les sources React, seulement des bundles compilés dans public/. Les sources sont hébergées séparément dans https://github.com/invoiceninja/ui.

Le script scripts/react/apply-manual-quote-total.mjs transforme exactement sept fichiers dans un checkout React. Il vérifie les ancres du code source et s'arrête en cas de version divergente.

Commit React ciblé : 34098c42ebc6acbcae3b35b314067d0429a51600

## Build reproductible sur GitHub

Workflow : .github/workflows/react_quote_manual_total.yml

Il :
1. récupère un checkout React au commit précis ci-dessus ;
2. exécute le script et génère un patch Git valide via git diff ;
3. installe les dépendances avec Node.js 22 ;
4. compile avec le fichier vite.config.ts.react de ce dépôt ;
5. met en artifact react-quote-manual-total.patch, react-quote-manual-total-dist.tar.gz et SHA256SUMS.

L'artifact est un candidat au déploiement, pas une validation métier. Il n'est jamais déployé automatiquement.

## Compilation manuelle

Sur une machine Linux avec Node.js 22+ :

~~~bash
WORK=/www/invoiceninja-build
mkdir -p "$WORK"

git clone https://github.com/nPhenix-IT/invoice.git "$WORK/backend-invoice"
git clone https://github.com/invoiceninja/ui.git "$WORK/react-quote"

cd "$WORK/react-quote"
git checkout --detach 34098c42ebc6acbcae3b35b314067d0429a51600

node "$WORK/backend-invoice/scripts/react/apply-manual-quote-total.mjs" "$WORK/react-quote"

cp "$WORK/backend-invoice/vite.config.ts.react" vite.config.js
cp .env.example .env
sed -i 's/^VITE_IS_TEST=.*/VITE_IS_TEST=false/' .env

npm ci
npm run build
git diff --check
~~~

La sortie compilée est le dossier dist/. Ne pas appliquer l'ancien patch stocké dans l'autre dépôt.

## Publication sur aaPanel après tests

Domaine : facture.clyntia.com
Installation : /www/wwwroot/facture.clyntia.com

1. Télécharger l'artifact d'un workflow réussi et vérifier SHA256SUMS.
2. Extraire react-quote-manual-total-dist.tar.gz dans un dossier de préparation distinct.
3. Vérifier les fichiers dist/index.html et les ressources JS/CSS.
4. Valider le fonctionnement sur une copie de l'installation ayant une base de données isolée ; désactiver les paiements et e-mails réels.
5. Sauvegarder public/ et resources/views/react/index.blade.php, ainsi que la base de données.
6. Vérifier la liste de copie avec rsync -avn ; publier les ressources React sans supprimer les fichiers Laravel, Flutter et de stockage.
7. Comparer puis installer dist/index.html comme resources/views/react/index.blade.php.
8. Vider le cache des vues Laravel et tester le chargement du frontend avec cache navigateur/Cloudflare invalidé.

Le build du frontend ne remplace PAS à lui seul le code PHP : les trois fichiers backend nécessaires doivent être présents sur l'installation.

## Tests fonctionnels indispensables

- Nouveau devis : tâche Main-d'oeuvre, 24 heures, 1 735 520 FCFA.
- Modifier 24 heures en 30 : le total demeure 1 735 520 FCFA.
- Modifier le total : les heures demeurent inchangées.
- Sauvegarder, rouvrir, PDF, duplication, conversion en facture.
- Devis ancien 3 h × 10 000 FCFA : total 30 000 conservé.
- Taxes, remises, devis multi-devises et écrans mobiles.
- Aucun changement des écrans factures, produits ou du suivi du temps.

Cette branche ne remplace pas les bundles présents dans public/. Une fusion GitHub n'installe donc pas encore la nouvelle interface sur le serveur de production.
