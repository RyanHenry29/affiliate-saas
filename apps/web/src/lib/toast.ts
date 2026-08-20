import { toast } from "sonner";

export function toastError(err: unknown, fallback = "Algo deu errado") {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : fallback;
  toast.error(msg);
}

export function toastSuccess(msg: string) {
  toast.success(msg);
}