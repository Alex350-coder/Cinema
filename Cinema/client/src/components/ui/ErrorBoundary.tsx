import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }

interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
          <div className="text-center max-w-md">
            <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: 'var(--danger)' }} />
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
              Algo salió mal
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Ocurrió un error inesperado. Intenta recargar la página.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={this.handleRetry} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
                <RefreshCw size={16} /> Reintentar
              </button>
              <button onClick={() => window.location.href = '/'} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                Ir al inicio
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>Detalles del error</summary>
                <pre className="mt-2 p-3 rounded-lg text-xs overflow-auto max-h-40" style={{ background: 'var(--bg-elevated)', color: 'var(--danger)' }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
