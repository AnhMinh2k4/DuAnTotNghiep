const { PrismaClient, Role } = require("@prisma/client");
const { randomBytes, scryptSync } = require("crypto");

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

function log(message) {
  console.log(`[seed] ${message}`);
}

function withTimeout(promise, label, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const derived = scryptSync(password, salt, 64).toString("base64url");
  return `scrypt$${salt}$${derived}`;
}

const suppliers = [
  { name: "TechOne Distribution", phone: "0901001001", email: "sales@techone.local", address: "Phú Hội, TP. Huế, Thừa Thiên Huế" },
  { name: "Mobile World Supply", phone: "0902002002", email: "contact@mobileworld.local", address: "Quan Cau Giay, Ha Noi" },
  { name: "Digital Parts Hub", phone: "0903003003", email: "parts@digitalhub.local", address: "Quan Hai Chau, Da Nang" },
];

const provinces = [
  "An Giang",
  "Ba Ria - Vung Tau",
  "Bac Giang",
  "Bac Kan",
  "Bac Lieu",
  "Bac Ninh",
  "Ben Tre",
  "Binh Dinh",
  "Binh Duong",
  "Binh Phuoc",
  "Binh Thuan",
  "Ca Mau",
  "Can Tho",
  "Cao Bang",
  "Da Nang",
  "Dak Lak",
  "Dak Nong",
  "Dien Bien",
  "Dong Nai",
  "Dong Thap",
  "Gia Lai",
  "Ha Giang",
  "Ha Nam",
  "Ha Noi",
  "Ha Tinh",
  "Hai Duong",
  "Hai Phong",
  "Hau Giang",
  "Hoa Binh",
  "Hung Yen",
  "Khanh Hoa",
  "Kien Giang",
  "Kon Tum",
  "Lai Chau",
  "Lam Dong",
  "Lang Son",
  "Lao Cai",
  "Long An",
  "Nam Dinh",
  "Nghe An",
  "Ninh Binh",
  "Ninh Thuan",
  "Phu Tho",
  "Phu Yen",
  "Quang Binh",
  "Quang Nam",
  "Quang Ngai",
  "Quang Ninh",
  "Quang Tri",
  "Soc Trang",
  "Son La",
  "Tay Ninh",
  "Thai Binh",
  "Thai Nguyen",
  "Thanh Hoa",
  "Thua Thien Hue",
  "Tien Giang",
  "TP. Ho Chi Minh",
  "Tra Vinh",
  "Tuyen Quang",
  "Vinh Long",
  "Vinh Phuc",
  "Yen Bai",
];

const shippers = [
  { name: "Giao Hang Nhanh", phone: "1900636677" },
  { name: "Viettel Post", phone: "19008095" },
  { name: "J&T Express", phone: "19001088" },
];

const categories = [
  {
    name: "Laptop",
    slug: "laptop",
    description: "Laptop hoc tap, van phong, gaming va do hoa.",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Dien thoai",
    slug: "dien-thoai",
    description: "Smartphone chinh hang cho hoc tap, lam viec va giai tri.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Linh kien may tinh",
    slug: "linh-kien-may-tinh",
    description: "CPU, RAM, SSD, card do hoa va thiet bi nang cap PC.",
    imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Phu kien",
    slug: "phu-kien",
    description: "Ban phim, chuot, tai nghe, sac cap va phu kien cong nghe.",
    imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85",
  },
];

