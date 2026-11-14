import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { handle, HttpError, pubUser } from "@/lib/guard";

const schema = z.object({ name: z.string().trim().min(2).max(60), email: z.string().trim().toLowerCase().email(), password: z.string().min(6).max(100) });

export const POST = handle(async (req) => {
  const d = schema.parse(await req.json());
  if (await db.user.findUnique({ where: { email: d.email } })) throw new HttpError(409, "این ایمیل قبلاً ثبت شده است");
  // ثبت‌نام عمومی همیشه نقش «کاربر عادی» می‌سازد
  const user = await db.user.create({ data: { name: d.name, email: d.email, password: await bcrypt.hash(d.password, 10), role: "USER" } });
  await createSession(user.id);
  return Response.json(pubUser(user));
});
