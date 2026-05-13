import { useSubscribers } from '../api';
import { AppProviders } from './providers/AppProviders';
import { ErrorAlert, SpinnerBlock } from './ui/AsyncState';

type SubscriberUser = { id: number; username: string; domain: string; extensionId: string; accountId: number };

export function UsersManager() {
  return (
    <AppProviders>
      <UsersManagerInner />
    </AppProviders>
  );
}

function UsersManagerInner() {
  const { data, isLoading, isError, error, refetch } = useSubscribers();
  const users = data?.subscribers ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Portal Users</h2>
      <p className="text-sm text-base-content/70">
        Backend user-management endpoints are not available yet. Showing subscriber identities as current authenticated principals.
      </p>
      {isError ? <ErrorAlert message={(error as Error).message} onRetry={refetch} /> : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <SpinnerBlock label="Loading users..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Domain</th>
                    <th>Extension</th>
                    <th>Account</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: SubscriberUser) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.domain}</td>
                      <td>{user.extensionId}</td>
                      <td>{user.accountId}</td>
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