const products = [
  {
    categorySlug: "laptop",
    supplierName: "TechOne Distribution",
    name: "Laptop Acer Aspire 7",
    slug: "laptop-acer-aspire-7",
    sku: "LT-AC-A7",
    brand: "Acer",
    description: "Laptop hieu nang cao cho hoc tap, lap trinh va lam viec da nhiem.",
    price: "16990000",
    salePrice: "15490000",
    stock: 15,
    warranty: "12 thang",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["CPU", "Intel Core i5"],
      ["RAM", "16GB"],
      ["SSD", "512GB"],
      ["Man hinh", "15.6 inch Full HD"],
    ],
    variants: [
      { name: "16GB / 512GB", sku: "LT-AC-A7-16-512", priceDelta: "0", stock: 8, options: { RAM: "16GB", SSD: "512GB" } },
      { name: "32GB / 1TB", sku: "LT-AC-A7-32-1TB", priceDelta: "2500000", stock: 7, options: { RAM: "32GB", SSD: "1TB" } },
    ],
  },
  {
    categorySlug: "dien-thoai",
    supplierName: "Mobile World Supply",
    name: "Samsung Galaxy A55",
    slug: "samsung-galaxy-a55",
    sku: "DT-SS-A55",
    brand: "Samsung",
    description: "Dien thoai Android tam trung voi camera tot, pin lon va man hinh AMOLED.",
    price: "9990000",
    salePrice: null,
    stock: 25,
    warranty: "12 thang",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["Bo nho", "256GB"],
      ["RAM", "8GB"],
      ["Camera", "50MP"],
      ["Pin", "5000mAh"],
    ],
    variants: [
      { name: "Xanh / 128GB", sku: "DT-SS-A55-BL-128", priceDelta: "-800000", stock: 10, options: { Mau: "Xanh", "Bo nho": "128GB" } },
      { name: "Den / 256GB", sku: "DT-SS-A55-BK-256", priceDelta: "0", stock: 15, options: { Mau: "Den", "Bo nho": "256GB" } },
    ],
  },
  {
    categorySlug: "linh-kien-may-tinh",
    supplierName: "Digital Parts Hub",
    name: "SSD Kingston NV2 1TB",
    slug: "ssd-kingston-nv2-1tb",
    sku: "LK-KS-NV2-1TB",
    brand: "Kingston",
    description: "SSD NVMe dung luong 1TB giup nang cap toc do khoi dong va truy xuat du lieu.",
    price: "1590000",
    salePrice: "1390000",
    stock: 40,
    warranty: "36 thang",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["Dung luong", "1TB"],
      ["Chuan", "M.2 NVMe"],
      ["Toc do doc", "3500MB/s"],
    ],
  },
  {
    categorySlug: "phu-kien",
    supplierName: "Digital Parts Hub",
    name: "Ban phim co Keychron K2",
    slug: "ban-phim-co-keychron-k2",
    sku: "PK-KC-K2",
    brand: "Keychron",
    description: "Ban phim co khong day layout gon, phu hop lap trinh va van phong.",
    price: "2190000",
    salePrice: null,
    stock: 18,
    warranty: "12 thang",
    isFeatured: false,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["Ket noi", "Bluetooth / USB-C"],
      ["Switch", "Brown"],
      ["Layout", "75%"],
    ],
  },
  {
    categorySlug: "laptop",
    supplierName: "TechOne Distribution",
    name: "Laptop ASUS Vivobook 15 OLED",
    slug: "laptop-asus-vivobook-15-oled",
    sku: "LT-AS-V15-OLED",
    brand: "ASUS",
    description: "Laptop màn hình OLED sắc nét, phù hợp học tập, văn phòng và thiết kế cơ bản.",
    price: "18990000",
    salePrice: "17490000",
    stock: 12,
    warranty: "24 thang",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["CPU", "Intel Core i5 Gen 13"],
      ["RAM", "16GB"],
      ["SSD", "512GB"],
      ["Màn hình", "15.6 inch OLED"],
    ],
    variants: [
      { name: "Bạc / 512GB", sku: "LT-AS-V15-SL-512", priceDelta: "0", stock: 6, options: { Mau: "Bạc", SSD: "512GB" } },
      { name: "Xanh / 1TB", sku: "LT-AS-V15-BL-1TB", priceDelta: "1800000", stock: 6, options: { Mau: "Xanh", SSD: "1TB" } },
    ],
  },
  {
    categorySlug: "laptop",
    supplierName: "TechOne Distribution",
    name: "MacBook Air M2 13 inch",
    slug: "macbook-air-m2-13-inch",
    sku: "LT-AP-MBA-M2",
    brand: "Apple",
    description: "MacBook Air M2 mỏng nhẹ, pin tốt, phù hợp học tập và làm việc di động.",
    price: "24990000",
    salePrice: "22990000",
    stock: 9,
    warranty: "12 thang",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["Chip", "Apple M2"],
      ["RAM", "8GB"],
      ["SSD", "256GB"],
      ["Pin", "Lên đến 18 giờ"],
    ],
  },
  {
    categorySlug: "dien-thoai",
    supplierName: "Mobile World Supply",
    name: "iPhone 15 128GB",
    slug: "iphone-15-128gb",
    sku: "DT-AP-IP15-128",
    brand: "Apple",
    description: "iPhone 15 với Dynamic Island, camera 48MP và cổng USB-C.",
    price: "22990000",
    salePrice: "20990000",
    stock: 20,
    warranty: "12 thang",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["Bộ nhớ", "128GB"],
      ["Camera", "48MP"],
      ["Màn hình", "6.1 inch"],
      ["Cổng sạc", "USB-C"],
    ],
    variants: [
      { name: "Hồng / 128GB", sku: "DT-AP-IP15-PK-128", priceDelta: "0", stock: 8, options: { Mau: "Hồng", "Bo nho": "128GB" } },
      { name: "Đen / 256GB", sku: "DT-AP-IP15-BK-256", priceDelta: "2800000", stock: 12, options: { Mau: "Đen", "Bo nho": "256GB" } },
    ],
  },
  {
    categorySlug: "dien-thoai",
    supplierName: "Mobile World Supply",
    name: "Xiaomi Redmi Note 13 Pro",
    slug: "xiaomi-redmi-note-13-pro",
    sku: "DT-XM-RN13P",
    brand: "Xiaomi",
    description: "Smartphone tầm trung mạnh mẽ, camera độ phân giải cao và sạc nhanh.",
    price: "7490000",
    salePrice: "6990000",
    stock: 30,
    warranty: "18 thang",
    isFeatured: false,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["RAM", "8GB"],
      ["Bộ nhớ", "256GB"],
      ["Camera", "200MP"],
      ["Sạc nhanh", "67W"],
    ],
  },
  {
    categorySlug: "linh-kien-may-tinh",
    supplierName: "Digital Parts Hub",
    name: "RAM Kingston Fury Beast 16GB DDR4",
    slug: "ram-kingston-fury-beast-16gb-ddr4",
    sku: "LK-KS-FURY-16D4",
    brand: "Kingston",
    description: "RAM DDR4 bus cao, nâng cấp hiệu năng đa nhiệm cho PC và laptop.",
    price: "990000",
    salePrice: "850000",
    stock: 55,
    warranty: "36 thang",
    isFeatured: false,
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["Dung lượng", "16GB"],
      ["Chuẩn", "DDR4"],
      ["Bus", "3200MHz"],
    ],
  },
  {
    categorySlug: "linh-kien-may-tinh",
    supplierName: "Digital Parts Hub",
    name: "Card đồ họa RTX 4060 8GB",
    slug: "card-do-hoa-rtx-4060-8gb",
    sku: "LK-VGA-RTX4060",
    brand: "NVIDIA",
    description: "Card đồ họa phục vụ gaming, dựng hình và tác vụ AI cơ bản.",
    price: "8990000",
    salePrice: "8390000",
    stock: 14,
    warranty: "36 thang",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["VRAM", "8GB GDDR6"],
      ["Nguồn đề nghị", "550W"],
      ["Cổng", "HDMI / DisplayPort"],
    ],
  },
  {
    categorySlug: "phu-kien",
    supplierName: "Digital Parts Hub",
    name: "Chuột Logitech MX Master 3S",
    slug: "chuot-logitech-mx-master-3s",
    sku: "PK-LG-MX3S",
    brand: "Logitech",
    description: "Chuột không dây cao cấp cho văn phòng, thiết kế và lập trình.",
    price: "2490000",
    salePrice: "2190000",
    stock: 22,
    warranty: "12 thang",
    isFeatured: false,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["Kết nối", "Bluetooth / USB Receiver"],
      ["DPI", "8000"],
      ["Pin", "Sạc USB-C"],
    ],
  },
  {
    categorySlug: "phu-kien",
    supplierName: "Digital Parts Hub",
    name: "Tai nghe Sony WH-1000XM5",
    slug: "tai-nghe-sony-wh-1000xm5",
    sku: "PK-SN-WH1000XM5",
    brand: "Sony",
    description: "Tai nghe chống ồn chủ động, chất âm cân bằng cho làm việc và giải trí.",
    price: "8490000",
    salePrice: "7790000",
    stock: 16,
    warranty: "12 thang",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=85",
    attributes: [
      ["Chống ồn", "ANC"],
      ["Pin", "30 giờ"],
      ["Kết nối", "Bluetooth"],
    ],
  },
];

