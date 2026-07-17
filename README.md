# Soccer Merchant (MODCOM CUP 2026)

เว็บแดชบอร์ดสำหรับกิจกรรม ice-breaking / สันทนาการของมหาวิทยาลัย —
นักศึกษาเลือกดูการ์ด "นักฟุตบอล" ที่วางขาย จัดกลุ่มตามประเทศ เมื่อซื้อ
การ์ดใบใดใบหนึ่ง การ์ดนั้นจะถูกนำออกจากกอง และราคาของการ์ด**ที่เหลือ**
ในประเทศนั้นจะปรับขึ้น ธีมภาพอ้างอิงการเปิดแพ็ก (pack-opening) และหน้า
จัดทีมแบบ FIFA/PES

ใช้งานแบบ **kiosk จอเดียว** — โน้ตบุ๊ก/โปรเจกเตอร์เครื่องเดียว ควบคุมโดย
ผู้ดำเนินกิจกรรม ไม่มี backend/server ทุกอย่างอยู่ใน React state + mirror
ลง `localStorage`

> 📄 **สเปกฉบับเต็ม** (กติกา, โมเดลข้อมูล, ทิศทางดีไซน์, เฟสการพัฒนา,
> สถานะปัจจุบัน) อยู่ใน [`CLAUDE.md`](./CLAUDE.md) — อ่านไฟล์นั้นก่อนแก้โค้ด

## เทคสแตก

- **React 19** + **Vite 8** — SPA ไม่มี backend
- **Tailwind CSS v4** (ผ่าน `@tailwindcss/vite`) — layout/styling
- **Framer Motion** — แอนิเมชันสไตล์ FIFA (card reveal, buy flash, price tween)
- **flag-icons** — ธง SVG (MIT) ของ 10 ประเทศ
- **oxlint** — linter

## เริ่มต้นใช้งาน

ต้องมี **Node.js 18+**

```bash
npm install        # ติดตั้ง dependencies
npm run dev        # รัน dev server (http://localhost:5173)
npm run build      # build production ลงโฟลเดอร์ dist/
npm run preview    # พรีวิว build
npm run lint       # ตรวจโค้ดด้วย oxlint
```

## โครงสร้างโปรเจกต์

```
src/
  App.jsx                     สลับระหว่างหน้า CountrySelect / SquadView (ครอบด้วย ErrorBoundary)
  pages/
    CountrySelect.jsx         กริด 10 ประเทศ + สถานะราคา/คงเหลือของแต่ละประเทศ
    SquadView.jsx             จัดวางแบบสนาม (FW/MF/DF/GK) ต่อประเทศ + auto-fit ให้พอดี 1 จอ
  components/
    PlayerCard.jsx            การ์ดเดี่ยว: กรอบ Canva + overlay ธง/ราคา/ปุ่มซื้อ/ตรา SOLD OUT
    PriceTicker.jsx           tween นับราคาแบบ rAF
    ZoomControl.jsx           ปุ่มซูม UI (−/+)
    ErrorBoundary.jsx         กันจอขาวถ้า state/render พัง มีปุ่มกู้คืน
  data/
    countries.seed.js         roster เริ่มต้น 11 นักเตะ/ประเทศ (ชื่อ placeholder รอของจริง)
    countryMeta.js            label + รหัสธง flag-icons ต่อประเทศ
  lib/
    pricing.js                ตรรกะราคา pure: currentPrice, buyPlayer, cancelPlayer, ...
    useSoccerDashboard.js     app state (useReducer) + mirror localStorage + validate shape
    useUiScale.js             hook ค่าซูม UI เก็บใน localStorage
assets/design/                PNG ต้นฉบับจาก Canva (bg, กรอบการ์ด)
public/design/                สำเนา asset ที่ Vite เสิร์ฟจริง
```

## กติกาสำคัญ (สรุปย่อ — ดูเต็มใน CLAUDE.md)

- 10 ประเทศ ประเทศละ 11 การ์ด (FW 3, MF 3, DF 4, GK 1)
- ราคา = `basePrice + step * soldCount` คำนวณ**แยกตามประเทศ** (เริ่ม 200, step 200)
- ซื้อ 1 ใบ → การ์ดนั้นออกจากกอง + ราคาที่เหลือในประเทศนั้นขึ้น 200
- แต่ละประเทศเป็นอิสระต่อกันโดยสมบูรณ์

## Workflow การร่วมพัฒนา (repo นี้เป็น public)

repo เป็น **public** — เพื่อนร่วมทีม clone ได้เลย ส่วนการส่งงานกลับมาให้ merge:

```bash
git clone https://github.com/korat123/modcom-soccer-merchant.git
cd modcom-soccer-merchant
git checkout -b feature/ชื่อฟีเจอร์      # แยก branch เสมอ อย่าแก้บน main ตรง ๆ
# ...แก้โค้ด...
git commit -am "อธิบายสิ่งที่แก้"
git push origin feature/ชื่อฟีเจอร์
```

จากนั้นเปิด **Pull Request** บน GitHub มาที่ branch `main` เจ้าของ repo
(korat123) จะรีวิวแล้ว merge ให้

> ถ้าอยาก push branch ตรงเข้า repo นี้ (ไม่ต้อง fork) เจ้าของ repo ต้อง
> เพิ่มคุณเป็น **collaborator** ก่อน (Settings → Collaborators) ถ้ายังไม่ได้
> เพิ่ม ให้ **fork** repo นี้ไปที่บัญชีตัวเองแล้วเปิด PR ข้าม fork แทน

## หมายเหตุ

- ชื่อ/รูปนักเตะตอนนี้เป็น **placeholder** (`FW 1`, `DF 2`, ...) รอไฟล์จริง
  ภายหลังแล้วค่อยสลับเข้าไป
- ระบบหลังบ้าน Google Sheet ของอีกทีม (`modcom-monopoly-dashboard`) เป็น
  **คนละระบบ แยกจาก repo นี้โดยสิ้นเชิง** — ดูหมายเหตุใน `CLAUDE.md`
