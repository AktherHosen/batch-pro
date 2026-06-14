import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="p-6">
          <Card className="rounded-3xl border border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle>Error loading this page</CardTitle>
              <CardDescription>
                Something went wrong while rendering the current section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-destructive">
                {this.state.error?.message ?? "An unexpected error occurred."}
              </p>
              <Button variant="destructive" onClick={this.handleReset}>
                Reload page
              </Button>
            </CardContent>
          </Card>
        </main>
      );
    }

    return this.props.children;
  }
}
