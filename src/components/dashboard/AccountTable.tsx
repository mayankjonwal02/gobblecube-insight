import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Search, ArrowUpDown, Filter } from "lucide-react";
import { AccountData } from "@/data/dummyData";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRiskLevel } from "@/data/dummyData"
interface AccountTableProps {
  data: AccountData[];
  filterStatus?: string;
}



function getQuadrant(
  avgInactiveDays: number,
  avgDaysAgo: number,
  medianInactive: number,
  medianDaysAgo: number
): string {
  console.log("avg inactive"+avgInactiveDays,
    "avgdayago"+avgDaysAgo,
    "medianinactive"+medianInactive,
    "mediandaysago"+medianDaysAgo)
  const adjustedX = avgInactiveDays - medianInactive;
  const adjustedY = avgDaysAgo - medianDaysAgo; 

  const eps = 0.0001; // tolerance for boundary conditions
  let quadrant = "Healthy (III)";

  if (adjustedX >= -eps && adjustedY >= -eps) quadrant = "Inactive & Dormant";
  else if (adjustedX < -eps && adjustedY >= -eps) quadrant = "At Risk";
  else if (adjustedX < -eps && adjustedY < -eps) quadrant = "Healthy Accounts";
  else if (adjustedX >= -eps && adjustedY < -eps) quadrant = "Active but Dormant";

  return quadrant;
}

const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

const AccountTable = ({ data, filterStatus }: AccountTableProps) => {
  const inactiveDays = data.map((d) => d.avg_inactive_days);
  const daysAgo = data.map((d) => d.avg_days_ago);
  const medianInactive = calculateMedian(inactiveDays);
  const medianDaysAgo = calculateMedian(daysAgo);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof AccountData>("account_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [inactiveDaysFilter, setInactiveDaysFilter] = useState<string>("all");

  const handleSort = (field: keyof AccountData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredData = data
    .filter((account) => {
      const matchesSearch =
        account.account_name.toLowerCase().includes(search.toLowerCase()) ||
        account.account_id.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = !filterStatus || account.quadrant === filterStatus;
      const matchesRegion = regionFilter === "all" || account.quadrant === regionFilter;
      const matchesInactiveDays =
        inactiveDaysFilter === "all" ||
        (inactiveDaysFilter === "0-5" && account.avg_inactive_days <= 5) ||
        (inactiveDaysFilter === "6-10" && account.avg_inactive_days > 5 && account.avg_inactive_days <= 10) ||
        (inactiveDaysFilter === "11-20" && account.avg_inactive_days > 10 && account.avg_inactive_days <= 20) ||
        (inactiveDaysFilter === "20+" && account.avg_inactive_days > 20);
      return matchesSearch && matchesFilter && matchesRegion && matchesInactiveDays;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * modifier;
      }
      return ((aValue as number) - (bValue as number)) * modifier;
    });

  // ✅ Updated handleExport to download CSV
  const handleExport = () => {
    if (!filteredData.length) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Account Name",
      "Account ID",
      "Avg Days Ago",
      "Avg Inactive Days",
      "Workspaces",
      "Chat Count",
      "Status",
      "Quadrant",
      "Risk Level",
    ];

    const csvRows = [
      headers.join(","), // header row
      ...filteredData.map((account) =>
        [
          `"${account.account_name}"`,
          `"${account.account_id}"`,
          account.avg_days_ago.toFixed(1),
          account.avg_inactive_days.toFixed(1),
          account.workspace_count,
          account.chat_count,
          `"${account.account_status}"`,
          `"${account.quadrant}"`,
          `"${getRiskLevel(account.quadrant)}"`,
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `account_data_${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "Export Successful",
      description: "Account data exported as CSV.",
    });
  };


  const getQuadrantBadge = (quadrant?: string) => {
    console.log("Quadrant: "+ quadrant)
    const variants: Record<string, { color: string; className: string }> = {
      "Healthy Accounts": { color: "success", className: "bg-success/10 text-success border-success/20" },
      "Active but Dormant": { color: "warning", className: "bg-warning/10 text-warning border-warning/20" },
      "At Risk": { color: "purple", className: "bg-quadrant-at-risk/10 text-quadrant-at-risk border-quadrant-at-risk/20" },
      "Inactive & Dormant": { color: "destructive", className: "bg-destructive/10 text-destructive border-destructive/20" },
    };

    const variant = quadrant ? variants[quadrant] : variants["Healthy"];
    return <Badge className={variant.className}>{quadrant || "Unknown"}</Badge>;
  };

  const getRiskBadge = (risk?: string) => {
    const variants: Record<string, string> = {
      "Low": "bg-success/10 text-success border-success/20",
      "Medium": "bg-warning/10 text-warning border-warning/20",
      "High": "bg-quadrant-at-risk/10 text-quadrant-at-risk border-quadrant-at-risk/20",
      "Critical": "bg-destructive/10 text-destructive border-destructive/20",
    };

    return <Badge className={risk ? variants[risk] : ""}>{risk || "Unknown"}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="Healthy Accounts">Healthy</SelectItem>
            <SelectItem value="Active but Dormant">Active but Dormant</SelectItem>
            <SelectItem value="At Risk">At Risk</SelectItem>
            <SelectItem value="Inactive & Dormant">Inactive & Dormant</SelectItem>
          </SelectContent>
        </Select>
        <Select value={inactiveDaysFilter} onValueChange={setInactiveDaysFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Inactive Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            <SelectItem value="0-5">0-5 days</SelectItem>
            <SelectItem value="6-10">6-10 days</SelectItem>
            <SelectItem value="11-20">11-20 days</SelectItem>
            <SelectItem value="20+">20+ days</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("account_name")} className="h-8 px-2">
                  Account Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Account ID</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("avg_days_ago")} className="h-8 px-2">
                  Avg Days Ago
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("avg_inactive_days")} className="h-8 px-2">
                  Avg Inactive Days
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Workspaces</TableHead>
              <TableHead>Chat Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Account Region</TableHead>
              <TableHead>Risk Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((account) => (
                <TableRow
                  key={account.account_id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/workspace/${account.account_id}`)}
                >
                  <TableCell className="font-medium">{account.account_name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {account.account_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{account.avg_days_ago.toFixed(1)}</TableCell>
                  <TableCell>{account.avg_inactive_days.toFixed(1)}</TableCell>
                  <TableCell>{account.workspace_count}</TableCell>
                  <TableCell>{account.chat_count}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{account.account_status}</Badge>
                  </TableCell>
                  <TableCell>{getQuadrantBadge(getQuadrant(account.avg_inactive_days,account.avg_days_ago,medianInactive,medianDaysAgo)) }</TableCell>
                  <TableCell>{getRiskBadge(getRiskLevel(account.quadrant))}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                  No account data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>

        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {data.length} accounts
      </div>
    </div>
  );
};

export default AccountTable;
