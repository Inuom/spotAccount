# Configuration de la Clé SSH pour GitHub Actions

**Feature**: `simplify-aws-to-ec2`  
**Date**: 2025-01-22  
**Problème**: Erreur "Permission denied (publickey)" lors du déploiement EC2

---

## Problème

Lors du déploiement, GitHub Actions échoue avec :
```
ec2-user@34.242.7.18: Permission denied (publickey,gssapi-keyex,gssapi-with-mic).
scp: Connection closed
Error: Process completed with exit code 255.
```

## Solution : Configuration de la Clé SSH

### Étape 1 : Générer ou Récupérer la Clé SSH

#### Option A : Utiliser une clé existante
Si vous avez déjà une clé SSH pour votre instance EC2 :

```bash
# Sur Windows (PowerShell)
cat C:\Users\brice\.ssh\id_ed25519_gh.pem
```

#### Option B : Générer une nouvelle paire de clés

```bash
# Sur Windows (PowerShell)
ssh-keygen -t ed25519 -f ~/.ssh/ec2_deploy_key -C "github-actions-ec2"
```

Cela crée deux fichiers :
- `~/.ssh/ec2_deploy_key` (clé privée) → À mettre dans GitHub Secrets
- `~/.ssh/ec2_deploy_key.pub` (clé publique) → À ajouter sur l'instance EC2

### Étape 2 : Extraire la Clé Publique depuis la Clé Privée

**Important** : Si vous avez seulement la clé privée dans GitHub Secrets, vous devez extraire la clé publique correspondante.

#### Option A : Depuis votre machine Windows (si vous avez la clé privée locale)

```powershell
# Si vous avez la clé privée sur votre machine
ssh-keygen -y -f C:\Users\brice\.ssh\id_ed25519_gh.pem
```

Cela affichera la clé publique. **Copiez tout le résultat** (commence par `ssh-ed25519` ou `ssh-rsa`).

#### Option B : Depuis le workflow GitHub Actions (recommandé)

Le workflow amélioré affiche maintenant automatiquement la clé publique dans les logs. 

