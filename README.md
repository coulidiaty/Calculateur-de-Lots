# Calculateur de Lots

Calculateur de taille de position. Il calcule le nombre de lots à prendre pour le risque que tu veux prendre, sur ton compte.

Aucune dépendance, aucune installation : ouvre `index.html` dans un navigateur.

## Utilisation

Trois écrans, ou deux avec le risque fixe.

1. **Actif** — tu choisis le symbole
2. **Risque** — le montant que tu acceptes de perdre, en dollars ou en pourcentage du capital. En pourcentage, le capital se saisit sur le même écran et l'équivalent en dollars s'affiche. Les montants déjà utilisés sont proposés en un clic.
3. **Stop** — la distance de ton stop, telle qu'elle s'affiche sur ton graphique

Le résultat donne le nombre de lots et le risque réellement encouru.

### Risque fixe

Pour ne pas ressaisir le risque à chaque calcul, active **Risque fixe** dans les Paramètres (et règle le montant juste en dessous), ou **Garder ce risque** sur l'écran Risque. Le calcul passe alors directement de l'actif au stop. L'écran Stop rappelle le risque utilisé, avec un lien **Modifier**.

## Réglages

**Risque** — l'option *Risque fixe* et son montant, en $ ou en %.

**Compte** — le capital. Il ne sert qu'au mode « pourcentage ».

**Actifs** — pour chaque actif, la *valeur en dollars* d'une unité de distance de stop pour 1 lot, telle que donnée par MetaTrader, et la commission par lot quand l'option est activée.

L'unité de distance est celle que tu lis sur ton graphique. Reste toujours sur la même source : si tu changes de fournisseur de données, l'échelle peut changer d'un facteur 10.

**Options** — deux interrupteurs, éteints par défaut :

- *Diviseur de lots* : affiche en plus le lot divisé par 2, 3, 4… pour les entrées fractionnées
- *Commissions* : une commission par lot et par actif, retirée du budget de risque

Les actifs se réordonnent avec les flèches. Les réglages sont conservés dans le navigateur (`localStorage`). Les réglages de l'ancienne version multi-comptes sont repris automatiquement, à partir du premier compte.

## Trouver la valeur d'une unité

Elle se déduit de la fiche du symbole chez ton broker :

```
valeur = taille du contrat × taille d'une unité de ton graphique
```

Exemple sur EURUSD : contrat de 100 000, unité de 0,0001 → **10 $**.

Si la fiche affiche une taille de contrat arrondie ou inutilisable, elle se recoupe avec la marge :

```
valeur du contrat = marge par lot ÷ taux de marge
taille du contrat = valeur du contrat ÷ cours actuel
```

Le calculateur suppose un compte libellé dans la devise de profit de l'instrument. Pour un actif coté dans une autre devise, saisis une valeur déjà convertie.

## Calcul

```
coût d'un lot = distance du stop × valeur d'une unité + commission
lots          = risque ÷ coût d'un lot
```

Le résultat est arrondi au centième le plus proche, au-dessus ou en dessous, pour tomber au plus près du risque visé ; le risque réellement encouru est affiché. Quand le calcul donne moins de 0,01 lot, le lot minimum est retenu et signalé.

## Organisation du code

Chaque module a son dossier. Pas de serveur ni d'outil de build : des scripts classiques, chargés dans l'ordre par `index.html`, qui partagent l'objet global `LotCalc`.

```
index.html              coquille : charge les styles et les scripts
main.js                 démarrage
styles/base.css         styles communs (variables, champs, boutons)
modules/
  commun/               outils partagés
    utils.js            nombres, formatage
    ui.js               icônes, bouton retour, création d'éléments
    navigation.js       enregistrement et affichage des écrans
  stockage/stockage.js  état, sauvegarde, reprise de l'ancienne version
  calcul/calcul.js      calcul de la taille de position (fonctions pures)
  actif/                écran 1 : choix de l'actif
  risque/               écran 2 : risque, et règles du risque fixe
  stop/                 écran 3 : distance du stop (rappel du risque fixe)
  resultat/             résultat et historique
  parametres/           risque fixe, capital, options, actifs
```

Chaque écran déclare son balisage, ses événements (`init`) et son rafraîchissement (`enter`) via `LotCalc.nav.register`. Pour ajouter un écran : créer son dossier, l'enregistrer, et ajouter ses fichiers dans `index.html`.

## Licence

MIT
