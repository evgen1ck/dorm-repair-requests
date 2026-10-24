import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { HttpStatus, getErrorMessage, isApiError } from "@/api/client";
import { BackLink } from "@/components/shared/back-link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { ROLE_LABELS } from "@/features/auth/roles";
import { EditUserForm } from "../components/user-form";
import { useUser } from "../queries";

const backLink = <BackLink to="/users">К пользователям</BackLink>;

export function EditUserPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const userId = Number(useParams().userId);
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <Skeleton className="h-64 w-full max-w-md" />;

  if (!user) {
    const loadFailed = error && !isApiError(error, HttpStatus.NOT_FOUND);
    return (
      <EmptyState
        title={loadFailed ? "Не удалось загрузить пользователя" : "Пользователь не найден"}
        description={loadFailed ? getErrorMessage(error) : undefined}
        action={backLink}
      />
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={user.full_name}
        description={`${ROLE_LABELS[user.role]} · ${user.login}`}
        backLink={backLink}
      />
      <EditUserForm
        key={user.id}
        user={user}
        isSelf={user.id === currentUser.id}
        onSaved={(saved) => {
          toast.success(`Изменения для ${saved.full_name} сохранены`);
          navigate("/users");
        }}
      />
    </div>
  );
}
