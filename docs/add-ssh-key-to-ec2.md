# Ajouter la Clé SSH sur l'Instance EC2

**Date**: 2025-11-23  
**Clé**: `id_ed25519_gh`  
**Fingerprint**: `SHA256:zlzzUt2UDrrb7Kx7AOB3QObsL8jK5mgYWO/+dypK8d8`

---

## Clé Publique à Ajouter

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEVyIKMfqR9DuIdAYcYgwzO/kUN8qEfhiqM+K3OdpxAE isaru_computer@hotmail.fr
```

---

## Méthode 1 : Via AWS Systems Manager Session Manager (Recommandé)

Si Session Manager est configuré sur votre instance :

1. **Connectez-vous à la console AWS**
2. **Allez dans EC2 → Instances**
3. **Sélectionnez votre instance** (`i-0cfaa2a8bc82636fa`)
4. **Cliquez sur "Connect"**
5. **Choisissez "Session Manager"**
6. **Cliquez sur "Connect"**

Une fois connecté, exécutez :

```bash
# Créer le dossier .ssh si nécessaire
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Ajouter la clé publique
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEVyIKMfqR9DuIdAYcYgwzO/kUN8qEfhiqM+K3OdpxAE isaru_computer@hotmail.fr" >> ~/.ssh/authorized_keys

# Vérifier les permissions
chmod 600 ~/.ssh/authorized_keys

# Vérifier que la clé a été ajoutée
cat ~/.ssh/authorized_keys
```

---

## Méthode 2 : Via une Autre Clé SSH (si disponible)

Si vous avez une autre clé qui fonctionne déjà :

```powershell
# Connectez-vous avec l'autre clé
ssh -i C:\Users\brice\.ssh\autre_cle.pem ec2-user@34.242.7.18

# Une fois connecté, exécutez :
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEVyIKMfqR9DuIdAYcYgwzO/kUN8qEfhiqM+K3OdpxAE isaru_computer@hotmail.fr" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/authorized_keys
```

---

## Méthode 3 : Via AWS CLI (User Data Script)

Si vous ne pouvez pas vous connecter, vous pouvez utiliser User Data :

1. **Arrêtez l'instance** (si nécessaire)
2. **Modifiez l'instance** → **Actions** → **Instance settings** → **Edit user data**
3. **Ajoutez ce script** :

```bash
#!/bin/bash
mkdir -p /home/ec2-user/.ssh
chmod 700 /home/ec2-user/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEVyIKMfqR9DuIdAYcYgwzO/kUN8qEfhiqM+K3OdpxAE isaru_computer@hotmail.fr" >> /home/ec2-user/.ssh/authorized_keys
chmod 600 /home/ec2-user/.ssh/authorized_keys
```

4. **Redémarrez l'instance**

---

## Méthode 4 : Via AWS CLI (si vous avez accès root)

Si vous avez un accès root ou une autre méthode d'accès :

```bash
# Via AWS CLI (nécessite les permissions appropriées)
aws ec2-instance-connect send-ssh-public-key \
  --instance-id i-0cfaa2a8bc82636fa \
  --availability-zone eu-west-1a \
  --instance-os-user ec2-user \
  --ssh-public-key file://C:\Users\brice\.ssh\id_ed25519_gh.pub \
  --region eu-west-1
```

Puis connectez-vous immédiatement après (la clé est temporaire, 60 secondes).

---

## Vérification

Après avoir ajouté la clé, testez la connexion :

```powershell
ssh -i C:\Users\brice\.ssh\id_ed25519_gh ec2-user@34.242.7.18
```

Si ça fonctionne, vous devriez être connecté sans mot de passe.

---

## Pour GitHub Actions

Une fois que la connexion fonctionne, assurez-vous que le secret `EC2_SSH_PRIVATE_KEY` dans GitHub contient bien le contenu de :

```
C:\Users\brice\.ssh\id_ed25519_gh
```

Pour vérifier le contenu :

```powershell
Get-Content C:\Users\brice\.ssh\id_ed25519_gh
```

Copiez TOUT le contenu (y compris `-----BEGIN OPENSSH PRIVATE KEY-----` et `-----END OPENSSH PRIVATE KEY-----`) dans GitHub Secrets → `EC2_SSH_PRIVATE_KEY`.

