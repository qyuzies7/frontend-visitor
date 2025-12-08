import React, { Component } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { loadTokenFromStorage } from "../api";

export { default as AdminLogin } from "./AdminLogin";
export { default as Dashboard } from "./Dashboard";
export { default as VerifikasiPersetujuan } from "./VerifikasiPersetujuan";
export { default as KartuVisitor } from "./KartuVisitor";
export { default as RiwayatPengembalian } from "./RiwayatPengembalian";

loadTokenFromStorage();

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });

  }

  handleRetry() {
    this.setState({ hasError: false, error: null, info: null });
  }

  render() {
    if (this.state.hasError) {
      const outerStyle = {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7fb",
        padding: 24,
      };
      const cardStyle = {
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 12,
        padding: "20px 24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        maxWidth: 520,
        width: "100%",
        fontFamily: "Poppins, sans-serif",
        color: "#474646",
      };
      const titleStyle = { margin: "0 0 10px", fontWeight: 700, fontSize: 20 };
      const descStyle = { fontSize: 14, marginBottom: 16 };
      const btnStyle = {
        padding: "10px 14px",
        borderRadius: 8,
        border: "none",
        color: "#fff",
        cursor: "pointer",
        background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)",
        fontWeight: 600,
      };

      return React.createElement(
        "div",
        { style: outerStyle },
        React.createElement(
          "div",
          { style: cardStyle },
          React.createElement("h3", { style: titleStyle }, "Terjadi kesalahan saat memuat halaman"),
          React.createElement(
            "div",
            { style: descStyle },
            this.state.error && this.state.error.message
              ? this.state.error.message
              : "Error tidak diketahui."
          ),
          React.createElement(
            "button",
            { onClick: this.handleRetry, style: btnStyle },
            "Coba Lagi"
          )
        )
      );
    }
    return this.props.children;
  }
}

export function withBoundary(ComponentToWrap) {
  return function WrappedWithBoundary(props) {
    const location = useLocation();
    return React.createElement(
      ErrorBoundary,
      { key: location.key },
      React.createElement(ComponentToWrap, { ...props })
    );
  };
}

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return React.createElement(Navigate, { to: "/admin", replace: true });
  }
  return React.createElement(React.Fragment, null, children);
}
