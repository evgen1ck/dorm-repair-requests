import { useState } from "react";
import type { RepairRequestResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { DetailField, DetailList } from "@/components/shared/detail-field";
import { Person, PhoneLink } from "@/components/shared/person";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { AssignMasterForm } from "./assign-master-form";
import { Deadline } from "./deadline";

export function AssignmentSection({
  request,
  canAssign,
}: {
  request: RepairRequestResponse;
  canAssign: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const assignment = request.active_assignment;
  const assignable = canAssign && request.status !== "done";

  if (editing || (assignable && !assignment)) {
    return (
      <AssignMasterForm
        requestId={request.id}
        current={assignment}
        onDone={() => setEditing(false)}
        onCancel={assignment ? () => setEditing(false) : undefined}
      />
    );
  }

  if (!assignment) {
    return <p className="text-muted-foreground">Мастер пока не назначен.</p>;
  }

  return (
    <div className="space-y-5">
      <DetailList>
        <DetailField label="Мастер" className="col-span-2">
          <Person
            name={assignment.master.full_name}
            detail={assignment.master.phone ? <PhoneLink phone={assignment.master.phone} /> : null}
          />
        </DetailField>
        <DetailField label="Срок">
          <Deadline request={request} />
        </DetailField>
        <DetailField label="Назначил">
          <Person
            name={assignment.dispatcher.full_name}
            detail={formatDateTime(assignment.created_at)}
          />
        </DetailField>
      </DetailList>
      {assignable && (
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Переназначить
        </Button>
      )}
    </div>
  );
}
