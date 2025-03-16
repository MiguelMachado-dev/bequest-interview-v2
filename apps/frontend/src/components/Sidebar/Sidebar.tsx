import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../AlertDialog/AlertDialog';
import { useClauses } from '../../hooks/use-clauses';
import { CLAUSES } from '../../utils/constants';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { useState } from 'react';
import { useDocument } from '../../hooks/use-document';

export const Sidebar = () => {
  const { document, save } = useDocument();
  const { clauses, addClause, removeClause } = useClauses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClause, setSelectedClause] = useState<string | null>(null);
  const [removingClauseId, setRemovingClauseId] = useState<string | null>(null);

  const handleAddClause = (clause: any) => {
    addClause({ ...clause, added: false });

    setSearchTerm('');
  };

  const handleRemoveClause = (id: string) => {
    setSelectedClause(id);
  };

  const confirmRemoveClause = () => {
    if (selectedClause && document) {
      setRemovingClauseId(selectedClause);

      if (window.removeClauseFromDocument) {
        try {
          window.removeClauseFromDocument(selectedClause);
        } catch (error) {
          console.error('Error removing clause:', error);
          removeClause(selectedClause);

          save({
            ...document,
            clauses: clauses
              .filter((c) => c.id !== selectedClause)
              .map((c) => c.id)
              .join(','),
          });
        }
      } else {
        removeClause(selectedClause);

        save({
          ...document,
          clauses: clauses
            .filter((c) => c.id !== selectedClause)
            .map((c) => c.id)
            .join(','),
        });
      }

      setSelectedClause(null);

      setTimeout(() => {
        setRemovingClauseId(null);
      }, 1000);
    }
  };

  return (
    <Card className="hidden w-72 flex-shrink-0 border-l border-t-0 md:block bg-background text-foreground">
      <div className="p-4 border-b border-muted">
        <div className="flex items-center justify-between ">
          <h3 className="font-medium text-foreground">Clauses</h3>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Add Clause</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background text-foreground border-muted">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  Add New Clause
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Choose a clause to add to your document
                </AlertDialogDescription>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search clauses..."
                    className="w-full rounded-md border border-muted bg-background text-foreground px-3 py-2 text-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                  />
                </div>

                <div className="space-y-4 mt-4 max-h-60 overflow-auto">
                  {CLAUSES.filter((clause) =>
                    clauses.find((c) => c.id === clause.id) ? false : true
                  )
                    .filter((clause) =>
                      clause.name
                        .toLocaleLowerCase()
                        .includes(searchTerm.toLocaleLowerCase())
                    )
                    .map((clause) => (
                      <div
                        key={clause.id}
                        className="flex items-center justify-between border border-muted p-2 px-4 rounded-lg bg-muted/20"
                      >
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {clause.name}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {clause.initial}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleAddClause(clause)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="h-[calc(100vh-14rem)] overflow-auto">
        <div className="space-y-4 p-4">
          <div className="space-y-3">
            <div className="space-y-3">
              {clauses.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No clauses added yet. Click "Add Clause" to get started.
                </div>
              ) : (
                clauses.map((clause) => (
                  <div
                    className={`flex items-center justify-between border border-muted rounded-lg p-3 ${
                      removingClauseId === clause.id
                        ? 'opacity-50 bg-red-900/20'
                        : 'bg-muted/20'
                    }`}
                    key={clause.id}
                  >
                    <div>
                      <p className="text-sm font-medium leading-none text-foreground">
                        {clause.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {clause.initial}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            clause.added
                              ? 'bg-green-900/30 text-green-300'
                              : 'bg-yellow-900/30 text-yellow-300'
                          }`}
                        >
                          {clause.added ? 'Added' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <AlertDialog open={selectedClause === clause.id}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveClause(clause.id)}
                          disabled={removingClauseId !== null}
                        >
                          {removingClauseId === clause.id
                            ? 'Removing...'
                            : 'Remove'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Clause</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove the "{clause.name}"
                            clause? This will delete it from your document.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setSelectedClause(null)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <Button
                            variant="destructive"
                            onClick={confirmRemoveClause}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            Remove
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

declare global {
  interface Window {
    removeClauseFromDocument?: (clauseId: string) => void;
  }
}
