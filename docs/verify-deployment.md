# Guide de Vérification du Déploiement

**Date**: 2025-12-16  
**IP EC2**: `34.242.7.18`  
**Status**: ✅ Déploiement réussi

---

## 🎯 Vérifications Rapides

### 1. Health Check (Test Principal)

```powershell
# Test du health check via nginx
curl http://34.242.7.18/healthz
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "timestamp": "2025-12-16T..."
}
```

### 2. Health Check Backend Direct

```powershell
# Test direct du backend (via nginx)
curl http://34.242.7.18/api/health
```

**Résultat attendu** :
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...,
  "environment": "production",
  "services": {
    "database": "up"
  }
}
```

### 3. Health Check Base de Données

```powershell
curl http://34.242.7.18/api/health/db
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

---

## 🔍 Vérifications Détaillées

### 4. Vérifier les Conteneurs (via SSH)

```powershell
# Connectez-vous à EC2
ssh -i C:\Users\brice\.ssh\id_ed25519_gh ec2-user@34.242.7.18

# Vérifier le statut des conteneurs
docker ps

# Vérifier les logs du backend
docker logs spotaccount-backend --tail 50

# Vérifier les logs de nginx
docker logs spotaccount-nginx --tail 50

# Vérifier les logs du frontend
docker logs spotaccount-frontend --tail 50
```

**Résultat attendu** : Tous les conteneurs doivent être `Up` et `healthy`

### 5. Vérifier les Volumes Docker

```bash
# Sur EC2
docker volume ls

# Vérifier que les volumes existent :
# - spotaccount_backend_data
# - spotaccount_postgres_data
# - spotaccount_certbot-etc
# - spotaccount_certbot-var
```

### 6. Vérifier la Base de Données SQLite

```bash
# Sur EC2
docker exec spotaccount-backend ls -lh /app/prisma/

# Vérifier que prod.db existe
docker exec spotaccount-backend ls -lh /app/prisma/prod.db
```

### 7. Tester l'API Backend

```powershell
# Test de l'endpoint d'authentification (devrait retourner 401 sans credentials)
curl -v http://34.242.7.18/api/auth/login

# Test d'un endpoint protégé (devrait retourner 401)
curl -v http://34.242.7.18/api/users
```

**Résultat attendu** : `401 Unauthorized` (normal, pas de token JWT)

### 8. Tester le Frontend

```powershell
# Ouvrir dans le navigateur
start http://34.242.7.18

# Ou tester avec curl
curl http://34.242.7.18
```

**Résultat attendu** : Page Angular chargée (HTML avec `<app-root>`)

---

## 🧪 Tests d'Intégration

### 9. Test d'Authentification Complète

```powershell
# 1. Créer un utilisateur admin (si pas encore fait)
# Via SSH sur EC2 :
docker exec spotaccount-backend npx prisma studio
# Ou via API si endpoint existe

# 2. Se connecter
$response = Invoke-RestMethod -Uri "http://34.242.7.18/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"0000"}'

$token = $response.access_token
Write-Host "Token: $token"

# 3. Tester un endpoint protégé avec le token
Invoke-RestMethod -Uri "http://34.242.7.18/api/users" `
  -Headers @{Authorization="Bearer $token"}
```

### 10. Vérifier les Logs en Temps Réel

```bash
# Sur EC2 - Logs combinés de tous les services
docker-compose -f /opt/spotaccount/docker-compose.prod.yml logs -f

# Logs d'un service spécifique
docker logs -f spotaccount-backend
docker logs -f spotaccount-nginx
```

---

## 📊 Checklist de Vérification

### Infrastructure
- [ ] EC2 instance running
- [ ] Security Group permet port 80 (HTTP)
- [ ] Security Group permet port 22 (SSH)
- [ ] Elastic IP assigné et stable

### Conteneurs Docker
- [ ] `spotaccount-backend` : Up et healthy
- [ ] `spotaccount-frontend` : Up
- [ ] `spotaccount-nginx` : Up
- [ ] `spotaccount-postgres` : Up (optionnel, non utilisé)
- [ ] `spotaccount-certbot` : Up

### Endpoints
- [ ] `http://34.242.7.18/healthz` : ✅ 200 OK
- [ ] `http://34.242.7.18/api/health` : ✅ 200 OK
- [ ] `http://34.242.7.18/api/health/db` : ✅ 200 OK
- [ ] `http://34.242.7.18/api/auth/login` : ✅ 401 (normal sans credentials)
- [ ] `http://34.242.7.18/` : ✅ Frontend Angular chargé

### Base de Données
- [ ] Fichier SQLite existe : `/app/prisma/prod.db`
- [ ] Migrations appliquées
- [ ] Base de données accessible depuis le backend

### Performance
- [ ] Health check répond en < 2 secondes
- [ ] Pas d'erreurs dans les logs
- [ ] Conteneurs stables (pas de redémarrages)

---

## 🐛 Dépannage

### Si le health check échoue

```bash
# Sur EC2 - Vérifier les logs du backend
docker logs spotaccount-backend --tail 100

# Vérifier que le backend écoute sur le port 3000
docker exec spotaccount-backend netstat -tlnp | grep 3000

# Tester directement depuis le conteneur
docker exec spotaccount-backend curl http://localhost:3000/api/health/healthz
```

### Si nginx ne démarre pas

```bash
# Vérifier la configuration nginx
docker exec spotaccount-nginx nginx -t

# Vérifier les logs nginx
docker logs spotaccount-nginx --tail 50

# Vérifier que nginx écoute sur le port 80
docker exec spotaccount-nginx netstat -tlnp | grep 80
```

### Si le frontend ne charge pas

```bash
# Vérifier les logs du frontend
docker logs spotaccount-frontend --tail 50

# Vérifier que le frontend écoute
docker exec spotaccount-frontend netstat -tlnp | grep 4200
```

---

## ✅ Commandes de Vérification Rapide (PowerShell)

Créez un script PowerShell pour tester rapidement :

```powershell
# verify-deployment.ps1
$EC2_IP = "34.242.7.18"

Write-Host "🔍 Vérification du déploiement..." -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n1. Health Check (/healthz):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$EC2_IP/healthz" -UseBasicParsing
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erreur: $_" -ForegroundColor Red
}

# Test 2: Backend health
Write-Host "`n2. Backend Health (/api/health):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$EC2_IP/api/health" -UseBasicParsing
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   Status: $($json.status)" -ForegroundColor Gray
    Write-Host "   Database: $($json.services.database)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erreur: $_" -ForegroundColor Red
}

# Test 3: Frontend
Write-Host "`n3. Frontend (/):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$EC2_IP/" -UseBasicParsing
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    if ($response.Content -match "app-root") {
        Write-Host "   ✅ Angular app détecté" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Erreur: $_" -ForegroundColor Red
}

Write-Host "`n✅ Vérification terminée!" -ForegroundColor Cyan
```

Sauvegardez-le et exécutez :
```powershell
.\verify-deployment.ps1
```

---

## 🎉 Résultat Attendu

Si tout fonctionne, tu devrais voir :
- ✅ Health check : `200 OK` avec `{"status":"ok"}`
- ✅ Backend : `200 OK` avec status healthy
- ✅ Frontend : Page Angular chargée
- ✅ Tous les conteneurs : `Up` et `healthy`

**Félicitations ! Ton application est déployée en production ! 🚀**

