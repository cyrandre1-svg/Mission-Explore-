# Mission Explore · Québec

Extension livrée dans le source du 16 octobre 2026 (heure de Montréal).

## Couverture

- Navigation sur l'emprise Québec `[-80,44.9,-57,62.7]`, avec accès rapide à Montréal, Québec, Saguenay, Abitibi, Outaouais, Estrie, Nord-du-Québec et à l'ancien secteur pilote.
- Extrait Geofabrik Québec, réplication `2026-10-15T20:21:00Z` : 762 762 tronçons OSM d'affichage (3 266 cotés IMBA) et 511 933 objets d'infrastructure. Inventaire OSM partiel; les accès, conditions et lacunes restent à vérifier. Le découpage de l'extrait suit les limites du Québec; l'emprise de navigation est rectangulaire et comprend des zones voisines.
- AQréseau, itinéraires BRouter, services forestiers, tenure, ESA WorldCover, imagerie et MNT RNCan acceptent désormais les positions de l'emprise provinciale. Les limites de surface, durée et nombre d'objets par requête sont maintenues. La disponibilité réelle dépend de chaque fournisseur.
- Le relief global reste en fond sous l'ombrage LiDAR lorsqu'il est disponible. Les modèles sans données gardent leurs pixels transparents. L'absence de courbes locales ne signifie pas un terrain plat; les modes globaux 20/50/100 m restent disponibles.
- Les inventaires spécialisés eaux vives / ski et l'index de feuillets LiDAR restent limités au Bas-Saint-Laurent / Gaspésie. Cette limite apparaît dans Carte et Sources.

## Livraison des données

Les tuiles d'affichage z8–14 sont préparées hors navigateur puis empaquetées en PMTiles. Les archives sont divisées en blocs de 128 Kio pour cet hébergement sans Range. Le navigateur conserve un cache borné de 16 blocs par source.

| Données | Volume de l'archive | Blocs |
| --- | ---: | ---: |
| Voies OSM | 137 906 899 octets | 1 053 |
| Infrastructures | 27 513 397 octets | 210 |

Les originaux destinés aux exports QGIS sont répartis en 2 137 fichiers gzip, totalisant 79 784 329 octets. L'index (~186 Ko) est lu au lancement d'un export. Les coordonnées OSM originales sont conservées. Un export dépassant 5 000 objets est refusé avant téléchargement complet.

Les manifestes publics `quebec-trails-stats.json` et `quebec-infrastructure-stats.json` contiennent provenance, date et empreinte SHA-256. `public/data/rebuild-archive.py` permet de reconstruire et vérifier une archive complète depuis ses blocs.

## Reconstruction

Utiliser des répertoires temporaires et de sortie vides. Python : osmium et pmtiles. Node : dépendances verrouillées du dépôt.

```sh
python scripts/trails/extract_trails.py /tmp/quebec.pbf /tmp/qc-trails.seq --bounds=-80,44.9,-57,62.7 --index=sparse_file_array,/tmp/qc-trail-nodes.idx
python scripts/trails/extract_infrastructure.py /tmp/quebec.pbf /tmp/qc-infrastructure.geojson --bounds=-80,44.9,-57,62.7 --index=sparse_file_array,/tmp/qc-power-nodes.idx
node --max-old-space-size=4096 scripts/trails/tile_quebec.mjs /tmp/qc-trails.seq /tmp/qc-trail-tiles trails
node --max-old-space-size=4096 scripts/trails/tile_quebec.mjs /tmp/qc-infrastructure.geojson /tmp/qc-power-tiles infrastructure
python scripts/trails/pack_quebec.py /tmp/qc-trail-tiles /tmp/qc-trails.pmtiles public/data /tmp/quebec.pbf trails
python scripts/trails/pack_quebec.py /tmp/qc-power-tiles /tmp/qc-power.pmtiles public/data /tmp/quebec.pbf infrastructure
python scripts/trails/export_quebec.py /tmp/qc-trails.seq public/data/export-quebec /tmp/qc-export-cells /tmp/quebec.pbf
```

Le tuilage est partitionné selon une grille z7; chaque tuile de sortie appartient à une seule cellule. Une marge conserve les géométries aux raccords. Aux zooms 8–9, seules les voies appartenant à un itinéraire sportif sont présentes; les sentiers et chemins détaillés commencent au zoom 10. Les attributs vides et les identifiants MVT redondants sont omis, tandis que `osm_way_id` reste conservé. Les petits objets simplifiés à faible zoom peuvent réapparaître aux grands zooms. Les géométries incomplètes ne sont pas inventées. L'extraction des voies n'a signalé aucune géométrie incomplète sur cet extrait.

## Vérification

`tests/quebec-data.cjs` vérifie les SHA-256 complets, lit réellement les PMTiles, compare les identifiants OSM des exports et des tuiles à Montréal, Québec, Abitibi et Chibougamau, puis contrôle un chemin traversant une frontière de partition z7. `tests/quebec-coverage.cjs` couvre les garde-fous et requêtes hors de l'ancien pilote, y compris Kuujjuaq et Blanc-Sablon.

Le traitement des doublons calcule les distances selon la latitude et ne réindexe que les portions conservées à l'affichage pour éviter une suppression en chaîne de chemins voisins. Les données originales restent disponibles au routage.

Sondes réseau effectuées avant publication : AQréseau près de Québec (réponse avec deux objets), BRouter à Montréal (géométrie reçue) et catalogue forestier officiel (XML reçu). Aucune mesure de fluidité ni vérification visuelle sur téléphone n'est annoncée. À vérifier sur appareil : temps avant une carte utilisable, déplacements rapides, mémoire et volume transféré sur une connexion mobile.
