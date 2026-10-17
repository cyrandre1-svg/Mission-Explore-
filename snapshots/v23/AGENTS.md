# Mission Explore — continuité et sauvegardes

Ce dépôt concerne uniquement Mission Explore. Il est distinct du projet Mission Web / suivi GPS.

## Publication et GitHub

- Continuer à utiliser Sites pour modifier et publier Mission Explore.
- Dépôt de sauvegarde explicitement demandé par André : https://github.com/cyrandre1-svg/Mission-Explore-.git (`cyrandre1-svg/Mission-Explore-`).
- À chaque nouvelle version publiée dans cette collaboration, copier aussi le source complet de cette version dans GitHub et conserver les versions précédentes. Ne pas considérer une publication terminée sans signaler un éventuel échec de sauvegarde GitHub.
- Préserver l’historique et les fichiers existants. Ne jamais effectuer de push forcé ni réécrire une version déjà sauvegardée.
- Préférer un push Git normal lorsqu’une authentification GitHub est disponible. Sinon utiliser le connecteur GitHub pour copier les blobs, créer le même arbre de fichiers et ajouter un commit à la suite du dernier commit sauvegardé. Inscrire le SHA du source Sites dans le message. Vérifier les SHA des blobs et de l’arbre; ils doivent être identiques à ceux du source.
- Le dépôt GitHub est public. Ne jamais y inclure de jetons, valeurs runtime, fichiers .env, état Wrangler, données de comptes, tracés communautaires en base de données ou autres données personnelles.
- La sauvegarde du code et des migrations ne remplace pas une sauvegarde des données D1. Les données publiées par les membres sont stockées séparément.

## Vérifications

Utiliser les tests adaptés aux changements. Les scripts `tests/map-style.cjs`, `tests/map-startup.cjs`, `tests/planner.cjs`, `tests/trail-chunks.cjs` et `tests/community.cjs` couvrent les principaux comportements. Les styles complets doivent passer la validation MapLibre. Ne pas annoncer une vérification visuelle navigateur si elle n’a pas été effectuée.
- Alternative sûre pour les fichiers volumineux : sauvegarder l’historique dans un `git bundle` complet (ou incrémental après une base complète), compressé et fractionné, avec SHA-256 et script de restauration. Conserver en plus un instantané texte consultable et un index des versions dans GitHub. Vérifier une restauration locale et l’intégrité des commits avant d’annoncer la sauvegarde complète.
- Ne pas installer de mécanisme GitHub Actions doté d’un accès en écriture pour importer du code externe sans autorisation spécifique. Préférer la copie directe des archives par le connecteur.
