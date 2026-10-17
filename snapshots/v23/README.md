# Mission Explore — prototype régional V0.1

Carte réelle pour le Bas-Saint-Laurent et la Gaspésie. Projet privé indépendant du suivi Mission. Application Vinext / Worker; interface MapLibre dans `public/explore.html`.

## Fonctionnel
- Fond vectoriel OpenFreeMap / OpenStreetMap avec style Mission.
- Courbes officielles LiDAR MRNF 10 m (zoom >=12) et 5 m (zoom >=16), mode automatique et ombrage.
- Courbes globales 20, 50 et 100 m calculées côté navigateur; terrain 3D global.
- Profils Explorer, Terrain, Course, taille des libellés et visibilité des couches.
- Index officiel: 365 feuillets intersectant l'emprise rectangulaire [-70.5,47,-64,49.5], consulté le 2026-10-14. Ce n'est pas une limite administrative ni une mesure de couverture complète.
- Import GPX et GeoJSON de lignes, mesure libre, export GPX, export des préférences. Aucun routage automatique. Distances horizontales géodésiques approximatives, sans dénivelé.
- Préférences locales; imports conservés en mémoire uniquement.

## Limites explicites
- Les tentatives d'extraction Overpass régionale et locale ont retourné HTTP 504. Le fichier `graded-trails.geojson` contient une collection vide avec le drapeau `metadata.unavailable`. Le sélecteur de difficulté est désactivé tant que ce drapeau est présent. Ne jamais remplir cette collection par des données fictives.
- Courbes 2,5 m non intégrées. Courbes LiDAR WMS raster: épaisseur/couleur non paramétrables dans cette version.
- Source LiDAR WMS dépendante du service MRNF; le proxy `/api/terrain` limite les couches et l'emprise, valide les paramètres, définit un délai et un cache HTTP. Il ne constitue pas une infrastructure de tuiles dimensionnée pour une course publique.
- Le relief 3D et les courbes globales ne sont PAS dérivés du LiDAR québécois.
- Hors ligne, routage, authentification propre au produit et connexion au suivi Mission non implémentés.
- Contrôle navigateur indisponible dans cette session: validation de compilation, syntaxe et sources HTTP seulement.

## Sources et licences
- Routes et lieux: OpenStreetMap, ODbL, https://www.openstreetmap.org/copyright ; distribution OpenFreeMap https://openfreemap.org/quick_start/ .
- LiDAR: Gouvernement du Québec / MRNF, CC BY 4.0, https://www.donneesquebec.ca/recherche/dataset/produits-derives-de-base-du-lidar .
- WMS: https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi?SERVICE=WMS&REQUEST=GetCapabilities .
- Index: https://diffusion.mffp.gouv.qc.ca/Diffusion/DonneeGratuite/Foret/IMAGERIE/Produits_derives_LiDAR/Produit_derive_lidar/03-Telechargement/URL_Lidar.geojson .
- Terrain Tiles / Mapzen: https://registry.opendata.aws/terrain-tiles/ .
- MapLibre GL JS 5.6.0, BSD-3-Clause; maplibre-contour 0.1.0, BSD-3-Clause. Distribution embarquée dans `public/vendor`.

## Suite technique
1. Extraire OSM à partir d'un fichier régional reproductible et conserver mtb:scale, mtb:scale:imba, sac_scale, access, bicycle, foot, surface, trail_visibility. Analyser la complétude par territoire.
2. Télécharger un MNT test via les liens de l'index et vérifier dates, précision, raccords. Générer les courbes vectorielles 2,5/5/10 m sans inventer de précision.
3. Produire des tuiles PMTiles et un stockage/cache dédiés; mesurer taille et bande passante avant extension.
4. Vérifier le rendu mobile réel, l'accessibilité et les performances. Intégrer le style au suivi Mission après validation indépendante.

## Développement
Utiliser les helpers Sites pour installation, compilation, synchronisation et publication. L'identité du Site est dans `.openai/hosting.json`. Ne pas créer un nouveau Site pour une mise à jour.

## V0.2 — 14 octobre 2026

