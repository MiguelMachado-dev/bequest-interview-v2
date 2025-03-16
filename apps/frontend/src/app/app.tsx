import { Sidebar } from '../components/Sidebar/Sidebar';
import { Header } from '../components/Header/Header';
import { ClausesProvider } from '../hooks/use-clauses';
import { DocumentProvider } from '../hooks/use-document';
import { DocumentEditor } from './DocumentEditor';
import { useEffect, useState } from 'react';
import { ErrorDisplay } from '../components/ConnectionError/ConnectionError';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3000/api');

        if (!response.ok) {
          throw new Error('API server is not responding correctly');
        }

        setError(null);
      } catch (err) {
        setError(
          'Could not connect to the API server. Please ensure it is running.'
        );
        console.error('API Connection Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkApiConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading application...</h2>
          <p className="mt-2 text-muted-foreground">
            Please wait while we initialize the document editor
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <DocumentProvider>
      <ClausesProvider>
        <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
          <Header />

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <DocumentEditor />
            </div>

            <Sidebar />
          </div>
        </div>
      </ClausesProvider>
    </DocumentProvider>
  );
}
