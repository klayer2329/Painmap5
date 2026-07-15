# Online screening data setup

The public screening page can anonymously insert completed screening records. It cannot read, update, or delete records. The separate `admin.html` page requires a Supabase user whose protected `app_metadata.role` is `screening_admin`.

## 1. Create the database

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run the complete [`supabase/setup.sql`](supabase/setup.sql) script.

The script creates `public.screening_submissions`, enables Row Level Security, grants anonymous clients insert-only access, and grants administrator accounts read-only access.

## 2. Configure the public client

Open `js/supabase-config.js` and set:

```js
window.HOOPFOOT_DATA_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabasePublishableKey: "sb_publishable_...",
  table: "screening_submissions",
};
```

Use only the **publishable** key (or legacy anon key). Never put a secret or service-role key in a browser file.

## 3. Create the administrator

1. In Supabase, open **Authentication → Users** and create the administrator with email and password.
2. In SQL Editor, run the final commented statement from `supabase/setup.sql` after replacing `YOUR_ADMIN_EMAIL@example.com`.
3. Sign out and back in so the new JWT contains the administrator role.
4. Open `/admin.html` on the deployed site.

## Stored fields

- anonymous participant and session UUIDs
- completion time and acute/overuse mode
- every questionnaire answer
- broad and exact pain locations
- functional-test and special-test findings
- base scores, final adjusted scores, and final Top 3
- completed, no-candidate, or emergency-stop outcome

The application does not request or store a participant name, email, phone number, login, IP address, or free-text medical history in the screening table. Hosting and database providers may retain ordinary infrastructure/security logs under their own policies.

## Operational notes

- Review the consent wording and retention period with the organization responsible for the screening program before collecting real athlete data.
- Set and document a retention period before collecting real screening data; delete expired records through an authorized database-administration workflow.
- Public insert endpoints can attract spam. For a high-traffic public rollout, add Turnstile/CAPTCHA and rate limiting before broad promotion.
- Exported CSV files contain health-screening responses and should be stored securely.
