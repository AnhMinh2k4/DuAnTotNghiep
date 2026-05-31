require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { createHash } = require("crypto");

const prisma = new PrismaClient();
const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const adminEmail = process.env.SMOKE_ADMIN_EMAIL || "admin@hoangminh.local";
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || "admin123";
const staffEmail = "phase7-staff-smoke@example.com";
const staffPassword = "staff123";
const customerEmail = `phase7-customer-${Date.now()}@example.com`;
const otherCustomerEmail = `phase7-other-${Date.now()}@example.com`;
const reviewCustomerEmail = `phase7-review-${Date.now()}@example.com`;

function legacyHashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
    headers: {
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      ...(options.headers || {}),
    },
  });
  return response;
}

function cookieFrom(response) {
  const setCookie = response.headers.get("set-cookie");
  return setCookie ? setCookie.split(";")[0] : "";
}

function actionIds(html) {
  return [...html.matchAll(/name="(\$ACTION_ID_[^"]+)"/g)]
    .map((match) => match[1])
    .filter((value, index, values) => values.indexOf(value) === index);
}

function formData(actionId, fields) {
  const data = new FormData();
  data.append(actionId, "");
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      data.append(key, String(value));
    }
  }
  return data;
}

async function postAction(path, cookie, actionId, fields) {
  const response = await request(path, {
    method: "POST",
    cookie,
    body: formData(actionId, fields),
  });
  assert(response.status === 200, `${path} action failed with ${response.status}`);
}

async function firstProvinceId() {
  const province = await prisma.province.findFirst({ select: { id: true } });
  assert(province, "No province available for order smoke test");
  return province.id;
}

async function adminLogin() {
  const response = await request("/api/auth/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  assert(response.status === 200, `Admin login failed with ${response.status}`);

  const cookie = cookieFrom(response);
  assert(cookie, "Admin login did not return a session cookie");
  return cookie;
}

async function staffLogin() {
  await prisma.user.upsert({
    where: { email: staffEmail },
    update: {
      passwordHash: legacyHashPassword(staffPassword),
      role: "STAFF",
      isActive: true,
    },
    create: {
      name: "Phase 7 Staff Smoke",
      email: staffEmail,
      passwordHash: legacyHashPassword(staffPassword),
      role: "STAFF",
      isActive: true,
    },
  });

  const response = await request("/api/auth/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: staffEmail, password: staffPassword }),
  });
  assert(response.status === 200, `Staff login failed with ${response.status}`);
  return cookieFrom(response);
}

async function customerRegister(email) {
  const response = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Phase 7 Customer Smoke",
      email,
      password: "customer123",
      phone: "0907777777",
      address: "Phase 7 smoke address",
    }),
  });
  assert(response.status === 200, `Customer register failed with ${response.status}`);
  const cookie = cookieFrom(response);
  assert(cookie, "Customer register did not return a cookie");
  return cookie;
}

async function assertAdminPages(cookie) {
  for (const path of ["/admin", "/admin/categories", "/admin/products", "/admin/coupons", "/admin/shipping", "/admin/orders", "/admin/support-requests", "/admin/reviews", "/admin/questions", "/admin/users", "/admin/settings"]) {
    const response = await request(path, { cookie });
    const body = await response.text();
    assert(response.status === 200, `${path} returned ${response.status}`);
    assert(!body.includes("Dang nhap Admin"), `${path} rendered the login page`);
  }
}

async function testStaffPermissions() {
  const staffCookie = await staffLogin();
  const allowed = await request("/admin/orders", { cookie: staffCookie });
  assert(allowed.status === 200, `Staff orders page returned ${allowed.status}`);

  const productPage = await request("/admin/products", { cookie: staffCookie });
  assert(productPage.status === 307 || productPage.status === 308, `Staff product page should redirect, got ${productPage.status}`);
}

async function testProductDiscovery() {
  const response = await request("/products?q=laptop&sort=price-asc&page=1");
  const body = await response.text();
  assert(response.status === 200, `Product discovery page returned ${response.status}`);
  assert(body.toLowerCase().includes("laptop"), "Product search did not render laptop results");
  assert(body.includes("Giá tăng dần"), "Product sort control did not render");
}

