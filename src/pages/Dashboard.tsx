import { useState } from "react";
import { Users, TrendingDown, AlertTriangle, MessageSquare, BarChart3, Calendar } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import AccountTable from "@/components/dashboard/AccountTable";
import QuadrantScatter from "@/components/dashboard/QuadrantScatter";
import { accountLevelData } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState("30");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const totalActive = accountLevelData.filter(
    (a) => a.account_status === "Active"
  ).length;
  const totalChurned = accountLevelData.filter(
    (a) => a.account_status === "Churned"
  ).length;
  const totalAtRisk = accountLevelData.filter(
    (a) => a.quadrant === "At Risk" || a.quadrant === "Inactive & Dormant"
  ).length;
  const avgEngagement = (
    accountLevelData.reduce((sum, a) => sum + a.chat_count, 0) / accountLevelData.length
  ).toFixed(1);
  const avgChat = (
    accountLevelData.reduce((sum, a) => sum + a.chat_count, 0) / accountLevelData.length
  ).toFixed(1);

  const atRiskAccounts = accountLevelData
    .filter((a) => a.quadrant === "At Risk" || a.quadrant === "Inactive & Dormant")
    .sort((a, b) => b.avg_inactive_days - a.avg_inactive_days)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Account-Level Dashboard</h1>
                <p className="text-sm text-muted-foreground">Gobblecube Customer Success Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline">Profile</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard
            title="Total Active Accounts"
            value={totalActive}
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
            variant="success"
            onClick={() => setFilterStatus("Healthy")}
          />
          <MetricCard
            title="Churned Accounts"
            value={totalChurned}
            icon={<TrendingDown className="w-6 h-6" />}
            trend={{ value: 3, isPositive: false }}
            variant="destructive"
            onClick={() => setFilterStatus("Inactive & Dormant")}
          />
          <MetricCard
            title="At-Risk Accounts"
            value={totalAtRisk}
            icon={<AlertTriangle className="w-6 h-6" />}
            trend={{ value: 8, isPositive: false }}
            variant="purple"
            onClick={() => setFilterStatus("At Risk")}
          />
          <MetricCard
            title="Avg Engagement Score"
            value={avgEngagement}
            icon={<BarChart3 className="w-6 h-6" />}
            trend={{ value: 5, isPositive: true }}
          />
          <MetricCard
            title="Avg Chat Activity"
            value={avgChat}
            icon={<MessageSquare className="w-6 h-6" />}
            trend={{ value: 2, isPositive: true }}
            variant="warning"
          />
        </div>

        {/* Quadrant Scatter Plot */}
        <QuadrantScatter
          data={accountLevelData}
          title="Account Engagement Quadrant Analysis"
          type="account"
        />

        {/* Risk Summary Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Top At-Risk Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atRiskAccounts.map((account) => (
                <div
                  key={account.account_id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{account.account_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.avg_inactive_days.toFixed(1)} days inactive • {account.avg_days_ago.toFixed(1)} days since last login
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Notify Manager
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountTable data={accountLevelData} filterStatus={filterStatus} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
