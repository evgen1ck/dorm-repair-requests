import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "@/app/layout/app-layout";
import { NotFoundPage } from "@/app/not-found";
import { LoginPage } from "@/features/auth/login-page";
import { LOGIN_PATH } from "@/features/auth/paths";
import { RequireAuth } from "@/features/auth/require-auth";
import { RequireRole } from "@/features/auth/require-role";
import { HOME_PATH } from "@/features/auth/roles";
import { RequestsPage } from "@/features/requests/pages/requests-page";
import { NewRequestPage } from "@/features/requests/pages/new-request-page";
import { RequestPage } from "@/features/requests/pages/request-page";
import { ReportPage } from "@/features/reports/pages/report-page";
import { EditUserPage } from "@/features/users/pages/edit-user-page";
import { NewUserPage } from "@/features/users/pages/new-user-page";
import { UsersPage } from "@/features/users/pages/users-page";
import { ADMIN_ROLES, REPORT_ROLES } from "./navigation";

export function AppRoutes() {
  return (
    <Routes>
      <Route path={LOGIN_PATH} element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={HOME_PATH} replace />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route element={<RequireRole roles={["resident"]} />}>
            <Route path="/requests/new" element={<NewRequestPage />} />
          </Route>
          <Route path="/requests/:requestId" element={<RequestPage />} />
          <Route element={<RequireRole roles={REPORT_ROLES} />}>
            <Route path="/reports" element={<ReportPage />} />
          </Route>
          <Route element={<RequireRole roles={ADMIN_ROLES} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/new" element={<NewUserPage />} />
            <Route path="/users/:userId" element={<EditUserPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
