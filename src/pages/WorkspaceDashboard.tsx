import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, MessageSquare, AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "@/components/dashboard/MetricCard";
import QuadrantScatter from "@/components/dashboard/QuadrantScatter";
import { workspaceLevelData, accountLevelData } from "@/data/dummyData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WorkspaceDashboard = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const account = accountLevelData.find((a) => a.account_id === accountId);
  const workspaces = workspaceLevelData.filter((w) => w.account_id === accountId);

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Account not found</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const mostActive = workspaces.reduce((prev, current) =>
    prev.chat_count > current.chat_count ? prev : current
  );
  const mostInactive = workspaces.reduce((prev, current) =>
    prev.avg_inactive_days > current.avg_inactive_days ? prev : current
  );
  const atRiskWorkspaces = workspaces.filter(
    (w) => w.quadrant === "At Risk" || w.quadrant === "Inactive & Dormant"
  ).length;

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Downloading workspace data as CSV...",
    });
  };

  const getQuadrantBadge = (quadrant?: string) => {
    const variants: Record<string, string> = {
      "Healthy": "bg-success/10 text-success border-success/20",
      "Active but Dormant": "bg-warning/10 text-warning border-warning/20",
      "At Risk": "bg-quadrant-at-risk/10 text-quadrant-at-risk border-quadrant-at-risk/20",
      "Inactive & Dormant": "bg-destructive/10 text-destructive border-destructive/20",
    };
    
    return <Badge className={quadrant ? variants[quadrant] : ""}>{quadrant || "Unknown"}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="space-y-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Accounts
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{account.account_name}</h1>
                <p className="text-sm text-muted-foreground">
                  Workspace-Level Analysis • {workspaces.length} workspaces
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Account Summary */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold">{account.account_status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Workspaces</p>
                <p className="text-lg font-semibold">{account.workspace_count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Days Since Login</p>
                <p className="text-lg font-semibold">{account.avg_days_ago.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Inactive Days</p>
                <p className="text-lg font-semibold">{account.avg_inactive_days.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workspace Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Most Active Workspace"
            value={mostActive.workspace_name}
            icon={<Activity className="w-6 h-6" />}
            variant="success"
          />
          <MetricCard
            title="Most Inactive Workspace"
            value={mostInactive.workspace_name}
            icon={<AlertTriangle className="w-6 h-6" />}
            variant="destructive"
          />
          <MetricCard
            title="Total Workspaces"
            value={workspaces.length}
            icon={<Building2 className="w-6 h-6" />}
          />
          <MetricCard
            title="Workspaces at Risk"
            value={atRiskWorkspaces}
            icon={<AlertTriangle className="w-6 h-6" />}
            variant="purple"
          />
        </div>

        {/* Workspace Scatter Plot */}
        <QuadrantScatter
          data={workspaces}
          title="Workspace Engagement Quadrant Analysis"
          type="workspace"
        />

        {/* Workspace Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Workspace Details</CardTitle>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Workspace Name</TableHead>
                    <TableHead>Avg Days Ago</TableHead>
                    <TableHead>Avg Inactive Days</TableHead>
                    <TableHead>Chat Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quadrant</TableHead>
                    <TableHead>Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspaces.map((workspace) => (
                    <TableRow key={workspace.workspace_id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{workspace.workspace_name}</TableCell>
                      <TableCell>{workspace.avg_days_ago.toFixed(1)}</TableCell>
                      <TableCell>{workspace.avg_inactive_days.toFixed(1)}</TableCell>
                      <TableCell>{workspace.chat_count}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{workspace.account_status}</Badge>
                      </TableCell>
                      <TableCell>{getQuadrantBadge(workspace.quadrant)}</TableCell>
                      <TableCell>
                        <Badge>{workspace.risk_level}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WorkspaceDashboard;
