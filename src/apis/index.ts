import { Router } from "express";
import { authRouter } from "./auth";
import { usersRouter } from "./users";
import { employeesRouter } from "./employees";
import { servicesRouter } from "./services";
import { appointmentsRouter } from "./appointments";
import { notificationsRouter } from "./notifications";
import { billsRouter } from "./bills";
import { expensesRouter } from "./expenses";
import { uploadsRouter } from "./uploads";
import { requireAuth, requireRole } from "./middleware";

export const apiRouter = Router();

// Login is public; /auth/me checks the token itself.
apiRouter.use("/auth", authRouter);

// Listing staff/employees is open to any signed-in user (billing needs to
// assign them to line items); creating/editing/deleting is manager-only,
// enforced inside each router itself. Outgoing money stays fully manager-only.
apiRouter.use("/users", requireAuth, usersRouter);
apiRouter.use("/employees", requireAuth, employeesRouter);
apiRouter.use("/expenses", requireAuth, requireRole("manager"), expensesRouter);

// Day-to-day operations any signed-in staff member needs.
apiRouter.use("/services", requireAuth, servicesRouter);
apiRouter.use("/appointments", requireAuth, appointmentsRouter);
apiRouter.use("/notifications", requireAuth, notificationsRouter);
apiRouter.use("/bills", requireAuth, billsRouter);
apiRouter.use("/uploads", requireAuth, uploadsRouter);
