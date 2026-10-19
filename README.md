# LwLAT Staff Uniform Shop for Netlify

This package contains the staff ordering site, inventory administration, order exports, stock receipt controls and low-stock email alerts.

## Deploy to Netlify

1. Extract this ZIP file and upload the extracted folder to a new private GitHub repository.
2. In Netlify, select **Add new project**, then **Import an existing project**.
3. Connect the GitHub repository. Netlify will read `netlify.toml` and use the correct build settings.
4. In **Project configuration → Environment variables**, add `ADMIN_PASSWORD`, using the private password for the stock administration area.
5. Deploy the project.
6. Confirm that `https://YOUR-SITE.netlify.app/__forms.html` opens successfully. This is the static definition Netlify scans for the notification form.
7. In Netlify, open **Project configuration → Notifications → Form submission notifications**.
8. Select **Add notification → Email notification**.
9. Choose the form named `low-stock-alert`, enter `communications@lwlat.org.uk`, and save.
10. Add a second email notification for `new-uniform-order`, also sending to `communications@lwlat.org.uk`.

Do not add the real password to this package or to GitHub.

## Administration

Open the website and select **Stock admin**. The admin area can:

- export detailed order lines as a CSV file for Excel;
- export a consolidated Polycopy purchasing list;
- change the progress of each staff order;
- record stock deliveries against a purchase order or delivery note;
- make stock corrections with an audit note;
- show stock movements and items at five pieces or fewer.

## Low-stock alerts

Netlify records a `low-stock-alert` form submission when a product and size reaches five pieces or fewer. Once the form notification is configured, Netlify emails the submission to `communications@lwlat.org.uk`. The alert resets after that item is restocked above five, so the same shortage does not produce repeated emails.

## New-order alerts

Every successful staff order also creates a `new-uniform-order` form submission. Its email notification includes the order reference, date, staff details, school or team, department, item names, sizes, product codes, quantities and notes.

## Data storage

Orders and stock are stored in the site's Netlify Blobs store. The first visit creates the initial catalogue automatically. Netlify Blobs is suitable for this small internal ordering system, but overlapping writes use a last-write-wins model. If order volume grows substantially, move the data to Netlify Database.

## Existing password

The current demonstration password is `LWLAT2026`. Set a different `ADMIN_PASSWORD` in Netlify before staff use the site.
