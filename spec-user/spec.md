🎯Résumé du projet / Objectif
Je tiens un abonnement que l'on partage avec un group d'amis (5 personnes). La dépense que j'effectue est mensuelle et mes amis on deux moyens pour me rembourser : 1. un virement automatique 2. un virement quand je leur demande avec la somme que je leur demande. 
Calculer la sommes qu'ils me doivent me prend du temps, je veux automatiser tout ça et avoir une interface simple pour gérer ça.

🧭 User stories principales
USP1 En tant qu'administrateur, je dois pouvoir configurer une dépense afin de tenir à jour les montants et la date de prélèvement d'un abonnement que qu'il partage
USP2 En tant qu'administrateur je dois pouvoir configurer configurer les utilisateurs afin de leur donner un accès à l'espace 
USP3 En tant qu'administrateur je peux voir rapidement qui me doit combien à une date donnée (elle peut être dans le future )
USP4 En tant qu'administrateur je peux consulter les virements en attente de pointage
USP5 En tant qu'administrateur je peux pointer un virements afin de le marquer comme vérifier sur le compte bancaire
USP6 En tant qu'administrateur je peux créer un virement à la place d'un utilisateur afin d'être autonome

USS1 En tant qu'utilisateur je peux me connecter à mon espace avec un identifiant mot de passe
USS2 En tant qu'utilisateur je peux consulter mes virements et leurs état
USS3 En tant qu'utilisateur je peux consulter la somme que je dois à une date
USS4 En tant qu'utilisateur je peux créer un virement (sommes + date)
USS4 En tant qu'utilisateur je peux supprimer ou modifier un virement non pointé



⚙️ Fonctionnalités (MVP + évolutions possibles)
MVP : USP1,USP2,USP3,USP4,USP5,USP6
Evol : US1,USS2,USS3,USS4,USS4 

🧩 Architecture technique (front/back, base de données, API, auth, etc.)
front : Angular 
backend : nodejs (framework ?) // doit être structuré et faciement maintenable.
bdd : ??

🧱 Stack recommandée / contraintes techniques
Développement one shot mais doit être maintenable facilement. 

Le projet sera hébergé sous aws. (fargate ? lambda ?, autre ? aucune idée.)
Le projet sera développé en pair programing AI (cursor + speckit) et humain (developper dotnet + angular) 
sur une machine windows avec powershell 7 et cursor en ide
CICD pour livraison (+ terraform  ? )

🧪 Plan de test et validation
test unitaire et d'intégration


🚀 Roadmap de développement (étapes et priorités)
A définir. Seul contrainte : chaque phase doit être un livrable qui fonctionne.
Ce que j'ai en tête dans le désordre : 
- dev front
- dev back
- bdd local
- définir environement aws.
- CICD
- IAC ?
