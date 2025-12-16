# Guide de Connexion SSH à l'Instance EC2 - Windows

**Feature**: `simplify-aws-to-ec2`  
**Dernière mise à jour**: 2025-01-22  
**Plateforme**: Windows 10/11 uniquement

Ce guide vous explique comment vous connecter en SSH à votre instance EC2 depuis Windows.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Windows 10/11 avec PowerShell 5.1+ ou PowerShell 7+
- ✅ L'instance EC2 créée et en cours d'exécution
- ✅ L'IP publique (Elastic IP) de l'instance EC2
- ✅ La clé privée SSH (fichier `.pem` ou contenu de la clé depuis GitHub Secrets)
- ✅ Le port 22 (SSH) ouvert dans le security group depuis votre IP

**Note** : Windows 10/11 inclut OpenSSH par défaut. Si vous avez une version plus ancienne, installez [OpenSSH pour Windows](https://github.com/PowerShell/Win32-OpenSSH/releases).

---
```
ssh -i C:\Users\brice\.ssh\id_ed25519_gh.pem ec2-user@34.242.7.18
```

```
cd /opt/spotaccount
```


# Arrêter l'instance
```
aws ec2 stop-instances --instance-ids i-0cfaa2a8bc82636fa --region eu-west-1
```

# Vérifier l'état
```
aws ec2 describe-instances --instance-ids i-0cfaa2a8bc82636fa --region eu-west-1 --query 'Reservations[0].Instances[0].State.Name' --output text
```

# Redemarage 
```
aws ec2 start-instances --instance-ids i-0cfaa2a8bc82636fa --region eu-west-1
```