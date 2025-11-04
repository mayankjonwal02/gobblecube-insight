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

export const accountLevelData: AccountData[] = [
  {
    account_id: "00bebf31-dae1-41c7-bf05-b70588ed49a8",
    account_name: "On1y",
    avg_days_ago: 9.0,
    avg_inactive_days: 11.0,
    workspace_count: 1,
    chat_count: 1,
    account_status: "Active",
  },
  {
    account_id: "02257c66-e91e-41f2-b3e7-cdfe29e3206c",
    account_name: "Oziva",
    avg_days_ago: 10.0,
    avg_inactive_days: 1.0,
    workspace_count: 1,
    chat_count: 1,
    account_status: "Active",
  },
  {
    account_id: "02bbd4fd-b9f6-4273-9c77-ce8922ba45fc",
    account_name: "TATA Consumer",
    avg_days_ago: 9.567996,
    avg_inactive_days: 8.70352,
    workspace_count: 12,
    chat_count: 2,
    account_status: "Active",
  },
  {
    account_id: "045b7ca4-8adf-46c1-b2e9-14974f43f3d4",
    account_name: "Dr Reddy's",
    avg_days_ago: 10.0,
    avg_inactive_days: 1.0,
    workspace_count: 1,
    chat_count: 1,
    account_status: "Active",
  },
  {
    account_id: "05c8e9a2-4f7d-4b2e-9a3c-7e6d8f9b0c1d",
    account_name: "Marico",
    avg_days_ago: 3.0,
    avg_inactive_days: 2.5,
    workspace_count: 5,
    chat_count: 8,
    account_status: "Active",
  },
  {
    account_id: "06d9f0b3-5g8e-5c3f-0b4d-8f7e9g0c2e3f",
    account_name: "Britannia",
    avg_days_ago: 15.0,
    avg_inactive_days: 20.0,
    workspace_count: 3,
    chat_count: 0,
    account_status: "Churned",
  },
  {
    account_id: "07e0g1c4-6h9f-6d4g-1c5e-9g8f0h1d3f4g",
    account_name: "ITC Foods",
    avg_days_ago: 4.0,
    avg_inactive_days: 12.0,
    workspace_count: 8,
    chat_count: 5,
    account_status: "Active",
  },
  {
    account_id: "08f1h2d5-7i0g-7e5h-2d6f-0h9g1i2e4g5h",
    account_name: "Nestle India",
    avg_days_ago: 2.0,
    avg_inactive_days: 1.5,
    workspace_count: 6,
    chat_count: 12,
    account_status: "Active",
  },
  {
    account_id: "09g2i3e6-8j1h-8f6i-3e7g-1i0h2j3f5h6i",
    account_name: "Parle Products",
    avg_days_ago: 12.0,
    avg_inactive_days: 15.0,
    workspace_count: 2,
    chat_count: 1,
    account_status: "At Risk",
  },
  {
    account_id: "10h3j4f7-9k2i-9g7j-4f8h-2j1i3k4g6i7j",
    account_name: "Godrej Consumer",
    avg_days_ago: 7.0,
    avg_inactive_days: 6.0,
    workspace_count: 4,
    chat_count: 3,
    account_status: "Active",
  },
].map((account) => {
  const quadrant = getQuadrant(account.avg_days_ago, account.avg_inactive_days);
  return {
    ...account,
    quadrant,
    risk_level: getRiskLevel(quadrant),
  };
});