async function testCategoryCrud(cookie) {
  const html = await (await request("/admin/categories", { cookie })).text();
  const [createId, updateId, deleteId] = actionIds(html);
  assert(createId && updateId && deleteId, "Category action ids not found");

  const slug = `phase-6-category-smoke-${Date.now()}`;
  await postAction("/admin/categories", cookie, createId, {
    name: slug,
    slug,
    description: "Phase 6 smoke category",
  });

  const created = await prisma.category.findUnique({ where: { slug } });
  assert(created, "Category create did not persist");

  await postAction("/admin/categories", cookie, updateId, {
    id: created.id,
    name: "Phase 6 Category Updated",
    slug,
    description: "Updated phase 6 smoke category",
  });

  const updated = await prisma.category.findUnique({ where: { slug } });
  assert(updated && updated.name === "Phase 6 Category Updated", "Category update did not persist");

  await postAction("/admin/categories", cookie, deleteId, { id: created.id });
  const deleted = await prisma.category.findUnique({ where: { slug } });
  assert(!deleted, "Category delete did not clean up");
}

async function testProductCrud(cookie) {
  const createHtml = await (await request("/admin/products?add=true", { cookie })).text();
  const [createId] = actionIds(createHtml);
  assert(createId, "Product create action id not found");

  const [category, supplier] = await Promise.all([
    prisma.category.findFirst({ select: { id: true } }),
    prisma.supplier.findFirst({ select: { id: true } }),
  ]);
  assert(category, "No category available for product smoke test");

  const stamp = Date.now();
  const slug = `phase-6-product-smoke-${stamp}`;
  const sku = `P6-SMOKE-${stamp}`;

  await postAction("/admin/products", cookie, createId, {
    name: "Phase 6 Product Smoke",
    slug,
    sku,
    categoryId: category.id,
    supplierId: supplier?.id,
    brand: "Smoke",
    price: 123000,
    salePrice: 99000,
    stock: 7,
    warranty: "12 thang",
    isFeatured: "on",
    isActive: "on",
    description: "Phase 6 product smoke test",
    images: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
    attributes: "CPU=Smoke Test",
  });

  const created = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, attributes: true },
  });
  assert(created && created.images.length === 1 && created.attributes.length === 1, "Product create did not persist related rows");

  const editHtml = await (await request(`/admin/products?edit=${created.id}`, { cookie })).text();
  const [updateId] = actionIds(editHtml);
  assert(updateId, "Product update action id not found");

  await postAction(`/admin/products?edit=${created.id}`, cookie, updateId, {
    id: created.id,
    name: "Phase 6 Product Smoke Updated",
    slug,
    sku,
    categoryId: category.id,
    supplierId: supplier?.id,
    brand: "Smoke",
    price: 123000,
    salePrice: 99000,
    stock: 11,
    warranty: "24 thang",
    isActive: "on",
    description: "Updated phase 6 product smoke test",
    images: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
    attributes: "RAM=16GB",
  });

  const updated = await prisma.product.findUnique({
    where: { slug },
    include: { attributes: true },
  });
  assert(updated && updated.stock === 11 && updated.attributes[0]?.name === "RAM", "Product update did not replace attributes");

  const listHtml = await (await request("/admin/products", { cookie })).text();
  const deleteId = actionIds(listHtml).at(-1);
  assert(deleteId, "Product delete action id not found");

  await postAction("/admin/products", cookie, deleteId, { id: created.id });
  const deleted = await prisma.product.findUnique({ where: { slug } });
  assert(!deleted, "Product delete did not clean up");
}

async function testShippingCrud(cookie) {
  const html = await (await request("/admin/shipping", { cookie })).text();
  const ids = actionIds(html);
  assert(ids.length >= 6, "Shipping action ids not found");
  assert(html.includes("63 tỉnh"), "Province master data note did not render");

  const stamp = Date.now();
  const supplierName = `P6 Supplier Smoke ${stamp}`;
  const shipperName = `P6 Shipper Smoke ${stamp}`;

  await postAction("/admin/shipping", cookie, ids[0], { name: supplierName, phone: "0900000000", email: "smoke@example.com" });
  const supplier = await prisma.supplier.findFirst({ where: { name: supplierName } });
  assert(supplier, "Supplier create did not persist");
  await postAction("/admin/shipping", cookie, ids[1], { id: supplier.id, name: "P6 Supplier Updated", phone: "0911111111" });
  await postAction("/admin/shipping", cookie, ids[2], { id: supplier.id });

  await postAction("/admin/shipping", cookie, ids[3], { name: shipperName, phone: "19000000" });
  const shipper = await prisma.shipper.findFirst({ where: { name: shipperName } });
  assert(shipper, "Shipper create did not persist");
  await postAction("/admin/shipping", cookie, ids[4], { id: shipper.id, name: "P6 Shipper Updated", phone: "19111111" });
  await postAction("/admin/shipping", cookie, ids[5], { id: shipper.id });

  const remaining = await Promise.all([
    prisma.supplier.findUnique({ where: { id: supplier.id } }),
    prisma.shipper.findUnique({ where: { id: shipper.id } }),
  ]);
  assert(remaining.every((item) => item === null), "Shipping CRUD cleanup failed");

  const provinceCount = await prisma.province.count();
  assert(provinceCount === 63, `Expected 63 provinces, got ${provinceCount}`);
}

