"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  showHomeButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-destructive/20 bg-destructive/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <CardTitle className="text-xl text-foreground">
                {this.props.fallbackTitle || "Something went wrong"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {this.props.fallbackDescription ||
                  "An unexpected error occurred. Please try again or return to the homepage."}
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="mt-2 text-xs text-left bg-muted p-3 rounded-lg overflow-auto max-h-32 text-destructive">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button onClick={this.handleRetry} variant="outline" className="gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Try Again
                </Button>
                {this.props.showHomeButton !== false && (
                  <Button asChild className="gap-2">
                    <Link href="/">
                      <Home className="h-4 w-4" />
                      Go Home
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
