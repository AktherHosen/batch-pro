import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>404 — Page not found</CardTitle>
          <CardDescription>
            The page you are looking for doesn’t exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Try returning to the dashboard or check the URL.
          </p>
          <Button asChild>
            <Link to="/">Go back home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
