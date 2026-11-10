import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">Página no encontrada</h2>
      <p className="text-xs text-muted-foreground">La página que buscas no existe o ha sido movida.</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
