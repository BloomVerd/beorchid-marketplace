"use client";

import { useModalStore } from "@/stores/modal-store";
import { DepositWithdrawModal } from "./deposit-withdraw-modal";
import { ConfirmModal } from "./confirm-modal";
import { SubmitObservationModal } from "./submit-observation-modal";
import { CreateUserModal } from "./create-user-modal";
import { CreateCropModal } from "./create-crop-modal";
import { ApproveObservationModal } from "./approve-observation-modal";

export function ModalRoot() {
  const modal = useModalStore((s) => s.modal);
  const closeModal = useModalStore((s) => s.closeModal);

  if (modal.kind === "none") return null;

  if (modal.kind === "deposit-withdraw")
    return <DepositWithdrawModal key="dw" mode={modal.mode} onClose={closeModal} />;

  if (modal.kind === "confirm")
    return (
      <ConfirmModal
        key="c"
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        variant={modal.variant}
        onConfirm={modal.onConfirm}
        onClose={closeModal}
      />
    );

  if (modal.kind === "submit-observation")
    return <SubmitObservationModal key="so" onClose={closeModal} />;

  if (modal.kind === "create-user")
    return <CreateUserModal key="cu" onClose={closeModal} />;

  if (modal.kind === "create-crop")
    return <CreateCropModal key="cc" onClose={closeModal} />;

  if (modal.kind === "approve-observation")
    return (
      <ApproveObservationModal
        key="ao"
        id={modal.id}
        observedPrice={modal.observedPrice}
        onClose={closeModal}
      />
    );

  return null;
}
