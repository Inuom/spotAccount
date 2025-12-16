# Checklist des Actions Manuelles - Simplify AWS to EC2

**Feature**: `simplify-aws-to-ec2`  
**Date de création**: 2025-01-22  
**Objectif**: Suivre l'avancement des actions manuelles requises dans AWS et GitHub Actions

---

## Phase 1 : Configuration Initiale AWS (Une seule fois)

### ✅ 1. Configuration du Compte AWS

- [ ] **1.1 Compte AWS créé**
  - Date: 10/10/2025
  - Notes: tentative précédente d'hébergement du service sur un ECS

- [ ] **1.2 MFA activé pour le compte root**
  - Date: 10/10/2025
  - Type MFA: [x] Virtual MFA Device [ ] Hardware Key Fob [ ] Autre
  - Notes: 

- [ ] **1.3 Alertes de facturation configurées**
  - Date: 20/10/2025
  - Seuil configuré: 20€
  - Email d'alerte: oui
  - Notes: 

---

### ✅ 2. Configuration IAM

- [x] **2.1 Utilisateur IAM créé**
  - Date: _(déjà existant)_
  - Nom d'utilisateur: **CICD**
  - Notes: Utilisateur IAM existant réutilisé - pas besoin de le créer

- [ ] **2.2 Politiques IAM attachées**
  - Date: ___________
  - Politiques attachées:
    - [ ] AmazonEC2FullAccess
    - [ ] AmazonECRPublicFullAccess (ou custom ECR policy)
    - [ ] AmazonVPCFullAccess
    - [ ] IAMFullAccess (ou custom policy)
    - [ ] CloudWatchLogsFullAccess
    - [ ] Politique custom S3 pour Terraform backend
  - ARN de la politique custom (si applicable): ___________
  - Notes: Déjà l'utilisateur CICD, je ne sais pas encore les droits qu'il a mais j'ai pu utiliser pas mal de service avec l'ancienne configuration

- [ ] **2.3 Clés d'accès créées**
  - Date: ___________
  - Access Key ID: ___________
  - Secret Access Key: [SAUVEGARDÉE - Ne pas stocker ici]
  - Où stockée: [ ] Password Manager [x] GitHub Secrets [ ] Autre: ___________
  - Notes: Tout est dans GHA secret

---

### ✅ 3. Configuration ECR (Elastic Container Registry)

- [ ] **3.1 Repository backend créé**
  - Date: ___________
  - Nom: spotaccount-backend
  - URI complète: 697369419679.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-backend
  - Région: EU-WEST-1
  - Notes: ___________

- [ ] **3.2 Repository frontend créé**
  - Date: ___________
  - Nom: spotaccount-frontend
  - URI complète: 697369419679.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-frontend
  - Région: EU-WEST-1
  - Notes: ___________

- [ ] **3.3 Vérification des repositories**
  - Date: ___________
  - Scan on push: [ ] Activé [ ] Désactivé
  - Tag immutability: [ ] Activé [ ] Désactivé
  - Notes: sais pas

---

### ✅ 4. Backend Terraform (S3 + DynamoDB)

- [ ] **4.1 Bucket S3 pour Terraform state créé**
  - Date: ___________
  - Nom du bucket: spotaccount-production-terraform-state-buh71ovq
  - Région:  EU-WEST-1
  - Versioning: [ ] Activé [ ] Désactivé
  - Encryption: [ ] SSE-S3 [ ] SSE-KMS [ ] Autre: ___________
  - Notes: ___________

- [ ] **4.2 Table DynamoDB pour state locking créée**
  - Date: ___________
  - Nom de la table: spotaccount-production-terraform-locks
  - Région: EU-WEST-1
  - Clé de partition: LockID
  - Billing mode: [x] On-demand [ ] Provisioned
  - Notes: ___________

- [ ] **4.3 Vérification des permissions**
  - Date: ___________
  - IAM user peut accéder au bucket S3: [x] Oui [ ] Non
  - IAM user peut accéder à la table DynamoDB: [x] Oui [ ] Non
  - Notes: ___________

---

### ✅ 5. Clé SSH EC2

- [ ] **5.1 Key pair EC2 créée**
  - Date: ___________
  - Nom: id_ed25519_gh
  - Type: [ ] RSA [ ] ED25519
  - Format: [ ] .pem [ ] .ppk
  - Fichier local: `___________.pem`
  - Notes: ___________

- [ ] **5.2 Permissions du fichier configurées (Linux/Mac)**
  - Date: ___________
  - Commande exécutée: `chmod 400 ___________.pem`
  - Notes: ___________

