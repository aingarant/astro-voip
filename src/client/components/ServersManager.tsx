import React, { useState } from 'react';

type ServerNode = {
  id: number;
  name: string;
  type: 'Kamailio' | 'FreeSWITCH' | 'RTPEngine' | 'PostgreSQL';
  ipAddress: string;
  region: string;
  status: 'Online' | 'Degraded' | 'Offline';
  cpuUsage: number;
  memUsage: number;
};

const MOCK_SERVERS: ServerNode[] = [
  { id: 1, name: 'kamailio-edge-01', type: 'Kamailio', ipAddress: '10.0.1.10', region: 'us-east', status: 'Online', cpuUsage: 12, memUsage: 45 },
  { id: 2, name: 'kamailio-edge-02', type: 'Kamailio', ipAddress: '10.0.1.11', region: 'us-west', status: 'Online', cpuUsage: 15, memUsage: 42 },
  { id: 3, name: 'fs-media-01', type: 'FreeSWITCH', ipAddress: '10.0.2.20', region: 'us-east', status: 'Degraded', cpuUsage: 85, memUsage: 60 },
  { id: 4, name: 'fs-media-02', type: 'FreeSWITCH', ipAddress: '10.0.2.21', region: 'us-west', status: 'Online', cpuUsage: 30, memUsage: 55 },
  { id: 5, name: 'rtpengine-01', type: 'RTPEngine', ipAddress: '10.0.3.30', region: 'us-east', status: 'Online', cpuUsage: 40, memUsage: 20 },
];

export function ServersManager() {
  const [data] = useState<ServerNode[]>(MOCK_SERVERS);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-success';
      case 'Degraded': return 'bg-warning';
      case 'Offline': return 'bg-error';
      default: return 'bg-base-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Infrastructure Nodes</h2>
        <button className="btn btn-primary">
          Deploy Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {data.map((node) => (
          <div key={node.id} className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="card-title text-lg">{node.name}</h3>
                  <span className="text-sm text-base-content/70">{node.ipAddress} • {node.region}</span>
                </div>
                <div className={`badge ${node.status === 'Online' ? 'badge-success' : node.status === 'Degraded' ? 'badge-warning' : 'badge-error'} gap-1`}>
                  <div className={`w-2 h-2 rounded-full bg-white opacity-70`}></div>
                  {node.status}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Type</span>
                  <span className="badge badge-outline">{node.type}</span>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">CPU</span>
                    <span className="text-xs font-medium">{node.cpuUsage}%</span>
                  </div>
                  <progress className={`progress w-full ${node.cpuUsage > 80 ? 'progress-error' : 'progress-primary'}`} value={node.cpuUsage} max="100"></progress>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">Memory</span>
                    <span className="text-xs font-medium">{node.memUsage}%</span>
                  </div>
                  <progress className={`progress w-full ${node.memUsage > 80 ? 'progress-error' : 'progress-secondary'}`} value={node.memUsage} max="100"></progress>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm btn-ghost">Metrics</button>
                <button className="btn btn-sm btn-outline">Reboot</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
