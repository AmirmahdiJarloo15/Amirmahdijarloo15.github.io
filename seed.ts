// داده‌ی اولیه: حساب مالک + دسته‌بندی‌ها و چند محصول نمونه
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = (process.env.OWNER_EMAIL || "owner@example.com").toLowerCase();
  const password = process.env.OWNER_PASSWORD || "ChangeThisPassword123";
  await db.user.upsert({
    where: { email }, update: {},
    create: { name: "مالک سایت", email, password: await bcrypt.hash(password, 10), role: "OWNER" },
  });

  const names = ["پارچه مجلسی", "پارچه نخی", "پارچه مانتویی", "پارچه سنتی", "پارچه پرده‌ای", "پارچه طرح‌دار"];
  for (const name of names) await db.category.upsert({ where: { name }, update: {}, create: { name } });

  if ((await db.product.count()) === 0) {
    const cat = async (n: string) => (await db.category.findUnique({ where: { name: n } }))!.id;
    await db.product.createMany({ data: [
      { name: "پارچه ابریشم طبیعی", type: "ابریشم طبیعی", price: 480000, discount: 20, stock: 25, categoryId: await cat("پارچه مجلسی") },
      { name: "پارچه مخمل اعلا", type: "مخمل", price: 350000, discount: 10, stock: 25, categoryId: await cat("پارچه مجلسی") },
      { name: "پارچه بروکاد ایرانی", type: "بروکاد", price: 270000, discount: 0, stock: 25, categoryId: await cat("پارچه سنتی") },
      { name: "پارچه حریر چاپی", type: "حریر", price: 220000, discount: 15, stock: 25, categoryId: await cat("پارچه طرح‌دار") },
    ] });
  }
  console.log("Seed انجام شد. مالک:", email);
}
main().finally(() => db.$disconnect());
