# RIDE ADDIS - YEGARAHOST DEPLOYMENT GUIDE (cPanel & Node.js Selector)

This production e-commerce application is 100% self-contained and deploy-ready for **YegaraHost** (or any standard Ethiopian cPanel web hosting with Node.js support).

---

## 🌟 Key Features for YegaraHost

1. **Zero External Database Setup Needed**:
   - Uses persistent local JSON storage in `data/*.json` (`products.json`, `categories.json`, `orders.json`, `reviews.json`, `settings.json`, `users.json`).
   - All data stays permanently on your YegaraHost disk. No paid third-party database bills!
2. **Real Image Upload System**:
   - Admins can upload bike photos and hero graphics directly from their phone or laptop.
   - Images are automatically saved into `/public/uploads/` and served with low latency.
3. **Telebirr & CBE Birr Payment Gateways**:
   - Integrated merchant codes and QR code management.
4. **Verified Ethiopian Google Reviews**:
   - 6 local reviews with Google Maps badges, 4.9 star rating, and direct moderation in the Admin Dashboard.
5. **Role-Based Authentication & Authorization**:
   - Master Administrator Control Center guarded with secure authentication.
   - Customer account creation with Addis Ababa subcities and phone validation.

---

## 🚀 4-Step YegaraHost Deployment Instructions

### Step 1: Upload Your Files
1. Log in to your **YegaraHost cPanel**.
2. Open **File Manager** and navigate to your website root (e.g. `public_html` or a dedicated app directory).
3. Upload your project files (excluding `node_modules` and `.next`).

---

### Step 2: Configure the Node.js Application in cPanel
1. In cPanel, find **Software** → **Setup Node.js App**.
2. Click **Create Application**.
3. Fill in the following settings:
   - **Node.js Version**: Select `18.x` or `20.x`
   - **Application Mode**: `Production`
   - **Application Root**: e.g., `/home/username/public_html`
   - **Application URL**: `yourdomain.et` (or your subdomain)
   - **Application Startup File**: `node_modules/next/dist/bin/next` or `server.js`
4. Click **Create**.

---

### Step 3: Install Dependencies & Build
1. In the Node.js App interface, click **Run NPM Install**.
2. Once installed, access your terminal (or run command in cPanel):
   ```bash
   npm run build
   ```
3. Ensure the folders `data` and `public/uploads` have write permissions (`755` or `775`).

---

### Step 4: Environment Variables (Optional)
In the Node.js App manager under **Environment variables**, set:
- `ADMIN_EMAIL`: `admin@rideaddis.et`
- `ADMIN_PASSWORD`: `rideaddis2026`
- `NODE_ENV`: `production`

Click **Restart Application**. Your site is now live with SSL!

---

## 🛡️ Default Administrator Credentials

- **Admin URL**: `https://yourdomain.et/admin`
- **Email**: `admin@rideaddis.et`
- **Password**: `rideaddis2026`

*(You can change these in the Admin Settings tab or via Environment variables).*

---

## 📂 Backup & Restore

To back up your store data (products, reviews, orders, categories, settings):
- Simply download the `/data` folder and `/public/uploads` folder from your cPanel File Manager.