Cette section remplace les limitations V0.1 correspondantes ci-dessus.

### Réseaux et revêtement
- API `/api/network`: consultation par emprise du service officiel AQréseau+ (transition vers RQTT), couches 37 (multiusages), 107 (Sépaq), 15 (Route verte), 116 (quad), 113 (motoneige). Licence Données Québec confirmée: CC BY 4.0.
- Chargement client à partir du zoom 11, requêtes annulables, deux réseaux à la fois, pagination serveur plafonnée à 6 000 tronçons par réseau avec signalement explicite du résultat limité.
- Clic sur tronçon: source, classe, année disponible, carrossabilité déclarée. Ne pas convertir les classes forestières en revêtement.
- Pavé / non pavé / inconnu à partir de `transportation.surface` des tuiles OSM/OpenFreeMap; filtres dédiés. AQréseau+ reste une couche distincte.
- Cotation vélo directement à partir de `transportation.mtb_scale`. Source confirmée dans le TileJSON. Pas de conversion des valeurs absentes en niveau facile. SAC randonnée toujours absent.

### Courbes fines
- API `/api/elevation`: WCS officiel RNCan, mosaïque MNEHR, DTM, reprojection EPSG:3857 demandée en petites fenêtres. Rééchantillonnage bilinéaire selon le géoréférencement retourné, non selon une taille supposée.
- Résultat Terrarium RGBA 512×512, pixels invalides transparents. Le décodeur maplibre-contour 0.1.0 a été modifié pour convertir l'alpha nul en NaN. Test de non-régression spécifique aux zones sans données.
- Courbes vectorielles calculées côté navigateur: 5 m à partir du zoom 12, 2,5 m à partir du zoom 14. MNT échantillonné plus grossièrement lorsqu'on dézoome: il s'agit d'une généralisation, non d'une promesse de précision verticale égale à l'équidistance.
- Opacité, épaisseur, libellés réglables. Tracés WMS officiels 5/10 m conservés pour comparaison, sans contrôle d'épaisseur imposé à leur source raster.
- Source RNCan et source MRNF restent distinguées. Le service WCS est transitoire et le fournisseur privilégie à terme l'accès COG/STAC: préparer un pipeline régional COG/PMTiles avant un usage à grande échelle. Le prototype utilise encore des services distants, pas un stock régional autonome.

### Vérifications V0.2
- Syntaxe JavaScript, test démarrage réel des exports MapLibre.
- Validation du style complet et des expressions dans cinq combinaisons (courbes, tailles, surfaces, réseaux).
- Test Terrarium / NaN / isolignes 2,5 et 5 m.
- Tuile réelle Amqui z15: 262 144 / 262 144 pixels valides, environ 222,98–265,32 m; calcul des isolignes validé sur ce PNG.
- Amqui z12: 262 144 pixels valides, environ 152,56–421,46 m. Chic-Chocs z14: 262 144 pixels valides, environ 235,96–933,86 m.
- Emprise -67.6,48.3,-67.3,48.6: multiusages 541 tronçons, Route verte 85, quad 121, motoneige 54, Sépaq 0; services répondent 200. Zéro Sépaq dans cette fenêtre n'implique pas une absence régionale.
- Compilation Worker réussie. Pas de navigateur de contrôle disponible; rendu et fluidité sur téléphone restent à vérifier.

## V0.3 — planificateur multitracé
- Plusieurs tracés indépendants, noms/couleurs/visibilité, import GPX multiple et GeoJSON, export actif ou GPX multitracé. Conservation locale avec signalement des échecs de stockage.
- Profil SVG interactif, position sur carte, scission au point existant le plus proche; changement du mode de chaque segment, prolongement d’un import. Les discontinuités GPX ne sont pas reliées dans le calcul de distance. Dénivelé brut seulement entre altitudes connues, couverture affichée. Les segments directs ne reçoivent pas d’altitudes inventées.
- Routage expérimental BRouter public / OSM via proxy régional, profils trekking et mtb, limite 100 km entre points, délai 35 s. Un échec conserve le tracé et ne crée aucune ligne de remplacement. AQréseau+ n’est pas un graphe routable dans cette version. Les points sont transmis au fournisseur.
- Esri World Imagery sous le fond Mission, opacité du fond réglable; attribution vérifiée dans le service le 14 octobre 2026 (Esri, Vantor, Earthstar Geographics, GIS User Community). Pas de téléchargement hors ligne.
- Vérifications: syntaxe JavaScript, tests startup/style/contours et planner (discontinuités, altitudes manquantes, GPX multitracé), build Vinext. Réponses réelles des profils BRouter trekking et mtb vérifiées à Rimouski. Aucune QA visuelle navigateur disponible dans cet environnement.