- [ ] **5.3 Clé sauvegardée de manière sécurisée**
  - Date: ___________
  - Où stockée: [ ] Password Manager [ ] GitHub Secrets [x] Autre: ___________
  - Notes: ___________

---

### ✅ 6. Configuration DNS
Pas encore de domaine pour le moment

- [ ] **6.1 Domaine configuré**
  - Date: ___________
  - Nom de domaine: ___________
  - Registrar: ___________
  - Notes: ___________

- [ ] **6.2 Hosted Zone Route 53 créée (si applicable)**
  - Date: ___________
  - Type: [ ] Public [ ] Private
  - Name servers configurés chez le registrar: [ ] Oui [ ] Non
  - Name servers Route 53: ___________
  - Notes: ___________

- [ ] **6.3 Enregistrement A créé**
  - Date: ___________
  - Nom: ___________
  - Type: A
  - IP Elastic de l'EC2: ___________
  - TTL: ___________
  - Notes: _Créé après avoir obtenu l'IP Elastic via Terraform_

- [ ] **6.4 Propagation DNS vérifiée**
  - Date: ___________
  - Outil utilisé: ___________
  - Status: [ ] Complète [ ] En cours
  - Notes: ___________

---

## Phase 2 : Configuration GitHub Actions (Une seule fois)
Déjà en place pour la précédente infra

### ✅ 7. Secrets GitHub

- [x] **7.1 Secret AWS_ACCESS_KEY_ID**
  - Date: ___________
  - Valeur: `___________(ne pas afficher complètement)`
  - Source: IAM User: **CICD**
  - Notes: ___________

- [x] **7.2 Secret AWS_SECRET_ACCESS_KEY**
  - Date: ___________
  - Valeur: [Sauvegardée - Ne pas afficher]
  - Notes: ___________

- [x] **7.3 Secret EC2_SSH_PRIVATE_KEY**
  - Date: ___________
  - Source: Key pair EC2: `id_ed25519_gh.pem`
  - Notes: Contenu complet du fichier .pem

- [x] **7.4 Secret TERRAFORM_BACKEND_BUCKET**
  - Date: ___________
  - Valeur: ___________
  - Notes: ___________

- [x] **7.5 Secret TERRAFORM_BACKEND_DYNAMODB_TABLE**
  - Date: ___________
  - Valeur: ___________
  - Notes: ___________

- [ ] **7.6 Secret DATABASE_URL**
  - Date: ___________
  - Format: `postgresql://user:pass@host:5432/db`
  - Notes: ___________

- [ ] **7.7 Secret JWT_SECRET**
  - Date: ___________
  - Généré avec: `openssl rand -base64 32`
  - Longueur: ___________
  - Notes: ___________

- [ ] **7.8 Secret POSTGRES_PASSWORD**
  - Date: ___________
  - Généré avec: `openssl rand -base64 24`
  - Notes: ___________

- [ ] **7.9 Secret CORS_ORIGIN**
  - Date: ___________
  - Valeur: `https://___________.com`
  - Notes: ___________

- [ ] **7.10 Vérification des secrets**
  - Date: ___________
  - Tous les secrets sont configurés: [ ] Oui [ ] Non
  - Workflow GitHub Actions testé: [ ] Oui [ ] Non
  - Notes: ___________

---

## Phase 3 : Déploiement Initial (Une seule fois)

### ✅ 8. Provisionnement Terraform

- [x] **8.1 Terraform initialisé**
  - Date: ___________
  - Command: `terraform init -backend-config="..." `
  - Status: [ ] Succès [ ] Erreur
  - Notes: ___________

- [x] **8.2 Terraform plan exécuté**
  - Date: ___________
  - Fichier de variables: `production.tfvars`
  - Resources à créer: ___________
  - Status: [ ] Succès [x] Erreur
  - Notes: │ Error: no matching EC2 Subnet found
