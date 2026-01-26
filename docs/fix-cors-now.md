# Fix CORS immédiatement (sans redéploiement)

## Solution rapide via SSH (copie-colle tout)

```bash
# Connecte-toi à EC2
ssh -i C:\Users\brice\.ssh\id_ed25519_gh ec2-user@34.242.7.18

# Une fois connecté, exécute ces commandes :
cd /opt/spotaccount
sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=http://34.242.7.18|' .env.production
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
docker logs spotaccount-backend --tail 30
```

**Important** : Utilise l'IP exacte `http://34.242.7.18` car le code actuel en production ne gère pas encore `*`.

## Alternative : Modifier manuellement

```powershell
# Connecte-toi à EC2
ssh -i C:\Users\brice\.ssh\id_ed25519_gh ec2-user@34.242.7.18

# Édite le fichier
cd /opt/spotaccount
nano .env.production

# Change cette ligne :
# CORS_ORIGIN=https://yourdomain.com
# En :
# CORS_ORIGIN=*

# Sauvegarde (Ctrl+O, Enter, Ctrl+X)

# Redémarre le backend
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
```

## Note importante

Le code backend actuel ne gère pas encore `CORS_ORIGIN=*` correctement. 
Il faut soit :
1. **Option A** : Modifier temporairement pour mettre l'IP exacte : `CORS_ORIGIN=http://34.242.7.18`
2. **Option B** : Attendre le prochain déploiement avec le nouveau code qui gère `*`

Pour l'option A (solution immédiate) :
```bash
sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=http://34.242.7.18|' .env.production
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
```
cd /opt/spotaccount
sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=http://34.242.7.18|' .env.production
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
docker logs spotaccount-backend --tail 30
docker ps
