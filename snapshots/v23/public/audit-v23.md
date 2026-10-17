# Mission Explore — audit v23

Date : 17 octobre 2026. Portée : code, tests fonctionnels existants, styles MapLibre et composition Canvas des feuilles. Cet audit ne constitue pas une validation terrain ou une certification cartographique.

## Corrections livrées

- Sentiers en tirets plus lisibles; suppression du trait clair continu sous les sentiers et des doubles traits des chemins forestiers. Les tracés personnalisés pointillés et GPX pointillés n'ont plus de halo blanc. Les couleurs d'activité restent disponibles.
- Courbes calculées : filtre binomial 3 × 3 sur les altitudes, avant extraction des isolignes; préservation des pixels sans données et continuité du filtre aux bords. Jointures arrondies. Aucun retraitement des courbes officielles fournies en raster. Ce lissage ne rend pas un MNT plus précis et peut déplacer légèrement les isolignes.
- Boussole discrète intégrée aux réglages du fond; clic pour remettre le nord en haut. Suppression du panneau permanent de déclinaison. Calcul WMM2025 dans l'atelier uniquement, avec délai maximal réseau.
- Informations de nord et déclinaison sans rectangle de fond. Feuille avec marge réservée : titre, date, centre, nord vrai et magnétique, échelle numérique et graphique, projection/datum, quadrillage, équidistance et origine des courbes, attribution. Notes et symboles détaillés en annexe.
- Export SIG : cadre cartographique seul pour PNG/PGW/PRJ et GeoTIFF, sans marges qui fausseraient le géoréférencement. Le ZIP ajoute une feuille PNG complète; l'impression utilise cette même composition.
- Barre de modes/projets intégrée aux commandes du fond. Messages d'inspection et notifications dans une pile commune. Réglages masqués lorsque le profil d'élévation occupe leur emplacement. Les indices en marge sont limités explicitement à trois lignes; l'annexe accueille les listes longues.

## Contrôles effectués

25 scripts JavaScript de tests exécutés avec succès après corrections, plus vérification TypeScript. Validation des styles et expressions MapLibre : cinq fonds et huit profils d'activité. Contrôles couvrant :

| Domaine | Contrôle | Limite |
| --- | --- | --- |
| Démarrage et interface | Initialisation, états accueil/dessin/itinéraire, restauration | Pas de session navigateur réelle |
| Affichage | Styles complets, mélanges fond/image, opacités, catégories, contour seul du territoire public | Lisibilité réelle selon écran à vérifier |
| Courbes | Nodata, intervalles 2,5/5 m, lissage de bruit, plans conservés, bordures | Pas de comparaison terrain ou étude d'erreur verticale |
| Itinéraires | Routage, récupération d'erreurs, découpe, réseau visible, chargement par secteurs | Dépendance à la disponibilité et à la qualité des réseaux |
| Projets | GPX, visibilité, chemins masqués, paramètres, caméra, réouverture sans doublon | Pas de test connecté réel avec un compte utilisateur |
| Communauté | Validation et isolation des données, règles serveur testées | Données de production non modifiées pour le test |
| Forêt et territoire | Couverture, filtrage, infrastructure, sélection | Exhaustivité des données non garantie |
| Orientation | Modèle WMM2025 réel, validation dates/coordonnées, signes est/ouest, absence de masque | Altitude du modèle : 0 m; nord de grille distinct du nord vrai |
| Export | Dimensions, Mercator, fichier monde, véritable écriture/lecture GeoTIFF | Pas d'ouverture QGIS ou d'impression physique |
| Composition | Rendu des fonctions Canvas sur feuille A4 portrait et paysage, inspection des images obtenues | Fond de test synthétique, pas capture d'une carte dans le navigateur |

## Points restant à valider pour une qualité de référence

1. **Priorité haute — parcours navigateur et téléphone** : tester 360/390/768/1440 px, orientation paysage, clavier, menus ouverts, dessin, profil, notifications simultanées, import GPX volumineux et impression. Le contrôle navigateur n'était pas disponible dans cet environnement. Les corrections de superposition ne sont donc pas déclarées vérifiées sur tous les écrans.
2. **Priorité haute — couverture réelle** : échantillons terrain en forêt, zones sans LiDAR, intersections et chemins fermés. Mesurer fraîcheur, couverture et erreurs plutôt que supposer l'exhaustivité.
3. **Priorité haute — export multi-échelles** : les courbes sélectionnées sont celles du fond capturé; le mode automatique ne recalcule pas encore son choix d'origine selon l'échelle d'impression. La provenance indique l'origine capturée. Une couche peut devenir invisible hors de son niveau de zoom.
4. **Priorité moyenne — légende entièrement dynamique** : la feuille montre les conventions de traits; les couleurs de difficulté dépendent du profil. Les tracés et symboles du projet sont détaillés dans l'annexe. Une légende exhaustive de toutes les couches forestières/thématiques reste à développer.
5. **Priorité moyenne — orientation avancée** : afficher un diagramme à trois nords avec convergence du quadrillage. La déclinaison actuelle relie nord vrai et nord magnétique; ce n'est pas l'angle grille-magnétique.
6. **Priorité moyenne — persistance et reprise** : tester sauvegardes cloud réelles, conflits entre appareils, quotas et reprise après perte réseau. La sauvegarde du code ne sauvegarde pas les données D1 des utilisateurs.
7. **Priorité moyenne — performances et accessibilité** : mesures sur appareils modestes, contrastes sur orthophoto, daltonisme, navigation clavier et lecteur d'écran. Aucun score de performance inventé.

## Références cartographiques

Les choix s'inspirent des conventions suivantes, sans revendiquer une conformité officielle NTS/USGS :

- Ressources naturelles Canada, [Topographic maps: tips and hints](https://natural-resources.canada.ca/maps-tools-publications/maps/topographic-maps/topographic-maps-tips-hints).
- Ressources naturelles Canada, [Orienting a topographic map](https://natural-resources.canada.ca/maps-tools-publications/maps/topographic-maps/orienting-topographic-map).
- USGS, [US Topo cartographic specifications and map symbol guide](https://www.usgs.gov/ngp-standards-and-specifications/us-topo-cartographic-specifications-map-symbol-guide).
- USGS, [Topographic map symbols](https://pubs.usgs.gov/gip/70039472/topomap.pdf).
- Générateur utilisé : [maplibre-contour](https://github.com/onthegomap/maplibre-contour). Le filtre ajouté est local et doit être conservé lors des mises à jour du fichier vendor.
