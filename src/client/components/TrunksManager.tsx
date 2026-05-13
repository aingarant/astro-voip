import { useLcrGateways } from '../api';
import { AppProviders } from './providers/AppProviders';
import { ErrorAlert, SpinnerBlock } from './ui/AsyncState';

type Gateway = { id: number; gwName: string; ipAddr: string; port: number; strip: number; prefix: string };

export function TrunksManager() {
  return (
    <AppProviders>
      <TrunksManagerInner />
    </AppProviders>
  );
}

function TrunksManagerInner() {
  const { data, isLoading, isError, error, refetch } = useLcrGateways();
  const gateways = data?.gateways ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">SIP Trunks</h2>
      <p className="text-sm text-base-content/70">Using LCR gateways as trunk inventory from the backend.</p>
      {isError ? <ErrorAlert message={(error as Error).message} onRetry={refetch} /> : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <SpinnerBlock label="Loading gateways..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Endpoint</th>
                    <th>Prefix</th>
                    <th>Strip</th>
                  </tr>
                </thead>
                <tbody>
                  {gateways.map((gateway: Gateway) => (
                    <tr key={gateway.id}>
                      <td>{gateway.gwName}</td>
                      <td>
                        {gateway.ipAddr}:{gateway.port}
                      </td>
                      <td>{gateway.prefix || '-'}</td>
                      <td>{gateway.strip ?? 0}</td>
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
