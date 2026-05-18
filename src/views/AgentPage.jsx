import AgentHeader from '@/components/AgentHeader';
import MaintenanceChecks from '@/components/MaintenanceChecks';
import IssuesTable from '@/components/IssuesTable';

export default function AgentPage({ agentId }) {
  return (
    <div className="p-5 md:p-8 w-full">
      <AgentHeader agentId={agentId} />
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Maintenance checks — compact left column */}
        <div className="xl:col-span-1">
          <MaintenanceChecks agentId={agentId} />
        </div>
        {/* Issues table — takes remaining 3/4 of width */}
        <div className="xl:col-span-3">
          <IssuesTable agentId={agentId} />
        </div>
      </div>
    </div>
  );
}
