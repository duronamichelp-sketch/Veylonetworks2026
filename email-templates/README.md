# Veylo Networks — Supabase Auth email branding

These are **copy-ready email designs** for the hosted **Veylo Networks** Supabase Auth project. They use the official Veylo logo hosted at:
https://veylonetworks2026.vercel.app/Veylo_Networks_White_Transparent.png

**Important:** These files are only prepared templates. Merely committing or deploying them to Vercel **does not change what Supabase emails users**. The hosted Supabase project's Authentication → Email Templates must be updated separately.

## Recommended subjects and where to paste each file

| Supabase Authentication template | HTML file | Subject |
| --- | --- | --- |
| Confirm signup | `confirm-signup.html` | Confirm your Veylo Networks account |
| Reset password | `reset-password.html` | Reset your Veylo Networks password |
| Invite user | `invite-user.html` | You're invited to Veylo Networks |
| Magic link | `magic-link.html` | Your Veylo Networks sign-in link |
| Change email address | `change-email.html` | Confirm your Veylo Networks email address change |
| Reauthentication | `reauthentication.html` | Your Veylo Networks verification code |
| Password changed notification (if enabled) | `password-changed-notification.html` | Your Veylo Networks password was changed |
| Email address changed notification (if enabled) | `email-changed-notification.html` | Your Veylo Networks email address was changed |

## Apply in Supabase (production project)

1. Open **https://supabase.com/dashboard/project/oxjjkyfqtlzizdkylsqp/auth/templates**.
2. Choose **Confirm signup**.
3. Set the subject to **Confirm your Veylo Networks account**.
4. Paste the full contents of `confirm-signup.html` into the HTML template. Save.
5. Repeat for **Reset password**, **Invite user**, **Magic link**, **Change email address**, and **Reauthentication** using the table above.
6. If you have enabled security notifications, use the corresponding notification templates.
7. Send a **test** confirmation email and a **test** password reset email to an account you control to verify the official logo displays and secure links complete the expected flow.

**Keep `{{ .ConfirmationURL }}` and `{{ .Token }}` placeholders intact.** Changing them could break verification or password recovery.

## Make the sender say Veylo Networks instead of Supabase

Template subjects and content do **not** control the sender address or sender's display name.

Configure a **verified domain** and custom SMTP provider (e.g., Resend) in
https://supabase.com/dashboard/project/oxjjkyfqtlzizdkylsqp/auth/smtp .

The SMTP sender should then be configured as:

- **Sender name:** Veylo Networks
- **Sender address:** an authorized address on a domain you own and verify (for example `accounts@your-owned-domain.example`).
- **SMTP host, port, username and password:** as issued by the chosen provider. Enter these **privately in Supabase**; never commit SMTP credentials to GitHub.

The default Supabase email service has low delivery limits and is meant for development. Custom SMTP is required for a public registration flow.

**Inbox sender avatar vs email logo:** The logo in these HTML bodies will display in email clients that load external images. A photo beside the sender's name in a Gmail/Outlook inbox is managed separately by the mail provider and might require domain authentication, a sender profile and/or BIMI. It is not controlled by Supabase HTML templates and cannot be guaranteed.

## References

- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/auth-smtp

No changes to the existing Veylo login/signup application code are needed for this branding work.
