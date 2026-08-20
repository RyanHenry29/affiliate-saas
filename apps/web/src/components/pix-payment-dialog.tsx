"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PixPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amountCents: number;
  plan?: string;
  title?: string;
  onPaid?: () => void;
}

type PixState =
  | { status: "loading" }
  | { status: "ready"; qrCodeUrl: string | null; copiaECola: string | null; paymentId: string; external: boolean }
  | { status: "paid"; paymentId: string }
  | { status: "error"; message: string };

async function renderQr(data: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(data, {
    width: 200,
    margin: 1,
    color: { dark: "#0B0D10", light: "#FFFFFF" },
  });
}

export function PixPaymentDialog({
  open,
  onOpenChange,
  amountCents,
  plan,
  title = "Pagamento via PIX",
  onPaid,
}: PixPaymentDialogProps) {
  const [state, setState] = useState<PixState>({ status: "loading" });
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startPayment() {
    setState({ status: "loading" });
    try {
      const res = await api.payments.pix({
        amount: amountCents,
        description: title,
        plan,
      });
      const pix = res.pix;
      if (!pix) {
        setState({
          status: "error",
          message:
            "Não foi possível gerar o PIX agora. Tente novamente mais tarde.",
        });
        return;
      }

      let qrCodeUrl: string | null = null;
      let copiaECola: string | null = null;

      if (pix.qr_code_base64) {
        qrCodeUrl = `data:image/png;base64,${pix.qr_code_base64}`;
      }
      if (pix.qr_code) copiaECola = pix.qr_code;

      if (!qrCodeUrl && !copiaECola) {
        setState({
          status: "error",
          message:
            "Nenhum QR configurado. Peça ao administrador para configurar o PIX.",
        });
        return;
      }

      if (!qrCodeUrl && copiaECola) {
        qrCodeUrl = await renderQr(copiaECola);
      }

      setState({
        status: "ready",
        qrCodeUrl,
        copiaECola,
        paymentId: res.paymentId,
        external: res.external,
      });

      pollRef.current = setInterval(async () => {
        try {
          const p = await api.payments.get(res.paymentId);
          if (p.status === "CONFIRMED" || p.status === "PAID") {
            if (pollRef.current) clearInterval(pollRef.current);
            setState({ status: "paid", paymentId: res.paymentId });
            onPaid?.();
          }
        } catch {
          // aguarda próximo poll
        }
      }, 4000);
    } catch (err: any) {
      setState({
        status: "error",
        message: err?.message ?? "Erro ao gerar o PIX.",
      });
    }
  }

  useEffect(() => {
    if (open) void startPayment();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const amount = (amountCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  async function copyCopiaECola() {
    const copiaECola =
      state.status === "ready" ? state.copiaECola : null;
    if (!copiaECola) return;
    try {
      await navigator.clipboard.writeText(copiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Código PIX copiado");
    } catch {
      toast.error("Não foi possível copiar o código");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Pague {amount} via PIX para ativar o plano. O pagamento é confirmado
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {state.status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Gerando código PIX...
              </p>
            </div>
          )}

          {state.status === "ready" && state.qrCodeUrl && (
            <>
              <img
                src={state.qrCodeUrl}
                alt="QR Code de pagamento PIX"
                width={200}
                height={200}
                className="rounded-lg border border-border bg-white p-2"
              />
              <p className="text-sm font-semibold text-foreground">
                Escaneie o QR Code ou use o copia-e-cola abaixo
              </p>
              {state.copiaECola && (
                <div className="w-full">
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground break-all font-mono line-clamp-3">
                      {state.copiaECola}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={copyCopiaECola}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copiado!" : "Copiar copia-e-cola"}
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Aguardando confirmação do pagamento... a tela atualiza
                automaticamente.
              </p>
            </>
          )}

          {state.status === "paid" && (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                <Check className="h-7 w-7" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                Pagamento confirmado!
              </p>
              <p className="text-sm text-muted-foreground">
                Seu plano já foi atualizado.
              </p>
              <Button className="mt-2" onClick={() => onOpenChange(false)}>
                Concluir
              </Button>
            </div>
          )}

          {state.status === "error" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-destructive">{state.message}</p>
              <Button variant="outline" onClick={startPayment}>
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}