import { useDocument } from '../../hooks/use-document';

export const Header = () => {
  const { isSaving } = useDocument();

  const renderSaveStatus = () => (
    <span className="text-sm text-muted-foreground">
      {isSaving ? 'Auto-saving...' : 'Saved Successfully...'}
    </span>
  );

  return (
    <header className="flex h-14 items-center border-b border-muted px-4 lg:px-6 bg-background">
      <div className="flex items-center gap-2">Document Editor</div>
      <div className="ml-auto flex items-center gap-2">
        {renderSaveStatus()}
      </div>
    </header>
  );
};