export const workspaceLevelData: WorkspaceData[] = [
  {
    account_id: "00bebf31-dae1-41c7-bf05-b70588ed49a8",
    workspace_id: "55b8ffc7-bb57-4566-b6a5-8afe387f6e0b",
    account_name: "On1y",
    workspace_name: "on1y",
    avg_days_ago: 9.0,
    avg_inactive_days: 11.0,
    chat_count: 1,
    account_status: "Active",
  },
  {
    account_id: "02257c66-e91e-41f2-b3e7-cdfe29e3206c",
    workspace_id: "640f5948-ddaf-4f44-a485-4799272519e9",
    account_name: "Oziva",
    workspace_name: "oziva",
    avg_days_ago: 10.0,
    avg_inactive_days: 1.0,
    chat_count: 1,
    account_status: "Active",
  },
  {
    account_id: "02bbd4fd-b9f6-4273-9c77-ce8922ba45fc",
    workspace_id: "2dc4f399-acff-4194-867e-f55bc9ff316d",
    account_name: "TATA Consumer",
    workspace_name: "tatadaal",
    avg_days_ago: 8.0,
    avg_inactive_days: 8.0,
    chat_count: 1,
    account_status: "Active",
  },
  {
    account_id: "02bbd4fd-b9f6-4273-9c77-ce8922ba45fc",
    workspace_id: "2f2f472e-3eea-4621-9b00-7e5b14cbee87",
    account_name: "TATA Consumer",
    workspace_name: "tatasalt",
    avg_days_ago: 10.0,
    avg_inactive_days: 8.0,
    chat_count: 1,
    account_status: "Active",
  },
  {
    account_id: "02bbd4fd-b9f6-4273-9c77-ce8922ba45fc",
    workspace_id: "30d7439b-18b7-4325-8e0e-4253d749284b",
    account_name: "TATA Consumer",
    workspace_name: "tatanoodles",
    avg_days_ago: 8.0,
    avg_inactive_days: 8.0,
    chat_count: 1,
    account_status: "Active",
  },
  {
    account_id: "02bbd4fd-b9f6-4273-9c77-ce8922ba45fc",
    workspace_id: "31e8540c-29c8-5436-9f1f-5364e859395c",
    account_name: "TATA Consumer",
    workspace_name: "tatatea",
    avg_days_ago: 12.0,
    avg_inactive_days: 10.0,
    chat_count: 2,
    account_status: "Active",
  },
  {
    account_id: "045b7ca4-8adf-46c1-b2e9-14974f43f3d4",
    workspace_id: "74c9ggd8-cc68-5677-c7b6-9bgg498g7h1c",
    account_name: "Dr Reddy's",
    workspace_name: "drl",
    avg_days_ago: 10.0,
    avg_inactive_days: 1.0,
    chat_count: 1,
    account_status: "Active",
  },
  {
    account_id: "05c8e9a2-4f7d-4b2e-9a3c-7e6d8f9b0c1d",
    workspace_id: "85d0hhe9-dd79-6788-d8c7-0chh509h8i2d",
    account_name: "Marico",
    workspace_name: "parachute",
    avg_days_ago: 2.0,
    avg_inactive_days: 1.0,
    chat_count: 4,
    account_status: "Active",
  },
  {
    account_id: "05c8e9a2-4f7d-4b2e-9a3c-7e6d8f9b0c1d",
    workspace_id: "96e1iif0-ee80-7899-e9d8-1dii610i9j3e",
    account_name: "Marico",
    workspace_name: "saffola",
    avg_days_ago: 4.0,
    avg_inactive_days: 4.0,
    chat_count: 4,
    account_status: "Active",
  },
  {
    account_id: "07e0g1c4-6h9f-6d4g-1c5e-9g8f0h1d3f4g",
    workspace_id: "a7f2jjg1-ff91-8900-f0e9-2ejj721j0k4f",
    account_name: "ITC Foods",
    workspace_name: "sunfeast",
    avg_days_ago: 3.0,
    avg_inactive_days: 10.0,
    chat_count: 2,
    account_status: "Active",
  },
  {
    account_id: "07e0g1c4-6h9f-6d4g-1c5e-9g8f0h1d3f4g",
    workspace_id: "b8g3kkh2-gg02-9011-g1f0-3fkk832k1l5g",
    account_name: "ITC Foods",
    workspace_name: "aashirvaad",
    avg_days_ago: 5.0,
    avg_inactive_days: 14.0,
    chat_count: 3,
    account_status: "Active",
  },
  {
    account_id: "08f1h2d5-7i0g-7e5h-2d6f-0h9g1i2e4g5h",
    workspace_id: "c9h4llh3-hh13-0122-h2g1-4gll943l2m6h",
    account_name: "Nestle India",
    workspace_name: "maggi",
    avg_days_ago: 1.0,
    avg_inactive_days: 1.0,
    chat_count: 6,
    account_status: "Active",
  },
  {
    account_id: "08f1h2d5-7i0g-7e5h-2d6f-0h9g1i2e4g5h",
    workspace_id: "d0i5mmi4-ii24-1233-i3h2-5hmm054m3n7i",
    account_name: "Nestle India",
    workspace_name: "nescafe",
    avg_days_ago: 3.0,
    avg_inactive_days: 2.0,
    chat_count: 6,
    account_status: "Active",
  },
].map((workspace) => {
  const quadrant = getQuadrant(workspace.avg_days_ago, workspace.avg_inactive_days);
  return {
    ...workspace,
    quadrant,
    risk_level: getRiskLevel(quadrant),
  };
});
