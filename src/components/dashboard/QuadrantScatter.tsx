import { useNavigate } from "react-router-dom";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { AccountData, WorkspaceData } from "@/data/dummyData";
import { toast } from "@/hooks/use-toast";

interface QuadrantScatterProps {
  data: AccountData[] | WorkspaceData[];
  title: string;
  type: "account" | "workspace";
}

const QuadrantScatter = ({ data, title, type }: QuadrantScatterProps) => {
  const navigate = useNavigate();

  const getColorByPosition = (x: number, y: number) => {
    // Quadrant I (x > 5, y > 5): Red - Inactive & Dormant
    // Quadrant II (x <= 5, y > 5): Purple - At Risk
    // Quadrant III (x <= 5, y <= 5): Green - Healthy
    // Quadrant IV (x > 5, y <= 5): Yellow - Active but Dormant
    
    if (x > 5 && y > 5) return "#EF4444"; // Red - Q1
    if (x <= 5 && y > 5) return "#8B5CF6"; // Purple - Q2
    if (x <= 5 && y <= 5) return "#22C55E"; // Green - Q3
    return "#F59E0B"; // Yellow - Q4
  };

  const chartData = data.map((item) => ({
    x: item.avg_inactive_days,
    y: item.avg_days_ago,
    name: "account_name" in item ? item.account_name : item.workspace_name,
    quadrant: item.quadrant,
    id: "account_id" in item ? item.account_id : item.workspace_id,
    color: getColorByPosition(item.avg_inactive_days, item.avg_days_ago),
  }));

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Downloading chart as PNG...",
    });
  };

  const handleShare = () => {
    toast({
      title: "Link Copied",
      description: "Shareable link copied to clipboard",
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-xs text-muted-foreground">Inactive Days: {data.x.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Days Ago: {data.y.toFixed(1)}</p>
          <p className="text-xs mt-1">
            <span
              className="inline-block w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: data.color }}
            />
            {data.quadrant}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="x"
                name="Avg Inactive Days"
                label={{ value: "Avg Inactive Days (Chat)", position: "bottom", offset: 20 }}
                stroke="hsl(var(--muted-foreground))"
                domain={[0, 'auto']}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Avg Days Ago"
                label={{ value: "Avg Days Ago (Login)", angle: -90, position: "left", offset: 10 }}
                stroke="hsl(var(--muted-foreground))"
                domain={[0, 'auto']}
              />
              {/* Quadrant reference lines */}
              <line x1="5" y1="0" x2="5" y2="100%" stroke="hsl(var(--border))" strokeWidth={2} strokeDasharray="5 5" />
              <line x1="0" y1="5" x2="100%" y2="5" stroke="hsl(var(--border))" strokeWidth={2} strokeDasharray="5 5" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={chartData}
                cursor="pointer"
                onClick={(data) => {
                  if (type === "account") {
                    navigate(`/workspace/${data.id}`);
                  }
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          {[
            { label: "Quadrant III - Healthy", color: "#22C55E" },
            { label: "Quadrant IV - Active but Dormant", color: "#F59E0B" },
            { label: "Quadrant II - At Risk", color: "#8B5CF6" },
            { label: "Quadrant I - Inactive & Dormant", color: "#EF4444" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuadrantScatter;
