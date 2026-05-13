import { useDomains } from '../api';
import { AppProviders } from './providers/AppProviders';
import { ErrorAlert, SpinnerBlock } from './ui/AsyncState';

type DomainRow = { id: number; domain: string; isActive: number; createDate?: string };

export function ServersManager() {
  return (
    <AppProviders>
      <ServersManagerInner />
    </AppProviders>
  );
}

function ServersManagerInner() {
  const { data, isLoading, isError, error, refetch } = useDomains();
  const rows = data?.domains ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Infrastructure Domains</h2>
      <p className="text-sm text-base-content/70">
        Backend currently exposes domain-level infrastructure data. Node-level telemetry can be added once dedicated APIs are available.
      </p>
      {isError ? <ErrorAlert message={(error as Error).message} onRetry={refetch} /> : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <SpinnerBlock label="Loading domains..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Domain</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: DomainRow) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.domain}</td>
                      <td>
                        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-error'}`}>
                          {row.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{row.createDate ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