## V0.5 — sentiers régionaux
Module préparé intégré et corrigé. 29 512 ways OSM régionaux, 16 920 tuiles dans une archive PMTiles de 18,3 Mo, hébergée avec le Site. Filtres d’usage, IMBA, surfaces, accès privés, noms et opacité. Cotations IMBA corrigées (0–4) et distinctes des STS/SAC. 25 géométries incomplètes ignorées. Source et reproduction : scripts/trails/README.md. Archive dérivée ODbL téléchargeable depuis Sources. Tests extraction, filtres et style complets; contrôle HTTP Range à effectuer après déploiement. Pas de QA visuelle navigateur disponible.

## V0.6 — lisibilité, sports et partage public
- Réglages répartis en six catégories : Essentiels, Fond, Sentiers, Relief, Sports, Territoire. Mode avancé et profils Explorer / MTB / gravel / randonnée / eaux vives / ski, avec préférences par profil conservées localement.
- Style forestier contrasté, milieux ouverts crème, marais texturés, bâtiments plus foncés, hiérarchie routière. Réseaux z8, chemins secondaires z10, sentiers z10–12 selon la densité. Halos réduits et chemins forestiers en tirets bruns.
- Couche raster privée officielle : MRNF/STF, propriété privée (42), rendu léger à partir du zoom8. Limites adaptées pour l’usage forestier, distinctes du cadastre et du RDE; absence de couleur ≠ terrain public. Proxy allowlist régional et cache1jour.
- Sports : extraction pyosmium des instantanés OSM existants, 770 objets eaux vives et 232 objets ski hors piste, 0 géométrie manquante. Objets nœuds/ways/aires, pas nombre de secteurs. Tags conservés sans difficulté ou conditions déduites. Les pistes de descente damées ne sont pas incluses. Pas d’évaluation avalanche ni débit en temps réel.
- Catalogue communautaire D1 : lecture publique, connexion Sites requise pour publier, copies volontaires avec consentement, alias public indépendant de l’email, organisation auto-déclarée, export GPX, lien /?trace=UUID, modification/retrait par propriétaire. 50 publications par compte, 20k points / 1Mo par publication, 100 récentes dans le catalogue. Les copies locales restent indépendantes.
- Signalements authentifiés et modération par le propriétaire du Site via MISSION_MODERATOR_EMAIL (secret runtime), consultation et retrait. Origine vérifiée sur mutations, aucune identité client acceptée. Les imports restent locaux jusqu’à la publication volontaire.
- Migration D1 générée avec Drizzle et inspectée. Tests de handlers réels sur SQLite en mémoire : authentification, consentement, origine, propriété, confidentialité des identités, signalement et retrait. Validation complète de styles, TS sans erreur, tests startup/profil/contours/PMTiles. Source MRNF répond PNG avec rendu personnalisé. QA visuelle navigateur indisponible dans cet environnement.

## V0.8 — Forêt et planification
Voir ROADMAP.md pour la portée et les limites. Ajouts : années forestières réellement publiées découvertes via WMS, PRANA séparée, peuplements et fiches au clic; orthophotos et Sentinel; milieux ouverts indépendants de l’opacité du fond; liserés de réseaux; modes de dessin simplifiés et graphe local des géométries OSM/AQ chargées. Tests supplémentaires : `node tests/forest.cjs` et `node tests/visible-router.cjs`.

