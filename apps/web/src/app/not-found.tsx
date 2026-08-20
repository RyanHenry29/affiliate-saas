'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, LayoutDashboard, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-6">
          <span className="font-mono text-6xl font-bold text-primary">404</span>
        </div>

        <h1 className="text-xl font-bold text-foreground mb-2">
          Página não encontrada
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          O endereço que você procurou não existe ou foi movido.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link href="/">
              <Home className="h-4 w-4" />
              Voltar ao início
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Ir para o dashboard
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Se acredita que isso é um erro,{' '}
            <Link href="/contato" className="text-primary hover:underline">
              entre em contato
            </Link>
            {' '}ou verifique o{' '}
            <Link href="/status" className="text-primary hover:underline">
              status do sistema
            </Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
