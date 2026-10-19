# Data Model: Publish the Editor as a GitHub Page

The editor's own data (diagrams, files, stored records) is unchanged. This feature adds no stored data.

## Published site

| Attribute | Meaning |
|-----------|---------|
| Revision | The commit of `main` the files were built from; exactly one at a time |
| Files | The static build output: the page, scripts, styles and assets, and nothing else |
| Address | `https://<owner>.github.io/<repository>/` |

Rule: the site is replaced as a whole by one deployment; there is no state in which two revisions are mixed.

## Publish run

| Attribute | Meaning |
|-----------|---------|
| Trigger | A push to `main`, or a manual start |
| Revision | The commit it checks and builds |
| Outcome | `published`, `failed` (a check or a deploy step failed), or `superseded` (a newer run replaced it) |
| Reason | On failure, the failing step as shown in the run |

State changes: started → checking → (failed | deploying) → (published | failed). A newer run moves an
in-progress older run to `superseded`.

## In-app address

| Attribute | Meaning |
|-----------|---------|
| Form | The page's address followed by `#` and the view: `#/` start screen, `#/new/<type>`, `#/new/c4/<kind>`, `#/d/<id>` |

Rule: the view is wholly in the part after `#`, so any address resolves to the one real page.
