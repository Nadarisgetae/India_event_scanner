import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components';
import { ArrowLeft, Home, Search, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card variant="default" padding="lg" className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 mx-auto text-bucket-danger/50 mb-4" />
        <CardHeader>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>The page you're looking for doesn't exist or has been moved.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-text-muted">
            <p>Possible reasons:</p>
            <ul className="list-disc list-inside text-left mt-2 space-y-1">
              <li>Typo in the URL</li>
              <li>Page was moved or deleted</li>
              <li>Following an outdated link</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
            </Button>
            <Button onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-1" /> Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}