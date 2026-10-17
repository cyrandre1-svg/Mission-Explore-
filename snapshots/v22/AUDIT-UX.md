# Audit et amélioration de Mission Explore — 16 octobre 2026 UTC

Audit du source publié version 14, puis corrections. Vérification par analyse des interfaces, tests fonctionnels et validation MapLibre. Aucun test visuel navigateur ni test sur téléphone réel effectué dans cet environnement.

| Obstacle constaté | Correction |
| --- | --- |
| Boutons Tracer / Reprendre, Profil et Exporter répétés au même niveau | Parcours principal conservé; actions secondaires dans des sections nommées et repliées |
| Réglages avancés peu repérables | Sélecteur Essentiel / Tous les réglages qui réutilise la préférence existante, sans effacer les couches |
| Aller vers un secteur exige de déplacer longuement la carte | Sélecteur des cinq secteurs du pilote dans Ma mission |
| Options de couches dispersées | Six interrupteurs sur la vue d’ensemble, résumé des couches actives et raccourcis par thème |
| Chemin au-dessus d’une coupe bloque sa consultation | Choix d’inspection Automatique / Forêt / Chemins, avec rappel sur la carte |
| Méthode affichée et choix d’activité peuvent diverger | Synchronisation des sélecteurs et du texte d’aide |
| Crainte d’exclure les voies non confirmées | Accès direct au réseau OSM + AQ; test des carrossabilités inconnues/non-2WD; Ligne libre conservée |
| Légende par usage différente du rendu neutre | Palette par usage appliquée et légende accessible sur la carte |
| AQréseau trop discret | Brun terre et opacité renforcée, sans masquer les voies incertaines |
| Écran mobile encombré d’état technique | Zoom/statut dans les réglages détaillés; distance dans Ma mission; hiérarchie et surfaces harmonisées |

## Limites et suites
Les routes interdites ou explicitement privées conservent les filtres existants du routeur. Une voie inconnue n’est pas assimilée à une interdiction. Le moteur de géométrie exige des voies chargées au zoom 13+, et conserve les ruptures réelles du réseau. Aucun raccord automatique inventé. Une ligne libre permet une planification explicite hors réseau.

À poursuivre : tests sur téléphone, recherche géographique étendue, manipulation directe des points d’itinéraire, résolution des doublons proches restant visibles, mises à jour des sources et véritable routage piéton. PDF à l’échelle et paquets hors ligne restent à développer. La couverture cartographique incomplète ne se corrige pas par un changement de style.

## Audit approfondi — version 16

- Accès permanent « Fond » : sept teintes vectorielles personnalisables, application immédiate, mémorisation locale, restauration des couleurs et légende synchronisée. Les rasters WorldCover et photos ne sont pas recolorés.
- Correction de la préférence d’activité écrasée au démarrage.
- Échec de routage : destination conservée, nouvelle tentative ou liaison libre explicitement choisie. Une destination périmée après modification du tracé est abandonnée.
- Profil : le toucher sert à consulter; la découpe exige l’activation de son contrôle. Ouvrir le profil quitte correctement le dessin.
- Validation : styles MapLibre complets, palette personnalisée et invalide, réinitialisation, reprise après erreur, rejet d’une reprise périmée, démarrage, planificateur, workflow, routage non confirmé, PMTiles et communauté.
- Limites : pas de vérification visuelle dans un navigateur pendant cette intervention. Annulation d’un calcul en cours, historique annuler/rétablir complet, PDF à l’échelle et carte hors ligne restent à développer. Le CSS historique mérite encore une consolidation.

## Audit interface — version 17

Constat : duplication entre activité, profils et boutons de tracé; commandes désactivées avant création; commandes secondaires dispersées; navigation des réglages redondante; fermeture du panneau renvoyant toujours au bouton Ma mission.

Corrections :
- Panneau mission contextuel : démarrer sans tableau vide, placer les points, puis poursuivre / voir / emporter dès qu’un segment existe.
- Une sélection principale d’activité; source OSM/AQ et chemins non confirmés dans les options de calcul. Paramètres Aventure présentés lorsque ce profil est sélectionné.
- Outils de retouche et fichiers regroupés; publication affichée pour un tracé exportable. Toutes les fonctions existantes restent disponibles.
- Navigation cartographique par une liste unique et retour explicite à la vue d’ensemble; sauvegarde/réinitialisation repliées.
- Le changement de secteur garde le panneau mission ouvert pour poursuivre la préparation.
- Accueil masqué mémorisé, libellé Communauté explicite, focus de fermeture rendu au bon bouton, Escape respecte les dialogues.
- Le réglage flottant d’opacité s’efface lorsqu’un panneau est ouvert et revient à sa fermeture pour dégager la carte.

Validation : scénarios interface vide/départ/tracé, options aventure, structure HTML, tests cartographie et planificateur. Pas de contrôle visuel navigateur disponible; ergonomie tactile à confirmer sur appareil.

## Audit qualité cartographique et atelier — version 18

Défauts confirmés et corrigés :
- La couche bâtiments 2D avait un maxzoom 14 alors que la couche suivante était désactivée hors 3D : bâtiments absents en zoom rapproché. Continuité 2D jusqu’au zoom 24 restaurée.
- Le curseur d’imagerie laissait les aplats ouverts opaques. En mode mixte ils suivent maintenant le mélange, sauf choix explicite de les garder. À zéro, image seule (tracés et annotations conservés).
- Un liseré sportif sur les routes ajoutait un second trait. Option explicite désormais désactivée par défaut. L’allègement géométrique conservateur des doubles sources reste actif.

