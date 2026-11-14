import type { Role } from "@prisma/client";
import { ZodError } from "zod";
import { currentUser } from "./auth";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** کاربر واردشده را برمی‌گرداند؛ در صورت نبودن نقش لازم، خطای ۴۰۱/۴۰۳ می‌دهد */
export async function requireUser(roles?: Role[]) {
  const u = await currentUser();
  if (!u) throw new HttpError(401, "ابتدا وارد شوید");
  if (roles && !roles.includes(u.role)) throw new HttpError(403, "دسترسی ندارید");
  return u;
}
export const STAFF: Role[] = ["ADMIN", "OWNER"];
export const isStaff = (r: Role) => r === "ADMIN" || r === "OWNER";

/** پوشش یکسان برای مدیریت خطاها در همه‌ی API ها */
export function handle(fn: (req: Request, ctx: any) => Promise<Response>) {
  return async (req: Request, ctx: any) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError) return Response.json({ error: "اطلاعات واردشده نامعتبر است" }, { status: 400 });
      console.error(e);
      return Response.json({ error: "خطای سرور" }, { status: 500 });
    }
  };
}
export const pubUser = (u: { id: number; name: string; email: string; role: string }) =>
  ({ id: u.id, name: u.name, email: u.email, role: u.role });
