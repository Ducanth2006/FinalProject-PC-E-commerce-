# Kế hoạch đơn giản: specs và PC bundle

## Mục tiêu

- Product linh kiện lưu specs để hiển thị và dùng cho bộ lọc.
- Product PC bundle lấy cấu hình từ các component đã có trong catalog.
- Trang PC hiển thị linh kiện, số lượng, bảo hành như bảng ví dụ.
- Có thể lọc PC theo CPU, GPU, RAM và ổ cứng.
- Code đi theo cách đang viết trong `ProductsService`: DTO rõ ràng, điều kiện query đặt trực tiếp trong `findAll`, tránh tạo framework/schema dùng chung phức tạp.

## Cách hiểu dữ liệu

- `products`: thông tin của từng món hàng (tên, SKU, category, brand, giá, specs).
- `pc_bundle_components`: PC nào gồm những component nào và số lượng mỗi món.
- `specs`: thông số của component. PC bundle không cần chép lại specs của các component.

Quan hệ:

```text
PC Product --pc_bundle_components--> Component Product --specs
```

## Quyền truy cập module PC bundle

- Chỉ `Admin` và `Staff Operation` được tạo, sửa hoặc xóa cấu hình PC bundle.
- API đọc danh sách/chi tiết PC bundle vẫn theo chính sách đọc catalog hiện tại.
- Dùng guard/role hiện có trong project; không tự tạo cơ chế phân quyền mới.

## Quy ước specs tối thiểu

Chỉ thống nhất các field cần để hiển thị/lọc trước. Key dùng `camelCase`; số lưu dạng number; dung lượng dùng GB.

| Category | Field cần dùng | Ví dụ |
|---|---|---|
| CPU (`cpu`) | `model`, `socket`, `coreCount`, `threadCount`, `baseClockGhz`, `boostClockGhz`, `cacheMb` | `{"model":"AMD Ryzen 5 5500","socket":"AM4","coreCount":6,"threadCount":12,"baseClockGhz":3.6,"boostClockGhz":4.2,"cacheMb":19}` |
| GPU (`card-man-hinh`) | `model`, `chipset`, `vramGb` | `{"model":"ZOTAC GeForce RTX 5050 Low Profile","chipset":"RTX 5050","vramGb":8}` |
| RAM (`ram`) | `model`, `capacityGb`, `memoryType`, `speedMhz` | `{"model":"SSTC 16GB DDR4","capacityGb":16,"memoryType":"DDR4","speedMhz":3200}` |
| SSD/HDD (`ssd`, `hdd`) | `model`, `capacityGb`, `storageType`, `interface`, `readMbps`, `writeMbps` | `{"model":"HIKSEMI WAVE 512GB","capacityGb":512,"storageType":"SSD","interface":"NVMe","readMbps":2500,"writeMbps":1025}` |
| Mainboard (`mainboard`) | `model`, `socket`, `memoryType`, `formFactor` | `{"model":"MSI A520M-A PRO","socket":"AM4","memoryType":"DDR4","formFactor":"mATX"}` |
| PSU (`psu`) | `model`, `wattageW` | `{"model":"SSTC 550F","wattageW":550}` |
| Case (`case`) | `model`, `formFactor` | `{"model":"XIGMATEK AQUA MS BLACK","formFactor":"mATX"}` |
| Tản nhiệt (`cooler`) | `model`, `coolerType`, `supportedSockets` | `{"model":"JONSBO CR-1200 RGB BLACK","coolerType":"air","supportedSockets":["AM4"]}` |

Không cần bắt mọi category phải có cùng fields. Bắt đầu bằng ví dụ specs trong Swagger/DTO và validate các field thực sự cần; chưa cần tạo hệ thống schema động theo category.

### Quy ước dung lượng

`capacityGb` là tổng dung lượng của một sản phẩm bán ra. RAM kit 2 thanh tổng 32 GB lưu `capacityGb: 32`; khi gắn vào PC thì quantity là 1. Nếu bán một thanh 16 GB thì lưu 16; hai thanh được thêm vào bundle thì quantity là 2.

## Dữ liệu của PC mẫu

Tạo product PC loại `PC_BUNDLE` như bình thường, để `specs` là `{}`. Sau đó gắn 8 component trong ảnh bằng `pcId`, `componentId`, `quantity`:

| Thứ tự | Component | Số lượng | Bảo hành mẫu |
|---:|---|---:|---:|
| 1 | CPU AMD Ryzen 5 5500 | 1 | 36 tháng |
| 2 | Mainboard MSI A520M-A PRO DDR4 | 1 | 36 tháng |
| 3 | RAM SSTC 16GB DDR4 | 1 | 36 tháng |
| 4 | SSD HIKSEMI WAVE 512GB | 1 | 36 tháng |
| 5 | Nguồn SSTC 550F | 1 | 36 tháng |
| 6 | ZOTAC GeForce RTX 5050 Low Profile 8GB | 1 | 36 tháng |
| 7 | Case XIGMATEK AQUA MS BLACK | 1 | 12 tháng |
| 8 | Tản nhiệt JONSBO CR-1200 RGB BLACK | 1 | 12 tháng |

Tên dòng lấy từ `component.name`; thông số từ `component.specs`; số lượng từ `pc_bundle_components.quantity`.

## Specs có mở rộng được không?

Có. `specs` hiện là JSONB nên có thể thêm field khi có loại linh kiện mới, ví dụ `fanSizeMm`, `radiatorSizeMm` hoặc `pumpIncluded`. Để dữ liệu vẫn dễ đọc và query được:

- Mỗi category giữ các key rõ ràng của nó; chỉ thêm field khi sản phẩm thực sự cần.
- Filter hiện tại chỉ dựa vào các field đã thống nhất (`model`, `capacityGb` và category liên quan).
- Không nhét danh sách linh kiện cấu hình PC hoặc luật tương thích vào `specs` của PC.