│
│   with data.aws_subnet.default,
│   on ec2.tf line 92, in data "aws_subnet" "default":
│   92: data "aws_subnet" "default" {
│
╵

- [x] **8.3 Terraform apply exécuté**
  - Date: ___________
  - Status: [ ] Succès [ ] Erreur
  - Instance EC2 créée: [ ] Oui [ ] Non
  - Notes: ___________

- [x] **8.4 Outputs Terraform notés**
  - Date: 23/11/2025
  - EC2 Instance ID: i-064534a26546a5ff7
  - EC2 Public IP (Elastic IP): 34.242.7.18
  - Autres outputs: ___________
  - Notes:  
aws_region = "eu-west-1"
ec2_instance_id = "i-0cfaa2a8bc82636fa"
ec2_private_ip = "172.31.0.131"
ec2_public_ip = "34.242.7.18"
ec2_role_arn = "arn:aws:iam::697369419679:role/spotaccount-production-ec2-role"
ec2_security_group_id = "sg-02226c6a9643c9bc8"
environment = "production"
github_actions_role_arn = "arn:aws:iam::697369419679:role/spotaccount-production-github-actions-role"
project_name = "spotaccount"

---

### ✅ 9. Configuration Initiale sur EC2

- [x] **9.1 SSH dans l'instance EC2 réussi**
  - Date: 23/11/2025
  - Command: `ssh -i ___________.pem ec2-user@___________.`
  - User: [ ] ec2-user [ ] ubuntu [ ] Autre: ___________
  - Notes: ___________

- [x] **9.2 Structure de répertoires créée**
  - Date: 23/11/2025
  - Dossier principal: `/opt/spotaccount`
  - Sous-dossiers créés: [ ] scripts [ ] nginx [ ] logs
  - Permissions: ___________
  - Notes: ___________

- [x] **9.3 Fichier .env.production créé**
  - Date: 23/11/2025
  - Variables configurées:
    - [ ] POSTGRES_DB
    - [ ] POSTGRES_USER
    - [ ] POSTGRES_PASSWORD
    - [ ] JWT_SECRET
    - [ ] CORS_ORIGIN
    - [ ] NODE_ENV
    - [x] BACKEND_IMAGE (URI ECR)
    - [x] FRONTEND_IMAGE (URI ECR)
    - [x] DOMAIN_NAME
    - [ ] LETSENCRYPT_EMAIL
  - Notes: 23/11/2025

- [x] **9.4 Fichiers de configuration copiés**
  - Date: ___________
  - Fichiers copiés:
    - [x] docker-compose.prod.yml
    - [x] nginx/ (configuration nginx)
    - [x] scripts/deploy-ec2.sh
  - Notes: ___________

- [x] **9.5 Docker et Docker Compose vérifiés**
  - Date: ___________
  - Docker version: Docker version 25.0.13, build 0bab007
  - Docker Compose version: Docker Compose version v2.24.0
  - Status: [x] Installés [ ] À installer
  - Notes: ___________

---

### ✅ 10. Configuration SSL (Let's Encrypt)

- [ ] **10.1 DNS propagé vérifié**
  - Date: ___________
  - Command: `dig +short ___________.com`
  - Résultat: ___________
  - Status: [ ] OK [ ] Pas encore propagé
  - Notes: ___________

- [ ] **10.2 Script SSL exécuté**
  - Date: ___________
  - Command: `bash scripts/setup-ssl.sh ___________.com __________@__________.com`
  - Status: [ ] Succès [ ] Erreur
  - Notes: ___________

- [ ] **10.3 Certificat SSL vérifié**
  - Date: ___________
  - Command: `curl -I https://___________.com`
  - Status: [ ] HTTPS fonctionne [ ] Erreur
  - Certificat valide jusqu'à: ___________
  - Notes: ___________

- [ ] **10.4 Auto-renouvellement vérifié**
  - Date: ___________
  - Certbot container: [ ] Fonctionne [ ] À vérifier
  - Test de renouvellement: [ ] OK [ ] À faire
  - Notes: ___________

---

## Phase 4 : Tests et Vérification

### ✅ 11. Tests de Déploiement

- [ ] **11.1 Application accessible via HTTP**
  - Date: ___________
  - URL: `http://___________.com`
  - Status: [ ] OK [ ] Erreur
  - Notes: ___________

- [ ] **11.2 Application accessible via HTTPS**
  - Date: ___________
  - URL: `https://___________.com`
  - Status: [ ] OK [ ] Erreur
  - Redirect HTTP → HTTPS: [ ] Fonctionne [ ] Ne fonctionne pas
  - Notes: ___________

- [ ] **11.3 Health check endpoint vérifié**
  - Date: ___________
  - URL: `https://___________.com/healthz`
  - Status: [ ] OK [ ] Erreur
  - Response: ___________
  - Notes: ___________

- [ ] **11.4 API backend fonctionnelle**
  - Date: ___________
  - Endpoint testé: `/api/___________
  - Status: [ ] OK [ ] Erreur
  - Notes: ___________

- [ ] **11.5 Frontend fonctionnel**
  - Date: ___________
  - Pages testées: ___________
  - Status: [ ] OK [ ] Erreur
  - Notes: ___________

---

### ✅ 12. GitHub Actions Workflow

- [ ] **12.1 Premier workflow déclenché**
  - Date: ___________
  - Type: [ ] Push sur master [ ] workflow_dispatch
  - Status: [ ] Succès [ ] Erreur
  - Workflow: `deploy-ec2.yml`
  - Notes: ___________

- [ ] **12.2 Build et push images ECR réussi**
  - Date: ___________
  - Backend image tag: ___________
  - Frontend image tag: ___________
  - Status: [ ] OK [ ] Erreur
  - Notes: ___________

- [ ] **12.3 Déploiement sur EC2 réussi**
  - Date: ___________
  - Script exécuté: `deploy-ec2.sh`
  - Containers démarrés: [ ] Oui [ ] Non
  - Status: [ ] OK [ ] Erreur
  - Notes: ___________

- [ ] **12.4 Health check post-déploiement réussi**
  - Date: ___________
  - Status: [ ] OK [ ] Erreur
  - Notes: ___________

---

## Phase 5 : Maintenance et Monitoring

### ✅ 13. Monitoring Configuré

- [ ] **13.1 CloudWatch Logs configuré (optionnel)**
  - Date: ___________
  - Agent CloudWatch: [ ] Installé [ ] Non installé
  - Log groups créés: ___________
  - Notes: ___________

- [ ] **13.2 CloudWatch Alarms créés**
  - Date: ___________
  - Alarms créés:
    - [ ] CPU Utilization > 80%
    - [ ] StatusCheckFailed
    - [ ] Disk Space > 80%
    - [ ] Autres: ___________
  - Notifications configurées: [ ] Oui [ ] Non
  - Notes: ___________

- [ ] **13.3 Logs applicatifs vérifiés**
  - Date: ___________
  - Backend logs: [ ] Accessibles [ ] Problème
  - Frontend logs: [ ] Accessibles [ ] Problème
  - Nginx logs: [ ] Accessibles [ ] Problème
  - Notes: ___________

---

### ✅ 14. Sauvegardes et Sécurité

- [ ] **14.1 Stratégie de sauvegarde définie**
  - Date: ___________
  - PostgreSQL backups: [ ] Configurés [ ] À configurer
  - EBS snapshots: [ ] Configurés [ ] À configurer
  - Fréquence: ___________
  - Notes: ___________

- [ ] **14.2 Security groups vérifiés**
  - Date: ___________
  - SSH (port 22): [ ] Restreint à IP spécifique [ ] Ouvert
  - HTTPS (port 443): [ ] Ouvert [ ] Restreint
  - Notes: ___________

- [ ] **14.3 Mises à jour système**
  - Date: ___________
  - Packages mis à jour: [ ] Oui [ ] Non
  - Command: `sudo yum update`
  - Notes: ___________

---

## Résumé et Notes Finales

### Dates Clés
- **Début de la configuration**: ___________
- **Premier déploiement réussi**: ___________
- **Application en production**: ___________

### Informations Importantes
- **Région AWS**: ___________
- **Instance EC2 Type**: ___________
- **Coût estimé mensuel**: €___________
- **Domaine principal**: ___________

### Problèmes Rencontrés
1. ___________
   - Solution: ___________

2. ___________
   - Solution: ___________

3. ___________
   - Solution: ___________

### Notes Générales
___________
___________
___________

---

## Checklist Rapide (Version Résumée)

```
Phase 1 - AWS Setup:
[ ] Compte AWS configuré
[ ] IAM User créé (nom: CICD)
[ ] ECR Repositories créés
[ ] S3 + DynamoDB pour Terraform
[ ] Key Pair EC2 créée

Phase 2 - GitHub Setup:
[ ] Tous les secrets GitHub configurés (9 secrets)

Phase 3 - Déploiement:
[ ] Terraform apply réussi
[ ] EC2 instance configurée
[ ] SSL certificate configuré
[ ] Application accessible via HTTPS

Phase 4 - Tests:
[ ] Health check OK
[ ] API fonctionnelle
[ ] Frontend fonctionnel
[ ] GitHub Actions workflow OK

Phase 5 - Maintenance:
[ ] Monitoring configuré
[ ] Sauvegardes configurées
```

---

**Dernière mise à jour**: ___________
**Statut global**: [ ] En cours [ ] Complété [ ] Bloqué sur: ___________

