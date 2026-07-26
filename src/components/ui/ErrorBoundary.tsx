import * as React from "react";
import { AlertTriangle, RefreshCw, Home, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    console.error("Uncaught Error Boundary catch:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
  };

  handleCopyTrace = (): void => {
    const trace = `[TrendzHauz Error Report]\nError: ${this.state.error?.name}: ${this.state.error?.message}\n\nStack:\n${this.state.error?.stack || "No stack trace"}\n\nComponent Trace:\n${this.state.errorInfo?.componentStack || "No component stack"}`;
    navigator.clipboard.writeText(trace);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Inline / Section-level Error Boundary fallback
      if (this.props.sectionName) {
        return (
          <div className="w-full p-6 my-4 bg-red-500/10 border border-red-500/30 rounded-lg text-foreground flex flex-col items-center justify-center text-center gap-3">
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Failed to load {this.props.sectionName}</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              {this.state.error?.message || "An unexpected error occurred in this section."}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-brand/90 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Section
            </button>
          </div>
        );
      }

      // Full Global App-Level Error Boundary fallback
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-background text-foreground transition-colors duration-300">
          <div className="max-w-xl w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 bg-brand/10 border border-brand/30 text-brand rounded-full flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Error Header */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand">
                Application Error Guard
              </span>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
                Something Went Wrong
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                An unexpected error occurred while rendering this view. Don't worry, your data is safe.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-3 bg-brand text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-brand/90 transition-all shadow-md active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-200 dark:bg-zinc-900 text-foreground font-bold text-xs uppercase tracking-wider rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-800 transition-all border border-zinc-300 dark:border-zinc-800 active:scale-95"
              >
                <Home className="w-4 h-4" /> Go to Homepage
              </a>
            </div>

            {/* Expandable Developer Diagnostics Section */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900 text-left">
              <button
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                <span>Developer Debug Details</span>
                {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-4 bg-zinc-900 text-zinc-200 rounded-lg text-xs font-mono overflow-x-auto space-y-3 border border-zinc-800 shadow-inner">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <span className="text-brand font-bold uppercase tracking-wider text-[10px]">
                      Stack Trace
                    </span>
                    <button
                      onClick={this.handleCopyTrace}
                      className="inline-flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded transition-colors"
                    >
                      {this.state.copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      <span>{this.state.copied ? "Copied!" : "Copy Trace"}</span>
                    </button>
                  </div>

                  <div>
                    <strong className="text-red-400">{this.state.error?.name}: </strong>
                    <span className="text-zinc-100">{this.state.error?.message}</span>
                  </div>

                  {this.state.error?.stack && (
                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap text-zinc-400 max-h-40 overflow-y-auto pr-2">
                      {this.state.error.stack}
                    </pre>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <div className="pt-2 border-t border-zinc-800">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">
                        Component Stack:
                      </span>
                      <pre className="text-[10px] leading-tight whitespace-pre-wrap text-zinc-500 max-h-24 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
