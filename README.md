# Responsive Classroom Individual Action Plan (Bilingual, Web)

A bilingual (English / Español) fillable web version of the Responsive Classroom
Individual Action Plan, with a backend that collects submissions and a protected
**Response Collection** dashboard where you can see every plan that has been submitted
and export them all to a spreadsheet (CSV).

This app has **no dependencies** and needs **no `npm install`**. It runs on Node 18+.

## What is included

```
server.js            Node HTTP server (submit endpoint + dashboard API + CSV export)
schema.js            The list of form fields (single source of truth)
generate_form.js     Regenerates public/index.html from the schema
public/
  index.html         The fillable form (all four phases, both languages)
  styles.css         Styling (Mundo Verde green / navy palette)
  form.js            Autosave draft + submit
  admin.html         Response Collection dashboard
  admin.js           Dashboard logic (list, view, filter, CSV export)
data/submissions/    One JSON file is written here per submitted plan
README.md
```

## Run it locally

```bash
cd responsive-classroom-action-plan
ADMIN_TOKEN="pick-a-strong-password" node server.js
```

Then open:

- **Form:** http://localhost:3000/
- **Response Collection dashboard:** http://localhost:3000/admin

The dashboard asks for the admin token you set in `ADMIN_TOKEN`.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port to listen on |
| `ADMIN_TOKEN` | `changeme` | Password for the dashboard and CSV export. **Change this.** |
| `DATA_DIR` | `./data/submissions` | Where submitted plans are stored |

## How collection works

1. Share the form URL with staff. Each person fills their own copy. Their progress
   autosaves in their browser, so they will not lose work if they step away.
2. When they press **Submit plan**, the browser sends the answers to `POST /api/submit`.
   The server saves the plan as a timestamped JSON file in `data/submissions/` and
   returns a reference id. The person sees a confirmation.
3. You open **/admin**, enter the token, and every submitted plan appears in the table
   with the person's name, campus, plan date, and the time it was submitted. Click
   **View** to read the full plan, or **Export CSV** to download all responses in one
   spreadsheet (opens cleanly in Excel or Google Sheets, with English and Spanish
   header rows).

## Editing the form

Change field labels or add fields in `schema.js`, adjust the layout in
`generate_form.js`, then rebuild the HTML:

```bash
node generate_form.js
```

The server and CSV export read the same `schema.js`, so they stay in sync.

## Deploying so others can reach it

Any host that runs Node works. A few easy options:

- **Render / Railway / Fly.io:** create a new Node web service from this folder, set
  the start command to `node server.js`, and add an `ADMIN_TOKEN` environment variable.
- **A small VM (e.g. a school server or a cloud VM):** copy the folder, run
  `ADMIN_TOKEN=... node server.js`, and put it behind a reverse proxy (nginx) with HTTPS.

Because submissions are plain JSON files under `data/submissions/`, back that folder up
(or mount a persistent volume) so responses are not lost on redeploy.

### A note on data and privacy

These plans contain staff names. Serve the app over HTTPS, keep the `ADMIN_TOKEN`
private, and store it somewhere only you control. If you would rather not host anything,
the same plan also exists as a Word form plus an Excel collection sheet.

## Want fully automatic collection instead?

If you would prefer responses to flow into a spreadsheet with zero hosting on your part,
this same plan can be rebuilt as a Microsoft Form or Google Form, which writes each
submission straight into Excel or Google Sheets. Ask and it can be provided.
