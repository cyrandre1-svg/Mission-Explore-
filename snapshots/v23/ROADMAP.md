# Prochaines versions — demandes retenues

- Sélecteur de fonds d’imagerie : Esri World Imagery, autres fonds ArcGIS et Google Satellite sous réserve des conditions d’intégration, clés et coûts applicables.
- Garder l’opacité réglable et les couches sentiers, relief et tracés indépendantes du fond choisi.

- Onglet Données forestières : coupes récentes, filtre par année, type d’intervention, opacité, date et source de chaque donnée. Vérifier les sources MRNF et leur couverture publique/privée; distinguer la date de travaux de la date de publication des données. Ne pas présenter l’inventaire comme une observation en temps réel.

- Lisibilité des voies et itinéraires (capture mobile du 15 octobre) : séparer le support physique (route / chemin / sentier) de l’itinéraire sportif (vélo / pédestre) qui l’emprunte. Éviter de dessiner deux fois la voie; conserver un marquage d’itinéraire distinct, éventuellement décalé. Ne jamais déduire qu’un itinéraire sur route/chemin est non roulable ou interdit. Mieux distinguer chemins et sentiers avec une symbolique topo, différente du brun fin des courbes de niveau. Bonifier les icônes eaux vives (rapide, chute, obstacle, accès) et la légende.

## V0.7 — Mission Terrain, 15 octobre 2026

Livré : symbolique sentiers/chemins distincte des courbes; itinéraire sportif sur route en liseré décalé; pictogrammes eaux vives; onglets Forêt et Mission Terrain; couches MRNF 1976–2024 (10 ans à la fois); fiche OSM actuelle et pentes RNCan échantillonnées; complétude des attributs distincte d'une confirmation terrain; profil BRouter Aventure original avec préférences séparées et validation du plafond de pente.

À poursuivre : observations datées et vérifiées, concordance entre sources, dédoublonnage géométrique AQréseau/OSM sans perdre les itinéraires, analyse de connectivité/isolation et échappatoires, répartition des surfaces le long d'un parcours, priorité panoramas/sommets, lecture des types d'interventions forestières et détail au clic, couverture récente au-delà de 2024. Le routeur dépend du service BRouter public; son usage à grande échelle reste à organiser. Les chemins absents d'OSM et les données d'accès inconnues ne sont pas validés par le calcul.

Vérification : validation du style MapLibre, tests terrain/GPX/communauté/tuiles, TypeScript; pas de vérification visuelle dans un navigateur pour cette version.

## V0.8 — forêt, imagerie et planification

Livré : période d’interventions demandée jusqu’à 2026, catalogue WMS vérifié automatiquement et années absentes explicitement signalées; PRANA 2026–2027 autorisée distincte des travaux réalisés; peuplements originaux MRNF en couleurs ou contours et fiches GetFeatureInfo au clic; orthophotos forestières par année 2015–2026 avec Esri dans les lacunes, Sentinel été 2025 RGB et hiver 2026 NIR; milieux ouverts au-dessus de l’imagerie avec opacité indépendante; liseré AQréseau activé par défaut et géométries sources consultables; cartes de choix du mode de dessin et barre mobile dégagée.

Le mode Réseau affiché assemble les géométries chargées OSM et AQréseau en graphe local au zoom 13+. Les points sont projetés à moins de 60 m d’une voie; aucune ligne de remplacement en cas de réseau déconnecté. Les intersections géométriques ne sont pas inventées; les altitudes ne sont pas ajoutées. Ce mode géométrique ne vérifie pas les sens de circulation ni les droits propres à une activité. Les accès privés/no déclarés sont exclus et les attributs absents restent inconnus. Les réseaux partiels ou non chargés peuvent empêcher un calcul; dessiner des segments courts dans la vue courante.

Limites restantes : le WMS d’interventions réalisées s’arrête actuellement à 2024; 2025/2026 ne sont pas présentés comme des coupes réalisées. PRANA ne remplace pas un RATF. Les peuplements sont l’inventaire original, pas une observation de terrain en 2026. Orthophotos par année à couverture partielle, sans garantie d’image pour chaque région. Google nécessite une intégration officielle avec clé et conditions adaptées. Pas de fusion automatique OSM/AQ sans examen des géométries proches.

Tests : démarrage réel MapLibre, validation complète des styles y compris imagerie transparente et nouvelles couches, graphe local (jonctions, routes déconnectées, niveaux de pont, privé, ancrages), attributs forestiers, années publiées et absentes, profil/GPX/communauté/PMTiles, TypeScript et compilation. Navigateur visuel non disponible.

## V0.9 — carte universelle et comparaison immédiate

Carte universelle présentée en premier; profils sportifs déplacés dans Sports / options avancées. Les menus démarrent fermés. Boîte repliable sur la carte avec Carte / Mixte / Imagerie, appui maintenu pour révéler l’image seule (raccourci espace), opacité du fond et des milieux ouverts, taille/opacité des sentiers et des courbes, intensité du relief et choix d’imagerie. Les milieux ouverts restent au-dessus des images, indépendamment de l’opacité du fond. L’appui de comparaison restaure les couches à son relâchement.

Performance : réglages rapides ciblés et regroupés par image d’animation; propriétés MapLibre inchangées non renvoyées au moteur; suppression des animations caméra hors changement 2D/3D; conservation des réseaux AQ sur une emprise élargie pour les petits déplacements; courbes MNT fines en mode automatique à partir du zoom 16, avec choix explicites 5 m dès z12 et 2,5 m dès z14 conservés. Pas de gain de vitesse quantifié sans mesure sur appareil.

Superpositions : mode unifié par défaut. Un worker masque uniquement l’affichage des petites portions AQ multiusages/Sépaq à moins d’environ 7 m de segments OSM affichés, parallèles à moins de ~14°. Détection par points espacés; masquage prudent exigeant début, milieu et fin compatibles. Croisements et voies parallèles distinctes conservés. Les itinéraires sportifs ne sont pas supprimés; leurs usages et les géométries de tracé restent intacts. Mode Sources disponible pour comparer, sans affirmer une fusion topologique. Les correspondances ambiguës et les décalages supérieurs au seuil peuvent rester visibles.

Validation : tests des superpositions exactes/inversées/partielles, parallèles distinctes, croisements, préservation des itinéraires et des originaux; tests d’ordre des couches, opacité indépendante, comparaison et restauration sans animation caméra; validation complète MapLibre, tests existants et TypeScript. Vérification visuelle mobile à effectuer.

## Cap après la refonte v0.11
- Priorité au parcours activité → itinéraire → vérification du terrain → emporter.
- Tests utilisateurs terrain/mobile pour réduire encore le nombre de gestes.
- Moteur de routage pédestre avec restrictions explicites, recherche de lieux, étapes éditables sur la carte.
- Exports PDF géoréférencés à échelle fixe et formats papier, atlas; paquets hors ligne avec contrôle des licences et volumes.
- Édition de symboles course d’aventure, variantes organisation/participants; corrections de chemins inexistants exclues du routage.
- Infrastructures : lignes électriques, pylônes, tours/antennes, éoliennes.
- Continuer l’allègement des chemins superposés et la hiérarchie des traits AQréseau non vérifiés / pédestre / vélo.