## V0.9 — carte universelle
Contrôles repliables sur la carte, comparaison Carte/Mixte/Imagerie et appui maintenu pour révéler l’image. Réglages rapides ciblés, cache d’emprise AQ et masquage prudent des doublons visuels dans un worker, sans modifier les tracés sources. Voir ROADMAP.md. Test complémentaire : `node tests/network-display.cjs`.

### Refonte de préparation v0.11

L’accueil privilégie la préparation d’une mission : activité → points de passage → export GPX. Les préférences de méthode, la personnalisation et les fonctions spécialisées sont repliées. La barre carte/imagerie reste directement sur la carte. Le panneau présente distance, D+ brut connu et couverture altimétrique; un bouton ajoute un segment vers le départ avec la méthode actuellement choisie. Le mode marche utilise explicitement la géométrie du réseau affiché et ne constitue pas un moteur de permissions pédestres. La légende décrit les teintes vectorielles Mission et distingue le complément régional WorldCover. Les cartes hors ligne et l’impression PDF à l’échelle restent à développer. La localisation est ponctuelle, demandée au clic, sans sauvegarde de position.

### Correctif fond v0.12
Le curseur à 100 % Carte masque réellement l’imagerie, y compris sous les zones sans polygone. L’imagerie s’atténue progressivement avec le curseur. Les milieux ouverts restent indépendants sur l’image. Les courbes officielles en mode automatique sont désaturées et atténuées selon le zoom; les valeurs par défaut passent à 45 % et 0,5 px, relief à 25 %. Les anciens réglages par défaut sont migrés, les valeurs personnalisées conservées. La couche de complément WorldCover est désaturée, éclaircie et moins opaque pour limiter les conflits de palette avec OSM; les données et leur couverture restent inchangées.

### Audit et simplification v0.13
Voir AUDIT-UX.md. Les réglages détaillés réutilisent le commutateur existant; aucune couche ni donnée d’itinéraire n’est effacée par le retour aux essentiels. Vue d’ensemble : six couches courantes, liens directs, sélection du type d’objet à consulter. Ma mission : choix de secteur, actions secondaires repliées, raccourci pour suivre un chemin non confirmé sur le réseau affiché. La palette par usage correspond à la légende; AQréseau est plus visible. Tests des voies inconnues et de la priorité de consultation forêt.

## v22 — Missions et projets privés

- Choix de huit profils au démarrage, réouverture par le bouton d’activité. Les classes de chemins sont conservées; largeur/cotation, palette, relief et couches sont adaptés. Réglages par sport sur l’appareil, sauvegarde explicite d’un profil dans le compte depuis le sélecteur.
- Forêt publique provinciale et fédérale STF MRNF (57/59), modes contour ou remplissage. La couche privée (42) reste distincte. STF est une représentation adaptée et non un cadastre exhaustif ou une autorisation d’accès/chasse.
- Projets privés D1, isolés par identité ChatGPT : GPX, visibilité, tracé actif, chemins masqués, annotations, styles, cadrage et mise en page. Enregistrer / copie / ouvrir / supprimer; import/export JSON sans compte. Ouverture par remplacement, avertissement avant écrasement du travail courant. Sauvegarde explicite, 100 enregistrements par compte, 1,5 Mo chacun; export JSON jusqu’à 30 Mo à l’import. Un masquage visuel ne retire pas un chemin au routeur.
- Déclinaison calculée côté serveur avec `geomagnetism` 0.2.0, modèle WMM2025, au centre et à la date choisie, altitude 0 m. Refus de date hors modèle et de champ horizontal < 2000 nT. Nord vrai et magnétique sur carte et export, angle signé et provenance. Le quadrillage UTM est explicitement distingué du nord vrai. Mode manuel disponible.
- Migration additive `0001_heavy_lilith.sql`. Tests : `projects.cjs`, `project-restore.cjs`, `magnetic-north.cjs`, styles MapLibre, démarrage, planificateur, tuiles, catalogue, forêt et exports. Build et TypeScript validés. Pas de vérification visuelle navigateur disponible dans cet environnement.