Ví dụ `specs` của tản khí:

```json
{
  "model": "JONSBO CR-1200 RGB BLACK",
  "coolerType": "air",
  "supportedSockets": ["AM4", "AM5"]
}
```

Ví dụ `specs` của tản nước:

```json
{
  "model": "Example 240 AIO",
  "coolerType": "liquid",
  "radiatorSizeMm": 240,
  "supportedSockets": ["AM4", "AM5"]
}
```

Tản khí và tản nước đều là component thuộc nhóm tản nhiệt. Khi lưu một PC bundle, kiểm tra danh sách component chỉ có tối đa một sản phẩm thuộc nhóm này. Người quản trị chọn tản khí **hoặc** tản nước; không thêm cả hai. Luật này đặt ở bước validate danh sách component trong service, không đặt trong JSONB. Sau này nếu muốn hỗ trợ nhiều quạt/radiator riêng, có thể mở rộng luật đó mà không phải đổi cách lưu specs.

## Thay đổi code tối thiểu

### 1. Thêm field hiển thị bảng cấu hình

- Thêm `displayOrder` vào `PcBundleComponent`, để giữ đúng thứ tự dòng trong bảng.
- Thêm `warrantyMonths` vào `Product`, vì bảo hành thuộc về từng món hàng và cần hiện cạnh component.
- Entity là nguồn cập nhật schema ở môi trường hiện tại vì `AppModule` đang bật TypeORM `synchronize: true`; `displayOrder` có default và `warrantyMonths` nullable để dữ liệu cũ không bị lỗi. Khi chuyển sang quản lý schema bằng migration, tạo migration tương ứng trước khi tắt synchronize.

### 2. Hoàn thiện API gắn component vào PC

- Thêm DTO đơn giản gồm `pcId`, `componentId`, `quantity`, `displayOrder`.
- Trong service, kiểm tra PC có type `PC_BUNDLE`, component có type `COMPONENT`, và quantity lớn hơn 0.
- Kiểm tra bundle không có nhiều hơn một component thuộc nhóm tản nhiệt (tản khí hoặc tản nước).
- Thêm/sửa/bỏ từng component riêng, không cần gửi lại toàn bộ cấu hình. Mỗi thao tác lưu trong transaction nếu có nhiều thay đổi liên quan; không cần tạo service tổng quát mới cho specs.
- Khi lấy chi tiết PC, trả components đã join Product và sort theo `displayOrder`. Mỗi dòng có `name`, `quantity`, `warrantyMonths`, `specs`.
- Chỉ Admin và Staff Operation được gọi các API thay đổi cấu hình bundle; giữ quyền đọc theo catalog hiện tại.

### 3. Thêm bốn filter PC

Thêm các query params vào `QueryProductDto`:

- `cpu`: model CPU cần tìm.
- `gpu`: model/chipset GPU cần tìm.
- `minRamGb`: dung lượng RAM tối thiểu.
- `minStorageGb`: dung lượng SSD/HDD tối thiểu.

Trong `ProductsService.findAll`, chỉ áp các filter này khi query `type=PC_BUNDLE`:

- CPU/GPU: kiểm tra bundle có component thuộc category CPU/GPU và tên hoặc specs khớp chuỗi truyền vào.
- RAM: cộng `capacityGb * quantity` của component category RAM và so với `minRamGb`.
- Storage: cộng `capacityGb * quantity` của SSD và HDD và so với `minStorageGb`.

Dùng các subquery ngắn ngay cạnh đoạn filter trong `findAll`; parameter binding của TypeORM cho giá trị filter. Không thêm abstraction/query builder dùng chung ở giai đoạn đầu.

### 4. Giữ filter component hiện có

- Component vẫn dùng `categorySlug`, `brandSlug`, sort theo tên/giá như `ProductsService.findAll` hiện tại.
- Không thay đổi logic promotion/giá hiện có.
- Bộ lọc CPU/GPU/RAM/storage chỉ dành cho danh sách PC bundle.

## Thứ tự thực hiện

1. Xem slug category đang dùng trong database và sửa các slug ví dụ trong kế hoạch/DTO nếu khác.
2. Chốt tên field `specs` tối thiểu như bảng trên.
3. Thêm `displayOrder`, `warrantyMonths` và migration.
4. Hoàn thiện DTO/service để xem cấu hình ở `GET /pc-bundle-components/:pcId`, thêm một món bằng `POST /pc-bundle-components`, sửa một món bằng `PATCH /pc-bundle-components/:pcId/:componentId`, và bỏ một món bằng `DELETE` cùng đường dẫn.
5. Thêm bốn query params và điều kiện filter trong `ProductsService.findAll`.
6. Viết/chỉnh test tập trung cho lưu bundle, tổng RAM/storage, lọc CPU/GPU và pagination.

## Tiêu chí hoàn thành

- Có thể lưu PC cùng danh sách linh kiện và quantity.
- Chi tiết PC hiện đúng thứ tự, thông tin và thời hạn bảo hành từng linh kiện.
- Lọc được PC theo CPU, GPU, tổng RAM và tổng dung lượng ổ cứng.
- Danh sách component và sort/giá hiện tại vẫn chạy như trước.

## Chưa làm ở giai đoạn đầu

- Không làm bộ schema động cho mọi danh mục.
- Không tạo bảng thuộc tính riêng; giữ JSONB `specs` như entity hiện tại.
- Không thêm index tối ưu sớm; chỉ xem xét nếu truy vấn chậm khi có dữ liệu thực tế.
- Không tự backfill specs/bảo hành cũ nếu chưa có dữ liệu nguồn xác nhận.
