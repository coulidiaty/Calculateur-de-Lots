# Calculateur de Lots

Calculateur de taille de position, en un seul fichier HTML. Il calcule le nombre de lots à prendre pour un risque donné, **sur plusieurs comptes à la fois** — y compris quand ces comptes sont chez des brokers différents.

Aucune dépendance, aucune installation : ouvre `index.html` dans un navigateur.

## Pourquoi plusieurs comptes

Un même symbole n'a pas la même taille de contrat d'un broker à l'autre. Le S&P 500 peut valoir 50 $ le point chez l'un et 1 $ le point chez l'autre ; l'or, 100 onces par lot chez l'un et 10 chez l'autre.

Un calculateur qui ne connaît qu'une seule valeur par actif est donc juste chez un broker et faux chez les autres. Ici, la valeur monétaire se règle **par actif et par compte**.

## Utilisation

Trois écrans.

1. **Actif** — tu choisis le symbole
2. **Risque** — en dollars ou en pourcentage du capital, un montant par compte. Les montants déjà utilisés sont proposés en un clic.
3. **Stop** — la distance de ton stop, telle qu'elle s'affiche sur ton graphique

Le résultat donne, pour chaque compte : le nombre de lots, le risque réel et le risque visé.

## Réglages

**Comptes** — un nom et un capital. Le capital ne sert qu'au mode « pourcentage ».

**Actifs** — pour chaque actif, une valeur par compte : *combien vaut, en dollars, une unité de distance de stop, pour 1 lot*.

L'unité de distance est celle que tu lis sur ton graphique. Reste toujours sur la même source : si tu changes de fournisseur de données, l'échelle peut changer d'un facteur 10.

**Options** — deux interrupteurs, éteints par défaut :

- *Diviseur de lots* : affiche en plus le lot divisé par 2, 3, 4… pour les entrées fractionnées
- *Commissions* : une commission par lot, par actif et par compte, retirée du budget de risque

Les actifs se réordonnent avec les flèches. Les réglages sont conservés dans le navigateur (`localStorage`).

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

Le calculateur suppose des comptes libellés dans la devise de profit de l'instrument. Pour un actif coté dans une autre devise, saisis une valeur déjà convertie.

## Calcul

```
coût d'un lot = distance du stop × valeur d'une unité + commission
lots          = risque ÷ coût d'un lot
```

Le résultat est arrondi au centième le plus proche, au-dessus ou en dessous, pour tomber au plus près du risque visé. L'écart est signalé quand il dépasse 1 %, et le risque réellement encouru est toujours affiché à côté du risque visé.

## Licence

MIT
