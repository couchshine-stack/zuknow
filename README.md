# zuknow.in

Quick commerce for the whole house: groceries, home build, cooking, electronics, and 15-minute services. Next.js app for cPanel Node.js. Payments via Razorpay. Login via WhatsApp OTP ([Turnkey Infotech](https://otp.turnkeyinfotech.live/admin)).

## Local

```bash
cp .env.example .env
# fill Razorpay + WhatsApp keys
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin) — `admin@zuknow.in` / `zuknow-admin-15` (change `ADMIN_PASSWORD` in `.env`).

If WhatsApp keys are empty, development mode prints the OTP on the login sheet so you can still test.

## WhatsApp OTP

1. Open https://otp.turnkeyinfotech.live/admin
2. Add an instance, link WhatsApp, copy **Client ID** and **API key**
3. Set `WHATSAPP_CLIENT_ID` and `WHATSAPP_API_KEY`
4. The app calls `GET /send-text?phone=91xxxxxxxxxx&message=...&clientId=...&apiKey=...`

## Google Maps (delivery ETA)

1. Create a key in [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) and enable **Maps JavaScript API**, **Directions API**, **Geocoding API**, and **Distance Matrix API**.
2. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `GOOGLE_MAPS_API_KEY` (same key is fine).
3. Restrict the key to your domain plus `localhost`.

The header asks for GPS (or a Google address search). Product cards and product pages then show minutes from **your pin to the seller dark store**. Without a key, GPS still works and time is estimated from distance; with a key you get the live map and Google driving time.

Pin each shop in **Admin → Sellers**.

## cPanel (Node.js)

1. Create a **Node.js** app (Node 18.18+ or 20 LTS).
2. Application root: this project. Startup file: `server.js`.
3. Upload files (skip `node_modules` and `.next`).
4. In Environment Variables, set everything from `.env.example`. For MySQL use the separate fields:

```text
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=your_cpanel_database
DB_USER=your_cpanel_db_user
DB_PASSWORD=your_cpanel_db_password
```

5. SSH or Terminal:

```bash
npm install --omit=dev
npm run db:push
npm run db:seed
npm run build
```

6. Restart the Node.js app. Passenger / the selector should run `npm start` → `node server.js`.

## Admin

`/admin` is the backend: products, sellers, seller categories, commission, orders. New products go live on the storefront when **Active** is checked. Commission waterfall: product override → seller override → seller category default. Paid Razorpay orders post to the commission ledger.

## Mobile app

PWA: on phone, Open in Chrome/Safari → Add to Home Screen.

Native: `mobile/` is an Expo app that talks to the same APIs.

```bash
cd mobile
npm install
# set EXPO_PUBLIC_API_URL to your live site
npx expo start
```

## Security

Do not commit `.env`, `.env.local`, or `rzp-key.csv`. Rotate the Razorpay secret if it was shared.
