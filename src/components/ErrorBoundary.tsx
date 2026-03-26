
import React, { Component, ReactNode } from 'react';
import { clear } from 'idb-keyval';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      let message = "Algo deu errado. Por favor, recarregue a página.";
      let isQuotaError = false;

      if (error?.name === 'QuotaExceededError' || 
          error?.message?.toLowerCase().includes('quota') ||
          error?.message?.toLowerCase().includes('storage')) {
        message = "O limite de uso ou armazenamento foi atingido. O aplicativo operará em modo limitado até que o limite seja resetado.";
        isQuotaError = true;
      } else if (error?.message?.includes("Missing or insufficient permissions")) {
        message = "Você não tem permissão para realizar esta ação ou acessar estes dados.";
      } else if (error?.message?.toLowerCase().includes('unavailable') || 
                 error?.message?.toLowerCase().includes('could not reach cloud firestore')) {
        message = "Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou se o domínio está autorizado no Firebase.";
      } else {
        try {
          if (error?.message) {
            const parsed = JSON.parse(error.message);
            if (parsed.error && parsed.error.includes("Missing or insufficient permissions")) {
              message = "Você não tem permissão para realizar esta ação ou acessar estes dados.";
            }
          }
        } catch (e) {
          // Not a JSON error
        }
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
              <i className={`fa-solid ${isQuotaError ? 'fa-database' : 'fa-triangle-exclamation'} text-3xl`}></i>
            </div>
            <h1 className="text-white font-black text-2xl uppercase tracking-tighter">
              {isQuotaError ? 'Memória Cheia' : 'Erro do Sistema'}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-white text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest"
              >
                Recarregar Aplicativo
              </button>
              {isQuotaError && (
                <button 
                  onClick={async () => {
                    localStorage.clear();
                    await clear();
                    window.location.reload();
                  }} 
                  className="w-full bg-red-500/20 text-red-500 font-black py-4 rounded-xl text-xs uppercase tracking-widest border border-red-500/20"
                >
                  Limpar Todo Armazenamento (Reset)
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}
