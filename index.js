const crypto = require("crypto");

class Fersaku {
  /**
   * @param {string} secretKey - API secret key (sk_live_* atau sk_test_*)
   * @param {object} [options]
   * @param {string} [options.baseUrl] - Base URL API (default: https://fersaku.com/api/v1)
   */
  constructor(secretKey, options = {}) {
    if (!secretKey) throw new Error("Secret key is required");
    this.secretKey = secretKey;
    this.baseUrl = options.baseUrl || "https://fersaku.com/api/v1";
  }

  async _request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.error || `HTTP ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // ============ PAYMENTS ============

  /**
   * Buat pembayaran QRIS baru
   * @param {object} params
   * @param {number} params.amount - Nominal pembayaran (min 1000)
   * @param {string} [params.customer_name] - Nama customer
   * @param {string} [params.customer_email] - Email customer
   * @param {string} [params.customer_phone] - Telepon customer
   * @param {string} [params.description] - Deskripsi pembayaran
   * @param {string} [params.external_id] - ID referensi dari sistem Anda
   * @param {number} [params.expired_minutes] - Waktu expired dalam menit (default 30)
   * @returns {Promise<object>} Payment object dengan checkout_url dan qr_string
   */
  async createPayment(params) {
    return this._request("POST", "/payments", params);
  }

  /**
   * Ambil detail pembayaran
   * @param {string} id - Payment ID
   * @returns {Promise<object>} Payment detail
   */
  async getPayment(id) {
    return this._request("GET", `/payments/${id}`);
  }

  /**
   * List pembayaran
   * @param {object} [params]
   * @param {string} [params.status] - Filter status: pending, paid, expired, failed, cancelled
   * @param {number} [params.limit] - Jumlah per halaman (default 20, max 100)
   * @param {number} [params.page] - Halaman
   * @returns {Promise<object>} List payments
   */
  async listPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this._request("GET", `/payments${query ? `?${query}` : ""}`);
  }

  /**
   * Batalkan pembayaran pending
   * @param {string} id - Payment ID
   * @returns {Promise<object>}
   */
  async cancelPayment(id) {
    return this._request("POST", `/payments/${id}/cancel`);
  }

  /**
   * Cek status pembayaran terbaru
   * @param {string} id - Payment ID
   * @returns {Promise<object>}
   */
  async checkStatus(id) {
    return this._request("POST", `/payments/${id}/check-status`);
  }

  // ============ SANDBOX ============

  /**
   * Simulasi pembayaran (sandbox only)
   * @param {string} paymentId - Payment ID
   * @param {string} action - Action: pay, expire, fail, cancel
   * @returns {Promise<object>}
   */
  async simulate(paymentId, action) {
    return this._request("POST", "/sandbox/simulate", {
      payment_id: paymentId,
      action,
    });
  }

  // ============ WEBHOOK VERIFICATION ============

  /**
   * Verifikasi signature webhook
   * @param {object} body - Request body dari webhook
   * @param {string} signature - Header X-Webhook-Signature
   * @param {string} webhookSecret - Webhook secret (whsec_*)
   * @returns {boolean} true jika signature valid
   */
  static verifyWebhook(body, signature, webhookSecret) {
    const signString = `${body.payment_id}${body.order_id}${body.status}${body.amount}${webhookSecret}`;
    const expected = crypto.createHash("sha256").update(signString, "utf8").digest("hex");
    return signature === expected;
  }
}

module.exports = Fersaku;
