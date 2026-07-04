import { create } from "zustand";

type ClosedModal = { kind: "none" };

type DepositWithdrawModal = {
  kind: "deposit-withdraw";
  mode: "deposit" | "withdraw";
};

type ConfirmModal = {
  kind: "confirm";
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
};

type SubmitObservationModal = { kind: "submit-observation" };

type CreateUserModal = { kind: "create-user" };

type CreateCropModal = { kind: "create-crop" };

type ApproveObservationModal = {
  kind: "approve-observation";
  id: string;
  observedPrice: number;
};

type ModalState =
  | ClosedModal
  | DepositWithdrawModal
  | ConfirmModal
  | SubmitObservationModal
  | CreateUserModal
  | CreateCropModal
  | ApproveObservationModal;

interface ModalStore {
  modal: ModalState;
  openDepositModal: (mode: "deposit" | "withdraw") => void;
  openConfirmModal: (props: Omit<ConfirmModal, "kind">) => void;
  openSubmitObservationModal: () => void;
  openCreateUserModal: () => void;
  openCreateCropModal: () => void;
  openApproveObservationModal: (id: string, observedPrice: number) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>()((set) => ({
  modal: { kind: "none" },
  openDepositModal: (mode) => set({ modal: { kind: "deposit-withdraw", mode } }),
  openConfirmModal: (props) => set({ modal: { kind: "confirm", ...props } }),
  openSubmitObservationModal: () => set({ modal: { kind: "submit-observation" } }),
  openCreateUserModal: () => set({ modal: { kind: "create-user" } }),
  openCreateCropModal: () => set({ modal: { kind: "create-crop" } }),
  openApproveObservationModal: (id, observedPrice) =>
    set({ modal: { kind: "approve-observation", id, observedPrice } }),
  closeModal: () => set({ modal: { kind: "none" } }),
}));
