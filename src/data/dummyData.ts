export interface AccountData {
  account_id: string;
  account_name: string;
  avg_days_ago: number;
  avg_inactive_days: number;
  workspace_count: number;
  chat_count: number;
  account_status: string;
  risk_level?: string;
  quadrant?: string;
}

export interface WorkspaceData {
  account_id: string;
  workspace_id: string;
  account_name: string;
  workspace_name: string;
  avg_days_ago: number;
  avg_inactive_days: number;
  chat_count: number;
  account_status: string;
  risk_level?: string;
  quadrant?: string;
}
import accountJson from '../../account_level_data.json';
import workspaceJson from '../../workspace_level_data.json';
// Helper function to determine quadrant
const getQuadrant = (avgDaysAgo: number, avgInactiveDays: number): string => {
  if (avgDaysAgo <= 5 && avgInactiveDays <= 5) return "Healthy";
  if (avgDaysAgo <= 5 && avgInactiveDays > 5) return "Active but Dormant";
  if (avgDaysAgo > 5 && avgInactiveDays <= 5) return "At Risk";
  return "Inactive & Dormant";
};

// Helper function to determine risk level
const getRiskLevel = (quadrant: string): string => {
  if (quadrant === "Healthy") return "Low";
  if (quadrant === "Active but Dormant") return "Medium";
  if (quadrant === "At Risk") return "High";
  return "Critical";
};

type AnyRow = Record<string, any>;

const normalizeAccountRow = (row: AnyRow): AccountData => {
  const account_id: string = row.account_id ?? row.AccountId ?? row['account id'] ?? row['Account ID'];
  const account_name: string = row.account_name ?? row['Account Name'] ?? row.name;
  const avg_days_ago: number = Number(row.avg_days_ago ?? row.avgDaysAgo ?? row['Avg Days Ago'] ?? 0);
  const avg_inactive_days: number = Number(row.avg_inactive_days ?? row.avgInactiveDays ?? row['Avg Inactive Days'] ?? 0);
  const workspace_count: number = Number(row.workspace_count ?? row.workspaceCount ?? row['Workspace Count'] ?? 0);
  const chat_count: number = Number(row.chat_count ?? row.chatCount ?? row['Chat Count'] ?? 0);
  const account_status: string = row.account_status ?? row['Account Status'] ?? row.status ?? 'Unknown';

  // Compute quadrant and risk consistently with app logic
  const quadrant = getQuadrant(avg_days_ago, avg_inactive_days);
  const risk_level = getRiskLevel(quadrant);

  return {
    account_id,
    account_name,
    avg_days_ago,
    avg_inactive_days,
    workspace_count,
    chat_count,
    account_status,
    quadrant,
    risk_level,
  };
};

const normalizeWorkspaceRow = (row: AnyRow): WorkspaceData => {
  const account_id: string = row.account_id ?? row.AccountId ?? row['account id'] ?? row['Account ID'];
  const workspace_id: string = row.workspace_id ?? row.WorkspaceId ?? row['workspace id'] ?? row['Workspace ID'];
  const account_name: string = row.account_name ?? row['Account Name'] ?? row.name ?? '';
  const workspace_name: string = row.workspace_name ?? row['Workspace Name'] ?? row.workspace ?? '';
  const avg_days_ago: number = Number(row.avg_days_ago ?? row.avgDaysAgo ?? row['Avg Days Ago'] ?? 0);
  const avg_inactive_days: number = Number(row.avg_inactive_days ?? row.avgInactiveDays ?? row['Avg Inactive Days'] ?? 0);
  const chat_count: number = Number(row.chat_count ?? row.chatCount ?? row['Chat Count'] ?? 0);
  const account_status: string = row.account_status ?? row['Account Status'] ?? row.status ?? 'Unknown';

  const quadrant = getQuadrant(avg_days_ago, avg_inactive_days);
  const risk_level = getRiskLevel(quadrant);

  return {
    account_id,
    workspace_id,
    account_name,
    workspace_name,
    avg_days_ago,
    avg_inactive_days,
    chat_count,
    account_status,
    quadrant,
    risk_level,
  };
};

// Map JSON → typed arrays. If there are duplicates in account JSON, we keep all rows;
// dedup logic can be added if needed (e.g., by account_id).
export const accountLevelData: AccountData[] = (accountJson as AnyRow[]).map(normalizeAccountRow);

// For workspace JSON, we defensively normalize key names (supports multiple casing styles).
export const workspaceLevelData: WorkspaceData[] = (workspaceJson as AnyRow[]).map(normalizeWorkspaceRow);