async function testOrderLifecycle(cookie) {
  const provinceId = await firstProvinceId();
  const product = await prisma.product.findFirst({
    where: { isActive: true, stock: { gt: 0 } },
    select: { id: true },
  });
  assert(product, "No active product available for order smoke test");

  const orderResponse = await request("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Phase 6 Smoke Customer",
      customerEmail: "phase6-smoke@example.com",
      customerPhone: "0909999999",
      provinceId,
      shippingAddress: "Phase 6 smoke address",
      note: "Automated smoke test",
      items: [{ productId: product.id, quantity: 1 }],
    }),
  });
  assert(orderResponse.status === 200, `Order create failed with ${orderResponse.status}`);
  const { orderId } = await orderResponse.json();

  const patchResponse = await request(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    cookie,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "COMPLETED" }),
  });
  assert(patchResponse.status === 200, `Order status update failed with ${patchResponse.status}`);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  assert(order?.status === "COMPLETED" && order.paymentStatus === "PAID", "Order lifecycle did not complete");

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    await tx.order.delete({ where: { id: order.id } });
  });
}

async function testShippingQuote() {
  const provinceId = await firstProvinceId();
  const response = await request("/api/shipping/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provinceId, subtotal: 1000000 }),
  });
  const body = await response.json();
  assert(response.status === 200, `Shipping quote failed with ${response.status}`);
  assert(Number.isFinite(Number(body.shippingFee)), "Shipping quote did not return a numeric fee");
}

async function testCustomerAccountOrderAndCancel() {
  const customerCookie = await customerRegister(customerEmail);
  const otherCookie = await customerRegister(otherCustomerEmail);
  const provinceId = await firstProvinceId();
  const product = await prisma.product.findFirst({
    where: { isActive: true, stock: { gt: 0 } },
    select: { id: true, stock: true },
  });
  assert(product, "No active product available for customer account smoke test");

  const orderResponse = await request("/api/orders", {
    method: "POST",
    cookie: customerCookie,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Phase 7 Customer Smoke",
      customerEmail,
      customerPhone: "0907777777",
      provinceId,
      shippingAddress: "Phase 7 smoke address",
      couponCode: "HM10",
      items: [{ productId: product.id, quantity: 1 }],
    }),
  });
  assert(orderResponse.status === 200, `Customer order create failed with ${orderResponse.status}`);
  const { orderId } = await orderResponse.json();

  const ordersPage = await request("/account/orders", { cookie: customerCookie });
  const ordersBody = await ordersPage.text();
  const linkedOrder = await prisma.order.findFirst({ where: { id: orderId, customerEmail, user: { email: customerEmail } } });
  assert(ordersPage.status === 200 && ordersBody.includes(`/account/orders/${orderId}`) && linkedOrder, "Customer order history did not show created order");

  const otherCustomerOrder = await request(`/account/orders/${orderId}`, { cookie: otherCookie });
  const otherCustomerOrderBody = await otherCustomerOrder.text();
  const renderedNotFound = otherCustomerOrderBody.includes("404") && !otherCustomerOrderBody.includes(`Đơn #${orderId}`);
  assert(otherCustomerOrder.status === 404 || renderedNotFound, `Other customer should not see order, got ${otherCustomerOrder.status}`);

  const supportResponse = await request("/api/support-requests", {
    method: "POST",
    cookie: customerCookie,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      type: "WARRANTY",
      customerName: "Phase 7 Customer Smoke",
      customerEmail,
      customerPhone: "0907777777",
      subject: "Smoke warranty request",
      message: "Automated warranty request for smoke test",
    }),
  });
  assert(supportResponse.status === 200, `Support request create failed with ${supportResponse.status}`);
  const { requestId } = await supportResponse.json();
  const support = await prisma.supportRequest.findUnique({ where: { id: requestId } });
  assert(support?.orderId === orderId && support.status === "OPEN", "Support request did not persist");

  const cancelResponse = await request(`/api/account/orders/${orderId}/cancel`, {
    method: "PATCH",
    cookie: customerCookie,
  });
  assert(cancelResponse.status === 200, `Customer cancel failed with ${cancelResponse.status}`);

  const [order, productAfter] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId }, include: { items: true } }),
    prisma.product.findUnique({ where: { id: product.id }, select: { stock: true } }),
  ]);
  assert(order?.status === "CANCELLED", "Customer cancel did not persist CANCELLED status");
  assert(productAfter && productAfter.stock === product.stock, "Customer cancel did not restore stock");

  await prisma.supportRequest.deleteMany({ where: { id: requestId } });
  await prisma.order.delete({ where: { id: orderId } });
}

