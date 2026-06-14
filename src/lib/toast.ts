import { toast } from "sonner";

export const toastSuccess = (message: string) => toast.success(message);
export const toastError = (message: string) => toast.error(message);
export const toastLoading = (message: string) => toast.loading(message);
export const toastDismiss = (id?: string | number) => toast.dismiss(id);
