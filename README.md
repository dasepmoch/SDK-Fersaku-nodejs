# Fersaku Node.js SDK

Official Node.js SDK untuk Fersaku QRIS Payment Gateway.

## Instalasi

```bash
npm install fersaku
```

Atau copy file `index.js` langsung ke project Anda.

## Quick Start

```javascript
const Fersaku = require('fersaku');

const fersaku = new Fersaku('sk_live_your_secret_key');

// Buat pembayaran
const payment = await fersaku.createPayment({
  amount: 50000,
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  description: 'Pembelian Produk A',
  external_id: 'order-123',
  expired_minutes: 30,
});

console.log(payment.checkout_url); // Redirect customer ke sini
console.log(payment.qr_string);   // Atau tampilkan QR langsung
```

## API Methods

### `createPayment(params)`
Buat pembayaran QRIS baru.

```javascript
const payment = await fersaku.createPayment({
  amount: 100000,           // Wajib, min 1000
  customer_name: 'Budi',   // Opsional
  customer_email: 'budi@email.com', // Opsional
  description: 'Order #123', // Opsional
  external_id: 'my-order-123', // Opsional, ID dari sistem Anda
  expired_minutes: 30,      // Opsional, default 30
});
```

### `getPayment(id)`
Ambil detail pembayaran.

```javascript
const detail = await fersaku.getPayment('payment_id_here');
```

### `listPayments(params)`
List pembayaran dengan filter.

```javascript
const list = await fersaku.listPayments({ status: 'paid', limit: 10 });
```

### `cancelPayment(id)`
Batalkan pembayaran pending.

```javascript
await fersaku.cancelPayment('payment_id_here');
```

### `checkStatus(id)`
Cek status terbaru.

```javascript
const result = await fersaku.checkStatus('payment_id_here');
```

### `simulate(paymentId, action)` (Sandbox only)
Simulasi pembayaran di sandbox.

```javascript
const sandbox = new Fersaku('sk_test_your_sandbox_key');
await sandbox.simulate('payment_id', 'pay'); // pay, expire, fail, cancel
```

## Webhook Verification

```javascript
const Fersaku = require('fersaku');

// Express handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = Fersaku.verifyWebhook(req.body, signature, 'whsec_your_secret');

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const { event, payment_id, status, amount } = req.body;

  if (event === 'payment.paid') {
    // Proses pembayaran berhasil
  }

  res.status(200).send('OK');
});
```

## Sandbox vs Production

```javascript
// Production
const live = new Fersaku('sk_live_xxx');

// Sandbox (testing)
const sandbox = new Fersaku('sk_test_xxx');
```

## Error Handling

```javascript
try {
  const payment = await fersaku.createPayment({ amount: 500 });
} catch (error) {
  console.log(error.message); // "Amount must be at least Rp 1.000"
  console.log(error.status);  // 400
}
```

## Publish ke NPM

```bash
npm login
npm publish
```

## License

MIT
