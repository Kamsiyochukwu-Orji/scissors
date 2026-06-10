import React from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚠️</span>
                <h1 className="text-2xl font-bold text-gray-900">
                  Oops! Something went wrong
                </h1>
              </div>

              <p className="text-gray-600 mb-4">
                We encountered an unexpected error. Don't worry, our team has
                been notified.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-mono text-gray-700 overflow-auto max-h-32">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Go Home
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                If the problem persists, please refresh the page or contact
                support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