const aiKnowledgeItems = [
  {
    title: "Chính sách bảo hành",
    keywords: "bao hanh, bảo hành, lỗi sản phẩm, hỏng máy, sửa chữa",
    answer: "Sản phẩm tại TMDT Shop được bảo hành theo thời hạn ghi trên trang chi tiết sản phẩm. Bảo hành áp dụng cho lỗi kỹ thuật từ nhà sản xuất. Bạn vui lòng cung cấp mã đơn hàng, email mua hàng và mô tả lỗi để shop kiểm tra.",
    priority: 20,
    isActive: true,
  },
  {
    title: "Đổi trả sản phẩm",
    keywords: "doi tra, đổi trả, trả hàng, hoàn hàng, giao sai, thiếu phụ kiện",
    answer: "Shop hỗ trợ đổi trả trong 7 ngày nếu sản phẩm còn nguyên hộp, tem, phụ kiện và không có dấu hiệu sử dụng sai cách. Nếu sản phẩm giao sai hoặc lỗi khi nhận, bạn vui lòng gửi yêu cầu kèm hình ảnh và mã đơn hàng.",
    priority: 20,
    isActive: true,
  },
  {
    title: "Thanh toán",
    keywords: "thanh toán, thanh toan, COD, chuyển khoản, chuyen khoan, đã thanh toán",
    answer: "TMDT Shop hỗ trợ thanh toán khi nhận hàng và chuyển khoản/demo. Sau khi đặt hàng, trạng thái thanh toán sẽ hiển thị trong chi tiết đơn hàng.",
    priority: 15,
    isActive: true,
  },
  {
    title: "Vận chuyển và giao hàng",
    keywords: "giao hàng, giao hang, vận chuyển, van chuyen, ship, phí ship, theo dõi đơn",
    answer: "Đơn hàng sẽ được xác nhận, đóng gói và bàn giao cho đơn vị vận chuyển. Bạn có thể theo dõi trạng thái trong mục Tài khoản > Đơn hàng.",
    priority: 15,
    isActive: true,
  },
];

