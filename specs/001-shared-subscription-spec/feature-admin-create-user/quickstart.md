# Quickstart: Admin Creates Users

## Overview
This guide outlines the end-to-end flow for admins to create users and share a one-time password setup link.

## Steps
1) Admin creates a user
- Go to Users → Create User
- Provide Email (unique), Name (required), optional Role (default USER), and Status (default Active)
- Submit to create. The system returns a one-time password setup link with expiry information

2) Copy and share the setup link
- Click "Copy" to copy the link
- Share the link with the user via your preferred channel (chat, ticket, etc.)

3) User sets password via the setup link
- User opens the link and enters a compliant password
- On success, the account is activated and the link becomes invalid

4) Regenerate link (if expired or lost)
- From the user details page, use "Regenerate invitation" to issue a new link
- Previous tokens are invalidated automatically

## Notes
- Tokens are single-use and expire after 48 hours by default
- Admins can deactivate/reactivate accounts at any time
- All create/regenerate actions are recorded in audit logs