Nouveaux outils :
- Clic sur une voie : consultation des sources présentes sous le clic, masquage de couche, masquage individuel si identifiant stable, note locale datée. Restauration dans Atelier → Corrections. Aucun changement des données fournisseurs ni du graphe de routage.
- Symboles/repères : PC, départ, arrivée, transition, eau, attention, observation. Notes privées dans le navigateur, export GeoJSON et sauvegarde/restauration des corrections JSON. Pas de publication communautaire des observations.
- Atelier : fond courant, titre, 5 papiers, portrait/paysage, 4 échelles, rendu séparé 150 ppp au nord; aperçu avant téléchargement.
- PNG avec PGW et PRJ ou GeoTIFF RGB EPSG:3857, provenance et corrections dans une archive. Source AQ rechargée sur l’emprise imprimée et allègement réappliqué pour ne pas tronquer aux limites de l’écran.
- Impression / PDF ordinaire : titre, échelle centrale, nord et attribution. Aucun GeoPDF annoncé. Échelle locale Mercator; imprimer à 100 %, sans ajustement. Les formats hors ligne comme MBTiles, le GeoPDF, la grille UTM et les symboles normalisés IOF complets restent à développer.

Vérifications : validation complète MapLibre; continuité bâtiments; extrémité imagerie; masquage source/objet et restauration; validation projet; dimensions papier; calcul de zoom; Mercator; centre de pixel PGW; écriture/relecture réelle GeoTIFF avec EPSG, limites et pixels RGB. Tests de routage, superpositions, démarrage et workflow conservés. Pas de navigateur disponible : rendu GPU d’export, impression physique et ergonomie tactile non vérifiés visuellement. L’interface présente un aperçu et refuse un export si le chargement signale une erreur ou une couverture AQ partielle; les lacunes intrinsèques des sources nécessitent encore une inspection utilisateur.

## Atelier complet et lisibilité — version 19

Réponse aux captures : le point plein des balises masquait le terrain; chemins et sentiers utilisaient des traits trop similaires. Les balises utilisent maintenant une image de symbole dessinée sans remplissage, sans point central ni glyphe ajouté devant le nom. Départ triangulaire, arrivée à deux cercles et transition en losange. Les symboles sont placés exactement sur leur coordonnée.

- Bibliothèque de 37 symboles, 6 familles (aventure, camping/randonnée, vélo, chasse, canoë/kayak, repères généraux), recherche, taille, nom, indice, ordre et modification des repères. Symboles maison, sans revendication de certification IOF.
- Styles de tracés dessinés/importés : catégorie visuelle, couleur, épaisseur, continu/tirets/pointillé. Catégories route, chemin, sentier, vélo, cours d’eau, intermittent, portage, limite et itinéraire.
- Reclassification visuelle locale au clic d’une voie disposant d’un identifiant stable : la géométrie source complète est recherchée avant application. Refus si elle n’est pas disponible, pour ne pas remplacer seulement un fragment de tuile. Source officielle et routeur inchangés; restauration possible.
- Sentiers pédestres plus fins, bruns et pointillés courts; chemins plus larges et à bordure claire.
- Curseur −100 à +100 : les aplats atteignent zéro à 0, les voies restent présentes; valeurs négatives atténuent seulement les voies cartographiques. Tracés personnels et symboles restent visibles. Position négative conservée au chargement.
- Quatre styles de fond Mission (mêmes sources) : Clair moderne, Topo terrain, Orientation, Contraste doux; couleurs toujours personnalisables.
- Quadrillage géographique WGS 84 ou UTM de la zone centrale, généré dans la projection UTM avec Proj4 et reprojeté sur la carte. Grille recalculée pour l’emprise exportée. Zone et pas indiqués. Le raster reste en EPSG:3857.
- Mise en page : nord vrai, déclinaison saisie avec date/source, échelle graphique locale, légende, note encadrée; liste de balises et indices en encadré ou annexe. Les longs encadrés sont refusés pour éviter une sortie illisible.
- GPX : tracés et points de passage; descriptions des points reprises comme indices éditables. Import dans le panneau Atelier.
- Jusqu’à trois images compressées en annexe imprimable, avec légendes/crédits. Images non géoréférencées. Pas de placement libre des photos sur le fond dans cette version.
- Sauvegarde projet : corrections, symboles, images, styles des tracés et paramètres de page. Les tracés restaurés sont ajoutés aux itinéraires existants. Les réglages avancés des couches ne sont pas tous restaurés; palette, thème et quadrillage le sont.

Validation : styles MapLibre complets et nouvelles lignes; curseur 100/0/−50/−100/restauration; 37 symboles, cercle sans opération de remplissage; fourchettes de propriétés; zones UTM 19/20 et alignement des lignes projetées; grilles lat/lon; aller-retour GeoTIFF; structure HTML; suites planificateur, workflow, démarrage, PMTiles, communauté. Rendu tactile, canvas WebGL exporté et impression physique non vérifiés par navigateur disponible. Déclinaison non calculée automatiquement; PDF imprimé toujours ordinaire, non GeoPDF.