async function main() {
  log("Connecting to MySQL...");
  await withTimeout(prisma.$queryRaw`SELECT 1`, "MySQL connection check");

  log("Cleaning old sample commerce data...");
  await prisma.supportRequest.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customerQuestion.deleteMany();
  await prisma.aiKnowledgeItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.shipper.deleteMany();
  await prisma.shippingRate.deleteMany();
  await prisma.province.deleteMany();

  log("Upserting admin account...");
  await withTimeout(prisma.user.upsert({
    where: { email: "admin@tmdtshop.local" },
    update: {
      name: "Hoang Minh Admin",
      passwordHash: hashPassword("admin123"),
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      name: "Hoang Minh Admin",
      email: "admin@tmdtshop.local",
      passwordHash: hashPassword("admin123"),
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  }), "Admin upsert");

  await withTimeout(prisma.user.upsert({
    where: { email: "staff@tmdtshop.local" },
    update: {
      name: "Hoang Minh Staff",
      passwordHash: hashPassword("staff123"),
      role: Role.STAFF,
      isActive: true,
    },
    create: {
      name: "Hoang Minh Staff",
      email: "staff@tmdtshop.local",
      passwordHash: hashPassword("staff123"),
      role: Role.STAFF,
      isActive: true,
    },
  }), "Staff upsert");

  await withTimeout(prisma.user.upsert({
    where: { email: "manager@tmdtshop.local" },
    update: {
      name: "Hoang Minh Manager",
      passwordHash: hashPassword("admin123"),
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      name: "Hoang Minh Manager",
      email: "manager@tmdtshop.local",
      passwordHash: hashPassword("admin123"),
      role: Role.ADMIN,
      isActive: true,
    },
  }), "Manager upsert");

  await withTimeout(prisma.user.upsert({
    where: { email: "customer@tmdtshop.local" },
    update: {
      name: "Khach Hang Demo",
      passwordHash: hashPassword("customer123"),
      role: Role.CUSTOMER,
      phone: "0909009009",
      address: "123 Nguyễn Trãi, Thừa Thiên Huế",
      isActive: true,
    },
    create: {
      name: "Khach Hang Demo",
      email: "customer@tmdtshop.local",
      passwordHash: hashPassword("customer123"),
      role: Role.CUSTOMER,
      phone: "0909009009",
      address: "123 Nguyễn Trãi, Thừa Thiên Huế",
      isActive: true,
    },
  }), "Customer upsert");

  log("Creating suppliers, provinces, shippers and categories...");
  for (const supplier of suppliers) {
    await prisma.supplier.create({ data: supplier });
  }
  for (const name of provinces) {
    await prisma.province.create({ data: { name } });
  }
  for (const shipper of shippers) {
    await prisma.shipper.create({ data: shipper });
  }
  const defaultShippingRate = await prisma.shippingRate.create({
    data: {
      label: "Phí giao hàng tiêu chuẩn",
      fee: "30000",
      freeFrom: "20000000",
      isDefault: true,
    },
  });
  const hueProvince = await prisma.province.findUnique({ where: { name: "Thua Thien Hue" } });
  const hanoiProvince = await prisma.province.findUnique({ where: { name: "Ha Noi" } });
  if (hueProvince) {
    await prisma.shippingRate.create({
      data: {
        provinceId: hueProvince.id,
        label: "Nội thành Thừa Thiên Huế",
        fee: "15000",
        freeFrom: "10000000",
      },
    });
  }
  if (hanoiProvince) {
    await prisma.shippingRate.create({
      data: {
        provinceId: hanoiProvince.id,
        label: "Nội thành Hà Nội",
        fee: "20000",
        freeFrom: "12000000",
      },
    });
  }
  log(`Created shipping rates including ${defaultShippingRate.label}`);
  for (const category of categories) {
    await prisma.category.create({ data: category });
  }

  log("Creating products, photos and attributes...");
  for (const product of products) {
    log(`Product ${product.slug}`);
    const [category, supplier] = await Promise.all([
      prisma.category.findUniqueOrThrow({ where: { slug: product.categorySlug } }),
      prisma.supplier.findFirstOrThrow({ where: { name: product.supplierName } }),
    ]);

    const savedProduct = await prisma.product.create({
      data: {
        categoryId: category.id,
        supplierId: supplier.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        brand: product.brand,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        warranty: product.warranty,
        isFeatured: product.isFeatured,
        isActive: true,
        images: {
          create: {
            url: product.image,
            alt: product.name,
            sortOrder: 0,
          },
        },
        attributes: {
          create: product.attributes.map(([name, value], index) => ({
            name,
            value,
            sortOrder: index,
          })),
        },
        variants: product.variants ? {
          create: product.variants.map((variant, index) => ({
            ...variant,
            sortOrder: index,
            isActive: true,
          })),
        } : undefined,
      },
    });

    log(`Created ${savedProduct.name}`);
  }

  log("Creating demo coupon...");
  await prisma.coupon.create({
    data: {
      code: "HM10",
      description: "Giam 10% cho demo do an",
      discountType: "PERCENT",
      discountValue: "10",
      minOrderTotal: "1000000",
      usageLimit: 100,
      isActive: true,
    },
  });
  await prisma.coupon.createMany({
    data: [
      {
        code: "FREESHIP",
        description: "Giam 30.000d phi van chuyen cho demo",
        discountType: "FIXED",
        discountValue: "30000",
        minOrderTotal: "500000",
        usageLimit: 50,
        isActive: true,
      },
      {
        code: "VIP15",
        description: "Giam 15% cho don demo gia tri cao",
        discountType: "PERCENT",
        discountValue: "15",
        minOrderTotal: "15000000",
        usageLimit: 30,
        isActive: true,
      },
    ],
  });

  log("Creating site settings...");
  await prisma.siteSetting.upsert({
    where: { key: "newsletterImageUrl" },
    update: {
      value: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85",
    },
    create: {
      key: "newsletterImageUrl",
      value: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85",
    },
  });

  log("Creating AI chatbox training data...");
  await prisma.aiKnowledgeItem.createMany({
    data: aiKnowledgeItems,
  });

  log("Creating demo orders, reviews and support requests...");
  const customer = await prisma.user.findUniqueOrThrow({ where: { email: "customer@tmdtshop.local" } });
  const staff = await prisma.user.findUniqueOrThrow({ where: { email: "staff@tmdtshop.local" } });
  const [firstProduct, secondProduct] = await prisma.product.findMany({
    take: 2,
    orderBy: { createdAt: "asc" },
  });
  const demoProducts = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: "asc" },
  });
  const province = hueProvince ?? await prisma.province.findFirstOrThrow();
  const shipper = await prisma.shipper.findFirstOrThrow();
  const allShippers = await prisma.shipper.findMany({ orderBy: { id: "asc" } });

  if (firstProduct) {
    const completedOrder = await prisma.order.create({
      data: {
        userId: customer.id,
        provinceId: province.id,
        shipperId: shipper.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone ?? "0909009009",
        shippingAddress: customer.address ?? "123 Nguyễn Trãi, Thừa Thiên Huế",
        status: "COMPLETED",
        paymentStatus: "PAID",
        subtotal: "15490000",
        shippingFee: "15000",
        discountTotal: "0",
        total: "15505000",
        items: {
          create: {
            productId: firstProduct.id,
            name: firstProduct.name,
            sku: firstProduct.sku,
            price: "15490000",
            quantity: 1,
            total: "15490000",
          },
        },
        statusHistory: {
          create: [
            { nextStatus: "PENDING", note: "Đơn mẫu được tạo từ seed." },
            { previousStatus: "PENDING", nextStatus: "CONFIRMED", note: "Admin xác nhận đơn." },
            { previousStatus: "CONFIRMED", nextStatus: "SHIPPING", note: "Đơn được bàn giao shipper." },
            { previousStatus: "SHIPPING", nextStatus: "COMPLETED", note: "Khách đã nhận hàng." },
          ],
        },
      },
    });

    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: firstProduct.id,
        rating: 5,
        comment: "Sản phẩm demo chạy tốt, đóng gói chắc chắn.",
      },
    });

    await prisma.supportRequest.create({
      data: {
        userId: customer.id,
        orderId: completedOrder.id,
        type: "WARRANTY",
        status: "PROCESSING",
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        subject: "Kiểm tra bảo hành laptop demo",
        message: "Khách muốn hỏi quy trình bảo hành cho đơn hàng mẫu.",
        adminNote: "Đã tiếp nhận, chờ khách mang máy đến cửa hàng.",
      },
    });
  }

  if (secondProduct) {
    await prisma.order.create({
      data: {
        userId: staff.id,
        provinceId: province.id,
        customerName: "Khach Hang Cho Xu Ly",
        customerEmail: "pending-customer@example.com",
        customerPhone: "0911001001",
        shippingAddress: "45 Lê Lợi, Thừa Thiên Huế",
        status: "PENDING",
        paymentStatus: "UNPAID",
        subtotal: "9990000",
        shippingFee: "15000",
        discountTotal: "999000",
        couponCode: "HM10",
        total: "9006000",
        items: {
          create: {
            productId: secondProduct.id,
            name: secondProduct.name,
            sku: secondProduct.sku,
            price: "9990000",
            quantity: 1,
            total: "9990000",
          },
        },
        statusHistory: {
          create: {
            nextStatus: "PENDING",
            note: "Đơn mẫu chờ admin xử lý.",
          },
        },
      },
    });
  }

  const extraOrders = [
    { productIndex: 2, name: "Nguyen Minh Khang", email: "khang.nguyen@example.com", phone: "0901222333", address: "12 Cách Mạng Tháng 8, Thừa Thiên Huế", status: "CONFIRMED", paymentStatus: "PAID", quantity: 1, discount: 0, history: ["PENDING", "CONFIRMED"] },
    { productIndex: 3, name: "Tran Bao Anh", email: "baoanh@example.com", phone: "0902444555", address: "88 Nguyen Van Cu, Ha Noi", status: "SHIPPING", paymentStatus: "PAID", quantity: 2, discount: 30000, history: ["PENDING", "CONFIRMED", "SHIPPING"] },
    { productIndex: 4, name: "Le Quoc Viet", email: "viet.le@example.com", phone: "0903666777", address: "21 Bach Dang, Da Nang", status: "COMPLETED", paymentStatus: "PAID", quantity: 1, discount: 0, history: ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED"] },
    { productIndex: 5, name: "Pham Thu Ha", email: "thuha@example.com", phone: "0904888999", address: "53 Ly Thuong Kiet, Can Tho", status: "CANCELLED", paymentStatus: "UNPAID", quantity: 1, discount: 0, history: ["PENDING", "CANCELLED"] },
    { productIndex: 6, name: "Doan Gia Huy", email: "giahuy@example.com", phone: "0905111222", address: "17 Nguyen Hue, Binh Duong", status: "PENDING", paymentStatus: "UNPAID", quantity: 1, discount: 0, history: ["PENDING"] },
  ];

  for (const [index, sample] of extraOrders.entries()) {
    const product = demoProducts[sample.productIndex];
    if (!product) continue;

    const unitPrice = Number(product.salePrice ?? product.price);
    const subtotal = unitPrice * sample.quantity;
    const shippingFee = sample.status === "CANCELLED" ? 0 : 30000;
    const total = subtotal + shippingFee - sample.discount;
    const order = await prisma.order.create({
      data: {
        provinceId: province.id,
        shipperId: sample.status === "SHIPPING" || sample.status === "COMPLETED" ? allShippers[index % allShippers.length]?.id : null,
        customerName: sample.name,
        customerEmail: sample.email,
        customerPhone: sample.phone,
        shippingAddress: sample.address,
        status: sample.status,
        paymentStatus: sample.paymentStatus,
        subtotal: String(subtotal),
        shippingFee: String(shippingFee),
        discountTotal: String(sample.discount),
        couponCode: sample.discount > 0 ? "FREESHIP" : null,
        total: String(total),
        items: {
          create: {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            price: String(unitPrice),
            quantity: sample.quantity,
            total: String(subtotal),
          },
        },
        statusHistory: {
          create: sample.history.map((nextStatus, historyIndex) => ({
            previousStatus: historyIndex === 0 ? null : sample.history[historyIndex - 1],
            nextStatus,
            note: historyIndex === 0 ? "Đơn mẫu được tạo từ seed." : `Cập nhật trạng thái sang ${nextStatus}.`,
          })),
        },
      },
    });

    if (sample.status === "COMPLETED") {
      await prisma.review.create({
        data: {
          userId: customer.id,
          productId: product.id,
          rating: 4,
          comment: "Sản phẩm đúng mô tả, giao hàng nhanh.",
        },
      });
    }

    if (sample.status === "SHIPPING" || sample.status === "COMPLETED") {
      await prisma.supportRequest.create({
        data: {
          orderId: order.id,
          type: sample.status === "SHIPPING" ? "RETURN" : "WARRANTY",
          status: sample.status === "SHIPPING" ? "OPEN" : "RESOLVED",
          customerName: sample.name,
          customerEmail: sample.email,
          customerPhone: sample.phone,
          subject: sample.status === "SHIPPING" ? "Hỏi về đổi trả khi nhận hàng" : "Tư vấn bảo hành phụ kiện",
          message: sample.status === "SHIPPING" ? "Khách muốn biết điều kiện đổi trả nếu sản phẩm không đúng màu." : "Khách hỏi thời gian bảo hành và địa điểm tiếp nhận.",
          adminNote: sample.status === "COMPLETED" ? "Đã phản hồi chính sách bảo hành cho khách." : null,
        },
      });
    }
  }

  await prisma.customerQuestion.createMany({
    data: [
      {
        userId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        subject: "Tư vấn nâng cấp SSD",
        message: "Shop tư vấn giúp em SSD phù hợp cho laptop học lập trình.",
      },
      {
        customerName: "Minh Thu",
        customerEmail: "minhthu@example.com",
        customerPhone: "0912111222",
        subject: "Laptop cho sinh viên thiết kế",
        message: "Em cần laptop học thiết kế đồ họa khoảng 20 triệu, shop gợi ý giúp em.",
      },
      {
        customerName: "Hoang Nam",
        customerEmail: "hoangnam@example.com",
        customerPhone: "0933444555",
        subject: "Kiểm tra tình trạng bảo hành",
        message: "Shop cho em hỏi kiểm tra bảo hành bằng mã đơn như thế nào?",
        isResolved: true,
      },
      {
        customerName: "Lan Anh",
        customerEmail: "lananh@example.com",
        subject: "Có hỗ trợ xuất hóa đơn không?",
        message: "Công ty em cần mua thiết bị và xuất hóa đơn, shop có hỗ trợ không?",
      },
    ],
  });
}

main()
  .then(async () => {
    log("Seeded general e-commerce sample data.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
