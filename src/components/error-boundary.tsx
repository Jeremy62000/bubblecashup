import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render / lazy-import errors and shows a friendly retry screen
 * instead of letting the whole app go blank.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the dev console informative without crashing the app.
    console.error("Bubble Up — render error:", error, info);
  }

  private retry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            color: "#fff",
            background:
              "radial-gradient(1200px 700px at 50% -10%, #4c1d95 0%, #2e1065 45%, #19063a 100%)",
          }}
        >
          <div
            style={{
              fontSize: 44,
              lineHeight: 1,
              filter: "drop-shadow(0 6px 18px rgba(34,211,238,0.5))",
            }}
          >
            🫧
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: "-0.01em",
            }}
          >
            Oups, une bulle a éclaté !
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", maxWidth: 320 }}>
            Un petit souci technique est survenu. Réessaie — ta progression est
            bien sauvegardée.
          </p>
          <button
            type="button"
            onClick={this.retry}
            style={{
              marginTop: "0.5rem",
              border: "none",
              cursor: "pointer",
              borderRadius: 999,
              padding: "0.75rem 1.75rem",
              fontSize: 14,
              fontWeight: 800,
              color: "#22103f",
              background:
                "linear-gradient(90deg, #fde047 0%, #fb923c 55%, #f472b6 100%)",
              boxShadow: "0 10px 30px -6px rgba(251,146,60,0.55)",
            }}
          >
            Réessayer
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
