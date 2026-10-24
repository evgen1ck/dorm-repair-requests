import { useNavigate } from "react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { CreateUserForm } from "../components/user-form";

export function NewUserPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Новый пользователь"
        description="Логин и пароль передайте пользователю лично: восстановления пароля нет."
      />
      <CreateUserForm
        onCreated={(user) => {
          toast.success(`Пользователь ${user.full_name} создан`);
          navigate("/users", { replace: true });
        }}
      />
    </div>
  );
}
