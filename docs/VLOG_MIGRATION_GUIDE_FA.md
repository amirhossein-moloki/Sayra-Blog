# راهنمای جامع انتقال سیستم ولاگ (Vlog/Blog) به پروژه دیگر

این راهنما به شما کمک می‌کند تا بخش ولاگ (شامل پست‌ها، دسته‌بندی‌ها، تگ‌ها، کامنت‌ها، لایک‌ها و چندرسانه‌ای) را از پروژه فعلی (**Playnest**) استخراج کرده و به یک پروژه دیگر که فاقد این سیستم است منتقل کنید.

---

## ۱. مدل‌های دیتابیس (Prisma Schema)

در پروژه جدید، شما باید مدل‌های مربوط به ولاگ را به فایل `schema.prisma` خود اضافه کنید.

### نکته بسیار مهم درباره Tenant-Isolation (تفکیک مستاجرها):
در پروژه Playnest، هر پست و کامنت به یک `GamingCenter` (مستاجر یا کلاینت) متصل است (`gamingCenterId`). اگر پروژه مقصد شما تک‌مستاجری (Single-tenant) است، باید فیلد `gamingCenterId` و رفرنس‌های مربوط به `GamingCenter` را از مدل‌ها حذف کنید.

### مدل‌های مورد نیاز برای کپی:
شما باید مدل‌های زیر را از بخش CMS/Blog پروژه Playnest کپی کنید (در فایل `prisma/blog.schema.prisma` یا بخش مربوطه در `schema.prisma` اصلی وجود دارند):

1. **User / AuthorProfile**: برای نویسنده‌ها.
2. **Post**: مدل اصلی پست‌های وبلاگ/ولاگ.
3. **Category & Tag & PostTag**: برای دسته‌بندی و تگ‌گذاری پست‌ها.
4. **Series**: برای زنجیره پست‌های مرتبط (پست‌های سریالی).
5. **Comment**: سیستم نظرات کاربران برای هر پست.
6. **Reaction & ReactionAggregate**: برای لایک‌ها و واکنش‌های کاربران.
7. **Media & PostMedia**: برای تصاویر شاخص (Cover)، تصاویر OG و فایل‌های ضمیمه درون محتوا.
8. **Revision**: برای ذخیره تاریخچه ویرایش‌های یک پست.

پس از اضافه کردن مدل‌ها به `schema.prisma` خود، دستورات زیر را برای اعمال تغییرات در دیتابیس جدید اجرا کنید:
```bash
npx prisma migrate dev --name add_vlog_models
npx prisma generate
```

---

## ۲. پوشه‌ها و فایل‌های کد (Source Code)

پروژه Playnest از معماری ماژولار مبتنی بر لایه‌های Route، Controller، Repository و Validator استفاده می‌کند. برای انتقال بخش ولاگ، باید پوشه‌های زیر را از مسیر `src/modules/` به پروژه مقصد خود کپی کنید:

1. **`src/modules/posts/`**: شامل مدیریت پست‌ها، تاریخچه ویرایش و سری‌ها.
2. **`src/modules/taxonomy/`**: شامل مدیریت دسته‌بندی‌ها (Categories) و تگ‌ها (Tags).
3. **`src/modules/comments/`**: شامل مدیریت کامنت‌ها، تایید یا رد کامنت‌ها و پاسخ به آن‌ها.
4. **`src/modules/reactions/`**: شامل سیستم لایک و اموجی‌ها روی پست‌ها و کامنت‌ها.
5. **`src/modules/media/`**: (یا بخش آپلود فایل خودتان) جهت ذخیره تصاویر و ویدیوهای ولاگ.

---

## ۳. نیازمندی‌ها و وابستگی‌های پکیج‌ها (Dependencies)

ولاگ Playnest از ابزارها و پکیج‌های خاصی برای امنیت و اعتبارسنجی استفاده می‌کند. مطمئن شوید پکیج‌های زیر را در پروژه مقصد نصب کرده‌اید:

```bash
# نصب پکیج‌های اصلی مورد نیاز
npm install zod xss http-status express prisma @prisma/client

# نصب پکیج‌های تایپ در صورت استفاده از TypeScript
npm install --save-dev @types/express @types/node
```

* **Zod**: برای اعتبارسنجی داده‌های ورودی (Request Validation).
* **XSS**: برای پاکسازی کدهای HTML ورودی (Sanitization) تا جلوی حملات تزریق اسکریپت از طریق ادیتور متن (مثل CKEditor) گرفته شود.
* **http-status**: برای کدهای وضعیت HTTP استاندارد.

---

## ۴. کامپوننت‌های مشترک و میدلورها (Shared Components)

سیستم ولاگ به برخی فایل‌های عمومی پروژه متکی است که در صورت نیاز باید آن‌ها را نیز منتقل یا با سیستم خود جایگزین کنید:

1. **مدیریت خطا (`AppError`)**: در فایل `src/common/errors/AppError.ts`. اگر پروژه مقصد سیستم هندلینگ خطای خود را دارد، می‌توانید پرتاب خطاها (Throwing Errors) را به ساختار پروژه جدید تغییر دهید.
2. **احراز هویت و سطوح دسترسی (`authMiddleware` و `requireRole`)**: برای پست گذاشتن نیاز به نقش‌های ادمین/نویسنده است. شما باید میدلورهای احراز هویت پروژه خودتان را جایگزین کنید.
3. **موتور رویدادها (`eventEmitter`)**: در فایل `src/common/events/event-emitter.ts` برای کارهایی مثل پردازش پس‌زمینه تصاویر یا نوتیفیکیشن‌ها استفاده می‌شود.

---

## ۵. اتصال مسیرها (Routing)

در نهایت، باید روت‌های ولاگ را در فایل اصلی روتینگ پروژه جدید (مانند `routes/index.ts` یا `app.ts`) ثبت کنید. نمونه ثبت روت‌ها در Express به شکل زیر است:

```typescript
import { Router } from 'express';
import { postsRouter } from './modules/posts/posts.routes';
import { taxonomyRouter } from './modules/taxonomy/taxonomy.routes';
import { commentsRouter } from './modules/comments/comments.routes';
import { reactionsRouter } from './modules/reactions/reactions.routes';

const router = Router();

// تعریف پیش‌وندهای مسیر ولاگ
router.use('/posts', postsRouter);
router.use('/taxonomy', taxonomyRouter);
router.use('/comments', commentsRouter);
router.use('/reactions', reactionsRouter);

export default router;
```

---

## خلاصه فرآیند انتقال سریع:
1. **بررسی دیتابیس**: کپی مدل‌های مربوطه از `prisma/blog.schema.prisma` به فایل `schema.prisma` مقصد و اجرای مایگریشن.
2. **کپی ماژول‌ها**: انتقال پوشه‌های `posts`، `taxonomy`، `comments` و `reactions` از `src/modules/` به پروژه جدید.
3. **نصب پکیج‌ها**: اجرای دستور `npm install zod xss`.
4. **تنظیم میدلورها**: جایگزین کردن میدلور احراز هویت و بررسی توکن پروژه جدید در فایل‌های `.routes.ts` هر ماژول.
5. **تست عملکرد**: ساخت یک دسته‌بندی جدید، ایجاد پست در آن دسته‌بندی و ارسال کامنت برای تست نهایی کل چرخه.