async function testCompletedCustomerCanReview(cookie) {
  const customerCookie = await customerRegister(reviewCustomerEmail);
  const provinceId = await firstProvinceId();
  const product = await prisma.product.findFirst({
    where: { isActive: true, stock: { gt: 0 } },
    select: { id: true, stock: true },
  });
  assert(product, "No active product available for review smoke test");

  const orderResponse = await request("/api/orders", {
    method: "POST",
    cookie: customerCookie,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Phase 7 Review Smoke",
      customerEmail: reviewCustomerEmail,
      customerPhone: "0907777777",
      provinceId,
      shippingAddress: "Phase 7 review smoke address",
      items: [{ productId: product.id, quantity: 1 }],
    }),
  });
  assert(orderResponse.status === 200, `Review order create failed with ${orderResponse.status}`);
  const { orderId } = await orderResponse.json();

  const patchResponse = await request(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    cookie,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "COMPLETED" }),
  });
  assert(patchResponse.status === 200, `Review order complete failed with ${patchResponse.status}`);

  const reviewResponse = await request(`/api/products/${product.id}/reviews`, {
    method: "POST",
    cookie: customerCookie,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating: 5, comment: "Smoke review" }),
  });
  assert(reviewResponse.status === 200, `Completed customer review failed with ${reviewResponse.status}`);

  const review = await prisma.review.findFirst({
    where: {
      productId: product.id,
      user: { email: reviewCustomerEmail },
    },
  });
  assert(review?.rating === 5, "Completed customer review did not persist");

  await prisma.$transaction(async (tx) => {
    await tx.review.deleteMany({ where: { productId: product.id, user: { email: reviewCustomerEmail } } });
    await tx.product.update({
      where: { id: product.id },
      data: { stock: { increment: 1 } },
    });
    await tx.order.delete({ where: { id: orderId } });
  });
}

async function testAdminCancelRestoresStock(cookie) {
  const provinceId = await firstProvinceId();
  const product = await prisma.product.findFirst({
    where: { isActive: true, stock: { gt: 0 } },
    select: { id: true, stock: true },
  });
  assert(product, "No active product available for admin cancel smoke test");

  const orderResponse = await request("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Phase 7 Admin Cancel Smoke",
      customerEmail: "phase7-admin-cancel@example.com",
      customerPhone: "0908888888",
      provinceId,
      shippingAddress: "Phase 7 smoke address",
      items: [{ productId: product.id, quantity: 1 }],
    }),
  });
  assert(orderResponse.status === 200, `Admin cancel order create failed with ${orderResponse.status}`);
  const { orderId } = await orderResponse.json();

  const patchResponse = await request(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    cookie,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "CANCELLED" }),
  });
  assert(patchResponse.status === 200, `Admin cancel status update failed with ${patchResponse.status}`);

  const productAfter = await prisma.product.findUnique({ where: { id: product.id }, select: { stock: true } });
  assert(productAfter && productAfter.stock === product.stock, "Admin cancel did not restore stock");
  await prisma.order.delete({ where: { id: orderId } });
}

async function main() {
  await prisma.$queryRawUnsafe("SELECT 1");
  await prisma.user.updateMany({ where: { email: adminEmail }, data: { role: "SUPER_ADMIN", isActive: true } });
  await prisma.coupon.upsert({
    where: { code: "HM10" },
    update: { isActive: true, discountType: "PERCENT", discountValue: 10, minOrderTotal: 0 },
    create: {
      code: "HM10",
      description: "Smoke coupon",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderTotal: 0,
      isActive: true,
    },
  });
  const cookie = await adminLogin();
  await assertAdminPages(cookie);
  await testStaffPermissions();
  await testShippingQuote();
  await testProductDiscovery();
  await testCategoryCrud(cookie);
  await testProductCrud(cookie);
  await testShippingCrud(cookie);
  await testCustomerAccountOrderAndCancel();
  await testCompletedCustomerCanReview(cookie);
  await testOrderLifecycle(cookie);
  await testAdminCancelRestoresStock(cookie);
  console.log("Smoke test passed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.supportRequest.deleteMany({ where: { customerEmail: { in: [customerEmail, otherCustomerEmail, reviewCustomerEmail] } } });
    await prisma.user.deleteMany({ where: { email: { in: [staffEmail, customerEmail, otherCustomerEmail, reviewCustomerEmail] } } });
    await prisma.$disconnect();
  });
