# Mission Explore · OSM

La livraison active couvre le Québec. Voir `docs/quebec-expansion.md` pour les données provinciales et les commandes. Les commandes régionales ci-dessous restent disponibles pour reconstruire un extrait pilote.

Adaptation du module utilisateur mission-explore-trails-v0.1 : extraction pyosmium en deux passes, relations et attributs conservés. Aucune extraction Trailforks, Garmin ou AllTrails.

## Construction manuelle reproductible
Installer `osmium` et `pmtiles` pour Python, et les dépendances Node verrouillées du projet. Télécharger les deux extraits OSM France listés dans `public/data/mission-trails-stats.json` dans un répertoire temporaire. Puis :

```
python scripts/trails/extract_trails.py /tmp/bsl.osm.pbf /tmp/bsl.geojsonseq
python scripts/trails/extract_trails.py /tmp/gaspesie.osm.pbf /tmp/gaspesie.geojsonseq
node scripts/trails/tile.mjs /tmp/bsl.geojsonseq,/tmp/gaspesie.geojsonseq /tmp/mission-tiles
python scripts/trails/pack.py /tmp/mission-tiles public/data/mission-trails-v05.pmtiles
```

Copier les statistiques produites et conserver les timestamps de réplication des en-têtes PBF. Dédupliquer les ways par ID. La boîte du pilote exclut les Îles-de-la-Madeleine. Le pipeline conserve les portions routières des relations vélo/marche; les voies sans géométrie complète sont ignorées (25 dans cette version). geojson-vt 5 / vt-pbf génèrent les tuiles z8–14; au-delà, surzoom. Pas de décimation par densité. Les géométries sont simplifiées à une tolérance d’un pixel de tuile 4096, y compris au zoom maximal. PMTiles v3 compressé gzip, lecture par blocs statiques de 128 Kio côté navigateur (cache de 16 blocs), car cet hébergement ne préserve pas HTTP Range. Le fichier complet reste disponible pour téléchargement et réutilisation. La mise à jour n’est pas automatique.

## Échelles et accès
IMBA 0 blanc, 1 vert, 2 bleu, 3 noir, 4 double noir (liseré). Aucune conversion de mtb:scale (STS) en IMBA : sélecteurs séparés. SAC T1–T6 également indépendant. Données absentes ou non standard conservées brutes dans la fiche, classées inconnues pour la coloration. Les filtres d’usage sont inclusifs (OU), une voie peut appartenir à plusieurs réseaux. Les attributs private (access, bicycle, foot) masquent le tronçon par défaut dans cette couche. Le fond et AQréseau+ restent distincts. Aucune permission d’accès déduite des attributs absents.

## Routage
Les PMTiles sont un produit d’affichage, jamais un graphe. Le routage existant BRouter reste inchangé. Un futur graphe régional doit partir des PBF conservant les nœuds, identifiants de ways, directions et restrictions; le même extrait OSM peut alimenter les deux chaînes. Les relations de restriction et leur application ne sont pas implémentées dans l’extracteur d’affichage.

Données © OpenStreetMap contributors, ODbL. Extraits par OpenStreetMap France. Provenance et statistiques dans le JSON public. Archive téléchargeable dans Sources pour les données dérivées. Code PMTiles BSD-3, licence incluse avec le script.

## Infrastructures

À partir des mêmes PBF régionaux :

```
python scripts/trails/extract_infrastructure.py /tmp/bsl.pbf /tmp/gaspesie.pbf /tmp/infrastructure.geojson
node scripts/trails/tile_infrastructure.mjs /tmp/infrastructure.geojson /tmp/infrastructure-tiles
python scripts/trails/pack_infrastructure.py /tmp/infrastructure-tiles public/data/infrastructure-v1.pmtiles
```

Lignes `power=line` et `minor_line`, points `tower`, `pole`, tours/mâts et générateurs éoliens. Pas de liaison déduite entre supports, ni de conversion d'une emprise en sentier. Les objets sont dédupliqués par type et ID OSM. Les géométries invalides sont comptabilisées, pas reconstituées. Les bâtiments polygonaux de tours ne sont pas convertis en points arbitraires. Archive MVT z8–14, points dès z13, surzoom pour les poteaux z15. Les lignes secondaires ne sont incluses qu'à partir de z12. Statistiques et date de réplication des extraits dans `infrastructure-stats.json`. L'inventaire reste partiel et ne certifie pas les droits de passage. Pour tout le Québec, voir `docs/quebec-expansion.md`.

## Exports QGIS — géométries sources

Après les deux extractions, exécuter :

```
python scripts/trails/export_sources.py public/data/export-osm /tmp/bsl.geojsonseq /tmp/gaspesie.geojsonseq
```

Les cellules de 0,1° répètent les objets qui les traversent. Le navigateur déduplique par `osm_way_id`. Les coordonnées OSM originales sont conservées, indépendamment des tuiles et de leur simplification. La sélection se fait par enveloppe, conserve les objets entiers et inclut les accès privés; elle ne constitue pas une découpe exacte.

GeoPackage et Shapefile sont construits dans un Web Worker à la demande, sans bloquer les déplacements de carte. GeoPackage conserve les noms d’attributs et valeurs numériques. Shapefile utilise des champs F001… (dictionnaire joint), UTF-8 et au maximum 254 octets par champ texte; la provenance indique une éventuelle troncature. Les téléchargements forestiers interrogent le WFS MRNF avec filtre spatial et exercice. Les exports denses sont refusés au lieu d’être tronqués.
