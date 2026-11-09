import { getAdminUser } from "@/lib/admin-auth";
import { getSettingsForAdmin } from "@/lib/settings";
import { saveAppSettingsAction } from "@/app/admin/actions";
import { AdminAccountForm } from "@/components/admin/AdminAccountForm";
import { PendingSubmit } from "@/components/admin/PendingSubmit";
import { AdminWhatsAppTester } from "@/components/admin/AdminWhatsAppTester";

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  hint,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-zk-navy">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="input"
        autoComplete="off"
      />
      {hint ? <p className="mt-1 text-xs font-normal text-zk-ink/50">{hint}</p> : null}
    </label>
  );
}

function Check({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl bg-zk-mist px-3 py-3 text-sm">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-1" />
      <span>
        <span className="font-semibold text-zk-navy">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs font-normal text-zk-ink/55">{hint}</span> : null}
      </span>
    </label>
  );
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; account?: string; error?: string }>;
}) {
  const params = await searchParams;
  const admin = await getAdminUser();
  let settings;
  let secrets;
  try {
    ({ settings, secrets } = await getSettingsForAdmin());
  } catch {
    return (
      <div className="rounded-3xl bg-white p-6 ring-1 ring-zk-line">
        <h1 className="font-display text-2xl font-extrabold text-zk-navy">Settings could not load</h1>
        <p className="mt-2 text-sm text-zk-ink/65">
          Keys in the server .env still apply. Restart the Node app and try again. If processes are at 100, stop the app, wait, then start once.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-zk-navy">Settings</h1>
        <p className="text-sm text-zk-ink/60">
          These values apply across the store, app APIs, maps, OTP and checkout. Secrets are encrypted in MySQL.
        </p>
      </header>
      {params.saved ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Settings saved. The whole app will use them now.</p>
      ) : null}
      {params.account ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Admin login updated.</p>
      ) : null}
      {params.error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Settings did not save. Try once more. If this repeats, restart the Node app first.
        </p>
      ) : null}

      <form action={saveAppSettingsAction} className="space-y-6">
        <section className="rounded-3xl bg-white p-5 ring-1 ring-zk-line">
          <h2 className="font-display text-lg font-bold text-zk-navy">Store</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field name="appName" label="App name" defaultValue={settings.appName} />
            <Field name="supportPhone" label="Support phone" defaultValue={settings.supportPhone} placeholder="10-digit" />
            <Field name="cityName" label="Service city" defaultValue={settings.cityName} />
            <Field name="freeDeliveryOver" label="Free delivery over (₹)" type="number" defaultValue={settings.freeDeliveryOver} />
            <Field name="deliveryFee" label="Delivery fee (₹)" type="number" defaultValue={settings.deliveryFee} />
            <Field name="maxDeliveryKm" label="Max delivery km" type="number" defaultValue={settings.maxDeliveryKm} hint="Orders farther than this show as too far." />
            <Field name="packMinutes" label="Packing minutes" type="number" defaultValue={settings.packMinutes} />
            <Field name="scooterKmh" label="Scooter km/h" type="number" defaultValue={settings.scooterKmh} />
            <Field name="cityLat" label="City latitude" type="number" defaultValue={settings.cityLat} />
            <Field name="cityLng" label="City longitude" type="number" defaultValue={settings.cityLng} />
            <Field name="cityRadiusKm" label="City radius km" type="number" defaultValue={settings.cityRadiusKm} />
          </div>
          <div className="mt-4">
            <Check
              name="guestCheckout"
              label="Allow guest checkout"
              defaultChecked={settings.guestCheckout !== false}
              hint="On: pay with name, phone and address, no WhatsApp login. Off: login required before Razorpay."
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 ring-1 ring-zk-line">
          <h2 className="font-display text-lg font-bold text-zk-navy">Security</h2>
          <p className="mt-1 text-sm text-zk-ink/55">OTP, sessions and browser access. Used by login, admin cookies and APIs.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field name="otpExpiryMinutes" label="OTP expiry (minutes)" type="number" defaultValue={settings.otpExpiryMinutes} />
            <Field name="otpMaxAttempts" label="OTP max tries" type="number" defaultValue={settings.otpMaxAttempts} />
            <Field name="otpPerHour" label="OTP sends per phone / hour" type="number" defaultValue={settings.otpPerHour} />
            <Field name="customerSessionDays" label="Customer session (days)" type="number" defaultValue={settings.customerSessionDays} />
            <Field name="adminSessionDays" label="Admin session (days)" type="number" defaultValue={settings.adminSessionDays} />
            <label className="block text-sm font-semibold text-zk-navy sm:col-span-2">
              Allowed origins
              <input name="allowedOrigins" defaultValue={settings.allowedOrigins} className="input" placeholder="https://zuknow.in, https://www.zuknow.in" />
              <p className="mt-1 text-xs font-normal text-zk-ink/50">
                Comma-separated. Localhost is always allowed. Blocks unknown sites from calling your APIs.
              </p>
            </label>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-1">
            <Check
              name="secureCookies"
              label="Force secure cookies (HTTPS only)"
              defaultChecked={settings.secureCookies}
              hint="Turn on in production so session cookies are not sent over HTTP."
            />
            <Check
              name="maintenanceMode"
              label="Maintenance mode"
              defaultChecked={settings.maintenanceMode}
              hint="Storefront shows a closed message. Admin stays open."
            />
            <Check
              name="allowOtpPreview"
              label="Show OTP on screen if WhatsApp fails"
              defaultChecked={settings.allowOtpPreview}
              hint="Useful in development. Keep this off on the live site."
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-apple-card ring-1 ring-slate-900/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 font-bold">
              WA
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Turnkey WhatsApp Gateway & Notifications</h2>
              <p className="text-xs text-slate-500">Instant WhatsApp alerts when orders are placed, customer order receipts, and OTP verification.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              name="whatsappBaseUrl"
              label="Turnkey API Base URL"
              defaultValue={settings.whatsappBaseUrl || "http://otp.turnkeyinfotech.live"}
              hint="Default: http://otp.turnkeyinfotech.live"
            />
            <Field
              name="whatsappAdminNotifyPhone"
              label="Admin Notification Phone (Your WhatsApp)"
              defaultValue={settings.whatsappAdminNotifyPhone}
              placeholder="10-digit mobile number"
              hint="You will receive real-time order alerts on this WhatsApp number."
            />
            <Field
              name="whatsappClientId"
              label="Turnkey Client ID"
              type="password"
              placeholder={secrets.whatsappClientId ? "Saved · leave blank to keep" : "Enter Turnkey Client ID"}
            />
            <Field
              name="whatsappApiKey"
              label="Turnkey API Key"
              type="password"
              placeholder={secrets.whatsappApiKey ? "Saved · leave blank to keep" : "Enter Turnkey API Key"}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Check
              name="whatsappNotifyOnOrder"
              label="Send me WhatsApp alert on every new order"
              defaultChecked={settings.whatsappNotifyOnOrder}
              hint="Includes customer name, phone, delivery address, items, and total amount."
            />
            <Check
              name="whatsappNotifyCustomerOnOrder"
              label="Send WhatsApp order receipt to customer"
              defaultChecked={settings.whatsappNotifyCustomerOnOrder}
              hint="Sends an automated confirmation and live tracking link to the buyer."
            />
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <AdminWhatsAppTester defaultPhone={settings.whatsappAdminNotifyPhone} />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-apple-card ring-1 ring-slate-900/[0.06]">
          <h2 className="font-display text-lg font-bold text-slate-900">Payment & Map Keys (encrypted)</h2>
          <p className="mt-1 text-xs text-slate-500">Leave a secret blank to keep the current value. Encrypted in MySQL.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field name="razorpayKeyId" label="Razorpay key id" defaultValue={settings.razorpayKeyId} />
            <Field
              name="razorpayKeySecret"
              label="Razorpay key secret"
              type="password"
              placeholder={secrets.razorpayKeySecret ? "Saved · leave blank to keep" : "Paste secret"}
            />
            <Field name="googleMapsBrowserKey" label="Google Maps browser key" defaultValue={settings.googleMapsBrowserKey} hint="Used on product maps." />
            <Field
              name="googleMapsServerKey"
              label="Google Maps server key"
              type="password"
              placeholder={secrets.googleMapsServerKey ? "Saved · leave blank to keep" : "Optional, falls back to browser key"}
            />
          </div>
        </section>

        <PendingSubmit idle="Save settings" pending="Saving…" />
      </form>

      <AdminAccountForm email={admin?.email || ""} />
    </div>
  );
}