1. **Relancez le workflow** (même s'il échoue)
2. **Allez dans l'étape "Setup SSH key"**
3. **Regardez le résumé de l'étape** - vous verrez la clé publique à ajouter
4. **Copiez la clé publique** affichée

### Étape 3 : Ajouter la Clé Publique sur l'Instance EC2

1. **Connectez-vous à votre instance EC2** (utilisez votre clé existante) :
```bash
ssh -i C:\Users\brice\.ssh\id_ed25519_gh.pem ec2-user@34.242.7.18
```

2. **Vérifiez que le dossier .ssh existe** :
```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

3. **Ajoutez la clé publique dans authorized_keys** :
```bash
# Méthode 1 : Ajouter à la fin du fichier (recommandé)
echo "VOTRE_CLE_PUBLIQUE_ICI" >> ~/.ssh/authorized_keys

# Méthode 2 : Éditer le fichier manuellement
nano ~/.ssh/authorized_keys
# Collez la clé publique sur une nouvelle ligne, puis sauvegardez (Ctrl+X, Y, Enter)
```

**Format de la clé publique** (exemple) :
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... votre-clé-publique-ici ... commentaire@github-actions
```

4. **Vérifiez les permissions** :
```bash
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

5. **Vérifiez que la clé a été ajoutée** :
```bash
cat ~/.ssh/authorized_keys
# Vous devriez voir votre clé publique
```

6. **Testez la connexion** (depuis votre machine locale ou depuis GitHub Actions) :
```bash
# Depuis votre machine Windows
ssh -i C:\Users\brice\.ssh\id_ed25519_gh.pem ec2-user@34.242.7.18
```

### Étape 4 : Configurer GitHub Secrets

1. **Allez dans votre repository GitHub** :
   - Settings → Secrets and variables → Actions

2. **Ajoutez ou modifiez le secret `EC2_SSH_PRIVATE_KEY`** :
   - Cliquez sur "New repository secret" ou modifiez l'existant
   - Name: `EC2_SSH_PRIVATE_KEY`
   - Value: **Copiez TOUT le contenu de la clé privée**, y compris :
     ```
     -----BEGIN OPENSSH PRIVATE KEY-----
     [contenu de la clé]
     -----END OPENSSH PRIVATE KEY-----
     ```
     OU
     ```
     -----BEGIN RSA PRIVATE KEY-----
     [contenu de la clé]
     -----END RSA PRIVATE KEY-----
     ```

### ⚠️ Points Importants

1. **Format de la clé** :
   - Copiez TOUT le contenu, y compris les lignes `-----BEGIN...` et `-----END...`
   - Gardez tous les retours à la ligne
   - Ne supprimez pas les espaces ou les sauts de ligne

2. **Vérification du format** :
   - La clé doit commencer par `-----BEGIN` et se terminer par `-----END`
   - Pour une clé OpenSSH : `-----BEGIN OPENSSH PRIVATE KEY-----`
   - Pour une clé RSA : `-----BEGIN RSA PRIVATE KEY-----`

3. **Exemple de clé privée valide** :
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
   NhAAAAAwEAAQAAAIEAy... (plusieurs lignes)
   ...xyz123ABC==
   -----END OPENSSH PRIVATE KEY-----
   ```

### Étape 5 : Vérifier la Configuration

1. **Vérifiez que le secret existe** :
   - GitHub → Settings → Secrets and variables → Actions
   - Vous devriez voir `EC2_SSH_PRIVATE_KEY` dans la liste

2. **Relancez le workflow** :
   - Allez dans Actions
   - Relancez le workflow "EC2 Production Deployment"
   - Le workflow devrait maintenant pouvoir se connecter en SSH

### Dépannage

#### Si la connexion échoue toujours :

1. **Vérifiez que la clé publique est sur EC2** :
```bash
ssh -i C:\Users\brice\.ssh\id_ed25519_gh.pem ec2-user@34.242.7.18
cat ~/.ssh/authorized_keys
# Vous devriez voir votre clé publique avec le fingerprint SHA256:zlzzUt2UDrrb7Kx7AOB3QObsL8jK5mgYWO/+dypK8d8
```

2. **Vérifiez le fingerprint de la clé** :
```bash
# Sur votre machine Windows, vérifiez le fingerprint de votre clé privée
ssh-keygen -l -f C:\Users\brice\.ssh\id_ed25519_gh.pem

# Sur EC2, vérifiez les fingerprints des clés autorisées
ssh -i C:\Users\brice\.ssh\id_ed25519_gh.pem ec2-user@34.242.7.18 "ssh-keygen -l -f ~/.ssh/authorized_keys"
# Le fingerprint doit correspondre
```

2. **Vérifiez les permissions sur EC2** :
```bash
ls -la ~/.ssh/
# authorized_keys doit avoir les permissions 600
# Le dossier .ssh doit avoir les permissions 700
```

3. **Vérifiez le Security Group** :
   - Dans AWS Console → EC2 → Security Groups
   - Vérifiez que le port 22 (SSH) est ouvert depuis `0.0.0.0/0` ou depuis les IPs de GitHub Actions

4. **Testez manuellement avec la clé** :
```bash
# Sur votre machine locale
ssh -i ~/.ssh/ec2_deploy_key -v ec2-user@34.242.7.18
# L'option -v donne des détails de débogage
```

5. **Vérifiez le format de la clé dans GitHub Secrets** :
   - Le secret doit contenir exactement le même contenu que votre fichier de clé privée
   - Pas d'espaces supplémentaires au début ou à la fin
   - Tous les retours à la ligne doivent être préservés

### Commandes Utiles

```bash
# Vérifier le format d'une clé SSH
ssh-keygen -l -f ~/.ssh/ec2_deploy_key

# Tester la connexion avec verbose
ssh -i ~/.ssh/ec2_deploy_key -v ec2-user@34.242.7.18

# Vérifier les clés autorisées sur EC2
ssh -i ~/.ssh/id_ed25519_gh.pem ec2-user@34.242.7.18 "cat ~/.ssh/authorized_keys"
```

---

**Note** : Après avoir configuré le secret, le workflow amélioré vérifiera automatiquement :
- Le format de la clé SSH
- La connexion SSH avant de copier les fichiers
- Des messages d'erreur plus clairs en cas de problème

