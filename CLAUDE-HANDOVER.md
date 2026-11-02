# Claude handover: LwLAT Staff Uniform Shop

## Project purpose

This is an internal staff clothing ordering and stock-control website for Learning without Limits Academy Trust. Staff place orders without paying. The Trust purchases the required garments from Polycopy.

## Current build

- Next.js 16, React 19 and TypeScript
- Prepared for Netlify using `@netlify/plugin-nextjs`
- Orders and inventory stored in Netlify Blobs
- Administration area protected by the `ADMIN_PASSWORD` environment variable
- Source Sans 3 bundled locally through `@fontsource/source-sans-3` (screen stand-in for the brand typeface The Sans)
- Staff-facing prices hidden
- Product prices retained for administration and purchasing purposes
- Mobile-friendly catalogue, basket, checkout and administration views

## Brand and wording

- Organisation name: **Learning without Limits Academy Trust**
- Styled to match LwLAT Pulse Concept C (Jordan Weston, 2 Nov 2026): fixed teal backdrop with grid and ring arcs, white "window" cards, glass pills on teal
- Colours from LwLAT Brand Guidelines v1.0: Mission teal `#098F88`, darkest teal `#00706A` (small text on white, primary buttons), teal `#009189`, Orange `#F5BA19`, light green `#ACCE33`, dark green `#73A434`, red `#CE153F`, purple `#6F2789`, grey `#636466`, near-black `#1F1F1F`, tints `#E6F4F3` and `#F2F7F7`, depth shade `#00524E`
- The backdrop's brightest point is `#037973` (Mission teal toned towards darkest teal). Pure Mission teal gives white text only 3.97:1, below the 4.5:1 needed for body text
- Typeface: Source Sans 3 throughout, including buttons, form controls and admin screens. Swap to The Sans if the Trust buys a web licence
- Tone: clear, warm and practical
- Staff do not pay when submitting an order

## Main features

- Searchable Polycopy clothing catalogue
- Size and quantity selection
- Basket quantity controls and removal
- Staff checkout with school or team and role details
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

Only this variable is required. There is no fallback, so the admin area stays locked until it is set:

```text
ADMIN_PASSWORD=<private admin password>
```

There is no built-in fallback password. If `ADMIN_PASSWORD` is not set, the admin area stays locked while the staff shop keeps working. Never commit the live password.

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
- Keep the typeface bundled locally. Do not load it from Google Fonts.
- Opening stock comes from Polycopy delivery notes 499852 and 499853 (15 October 2026). Earlier estimates were removed. Products not on those notes start at zero.
- Course clothing (Hair & Beauty tunics, Construction-branded Roma sweatshirts and Naples polos) is marked `adminOnly` in `lib/catalog.ts`. It is tracked in the admin area but hidden from staff and cannot be ordered through the shop.
- Category colours carry meaning: Tops red, Shirts purple, Outerwear teal, Site team green, Catering yellow.
- Sold-out items stay visible at the end of the range, greyed out.

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
2. Confirm Source Sans 3 is applied to `html`, `body`, buttons, inputs, selects, textareas and admin controls.
3. Test an order submission and verify stock decreases correctly.
4. Test both Netlify form submissions in a deployed environment.
5. Confirm staff pages contain no prices.
6. To load a new full stock count, edit the quantities in `lib/catalog.ts` and change `stockVersion`. On the next visit the stored stock and movement history are replaced. Orders are kept. For ordinary deliveries, use **Receive or adjust stock** in the admin area instead.
