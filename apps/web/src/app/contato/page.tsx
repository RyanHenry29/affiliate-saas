'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContatoPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-foreground">Contato</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Precisa de ajuda ou quer falar com a gente? Envie uma mensagem ou use
          os canais abaixo.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <a
              href="mailto:suporte@affiliateos.com.br"
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
            >
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">E-mail</p>
                <p className="text-sm text-muted-foreground">
                  suporte@affiliateos.com.br
                </p>
              </div>
            </a>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Status do sistema
                </p>
                <p className="text-sm text-muted-foreground">
                  Veja em{' '}
                  <Link href="/status" className="text-primary hover:underline">
                    /status
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-foreground">
                  Mensagem recebida!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Para resposta, use o e-mail informado acima.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Nome</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">E-mail</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="voce@email.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Mensagem</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    placeholder="Como podemos ajudar?"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Enviar mensagem
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
