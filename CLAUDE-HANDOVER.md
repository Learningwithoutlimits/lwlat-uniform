# Claude handover: LwLAT Staff Uniform Shop

## Project purpose

This is an internal staff clothing ordering and stock-control website for Learning without Limits Academy Trust. Staff place orders without paying. The Trust purchases the required garments from Polycopy.

## Current build

- Next.js 16, React 19 and TypeScript
- Prepared for Netlify using `@netlify/plugin-nextjs`
- Orders and inventory stored in Netlify Blobs
- Administration area protected by the `ADMIN_PASSWORD` environment variable
- Open Sans bundled locally through `@fontsource/open-sans`
- Staff-facing prices hidden
- Product prices retained for administration and purchasing purposes
- Mobile-friendly catalogue, basket, checkout and administration views

## Brand and wording

- Organisation name: **Learning without Limits Academy Trust**
- Primary teal: `#009189`
- Supporting colours: red `#CD163F`, purple `#6F2789`, yellow `#FDB913`, lime `#BFD22B`, dark green `#74A333`, grey `#636466`
- Typeface: Open Sans throughout, including buttons, form controls and admin screens
- Tone: clear, warm and practical
- Staff do not pay when submitting an order

## Main features

- Searchable Polycopy clothing catalogue
- Size and quantity selection
- Basket quantity controls and removal
- Staff checkout with school or team and department details
- Stock reduction when an order is submitted
- Low-stock threshold of five pieces per product and size
- Admin order-status management
- Stock delivery and correction records
- Stock movement history
- Detailed CSV export for Excel
- Consolidated Polycopy purchasing CSV export

## Netlify notifications

The static form definitions are in `public/__forms.html`.

- `new-uniform-order` records each successful staff order and can email `communications@lwlat.org.uk`
- `low-stock-alert` records an item reaching five pieces or fewer and can email the same address
- A low-stock alert is sent once for a shortage and resets after the item is restocked above five

In Netlify, configure both under **Project configuration > Notifications > Form submission notifications**. The page `https://YOUR-SITE.netlify.app/__forms.html` must be available after deployment so Netlify can detect the forms.

No Resend API key or sender email variable is required.

## Environment variables

Only this variable is required:

```text
ADMIN_PASSWORD=<private admin password>
```

The previous demonstration password was `LWLAT2026`. Replace it before wider staff use. Never commit the live password.

## Important files

- `app/uniform-shop.tsx`: catalogue, basket, checkout and admin interface
- `app/globals.css`: all styling, responsive rules and explicit Open Sans application
- `app/layout.tsx`: local Open Sans imports and root typography class
- `app/api/store/route.ts`: Netlify Blobs storage, order processing, exports, stock changes and notification submissions
- `lib/catalog.ts`: product catalogue, codes, sizes, prices and initial quantities
- `public/products/`: garment and hero imagery
- `public/__forms.html`: Netlify form definitions
- `netlify.toml`: Netlify build configuration
- `README.md`: deployment and operating instructions

## Current design decisions

- Keep prices out of every staff-facing screen.
- The hero garment artwork uses transparent PNGs to avoid visible image rectangles.
- Keep the full Trust name visible.
- Preserve the colourful LwLAT visual style.
- Do not replace Open Sans with a fallback or external Google Fonts request.
- Opening stock values are estimates and should be replaced with confirmed physical quantities before launch.

## Known technical limitation

Netlify Blobs uses a last-write-wins model. This is acceptable for the expected small internal workload, but simultaneous stock writes could overwrite one another. If usage grows, move orders, stock and movements to a transactional database.

## Local development

```bash
npm ci
npm run dev
```

Production check:

```bash
npm run build
```

## Suggested first checks for Claude

1. Run the production build.
2. Confirm Open Sans is applied to `html`, `body`, buttons, inputs, selects, textareas and admin controls.
3. Test an order submission and verify stock decreases correctly.
4. Test both Netlify form submissions in a deployed environment.
5. Confirm staff pages contain no prices.
6. Replace estimated opening stock only when confirmed figures are supplied.
