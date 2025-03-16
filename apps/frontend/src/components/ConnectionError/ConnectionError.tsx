interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-600">Connection Error</h2>
        <p className="mt-2 text-foreground">{error}</p>
        <div className="mt-6 rounded-md bg-muted/20 p-4 text-left">
          <h3 className="font-medium text-foreground">
            Troubleshooting steps:
          </h3>
          <ol className="mt-2 list-decimal pl-5 text-sm text-muted-foreground">
            <li className="mt-1">
              Ensure the backend server is running on port 3000
            </li>
            <li className="mt-1">
              Check that you're running the command:{' '}
              <code className="bg-muted px-1 rounded">nx serve api</code>
            </li>
            <li className="mt-1">
              Verify there are no errors in the terminal running the API server
            </li>
          </ol>
        </div>
        <button
          className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};
