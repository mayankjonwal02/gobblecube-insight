import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { AccountData, WorkspaceData } from "@/data/dummyData";
import { toast } from "@/hooks/use-toast";
import * as htmlToImage from "html-to-image";

interface QuadrantScatterProps {
  data: AccountData[] | WorkspaceData[];
  title: string;
  type: "account" | "workspace";
}

const QuadrantScatter = ({ data, title, type }: QuadrantScatterProps) => {
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);

  const getColorByPosition = (x: number, y: number) => {
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

  // ✅ Dynamic symmetric range
  const maxRange = Math.max(
    ...chartData.flatMap((d) => [Math.abs(d.x), Math.abs(d.y)])
  );
  const range = Math.ceil(maxRange * 1.2) || 10;

  // ✅ Handle Export to PNG
  const handleExport = async () => {
    if (!chartRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(chartRef.current);
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "_")}_Chart.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Export Successful",
        description: "Chart downloaded as PNG.",
      });
    } catch (err) {
      console.error("Export failed:", err);
      toast({
        title: "Export Failed",
        description: "Something went wrong while exporting.",
        variant: "destructive",
      });
    }
  };

  // ✅ Handle Share (Copy Link)
  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Link Copied",
        description: "Shareable link copied to clipboard.",
      });
    } catch (err) {
      console.error("Share failed:", err);
      toast({
        title: "Share Failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive",
      });
    }
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
          {/* <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button> */}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* 📊 Wrap chart in a ref container for export */}
        <div ref={chartRef} className="h-[400px] w-full bg-background rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

              <XAxis
                type="number"
                dataKey="x"
                name="Avg Inactive Days"
                label={{
                  value: "Avg Inactive Days (Chat)",
                  position: "bottom",
                  offset: 20,
                }}
                stroke="hsl(var(--muted-foreground))"
                domain={[-range, range]}
                allowDataOverflow
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="number"
                dataKey="y"
                name="Avg Days Ago"
                label={{
                  value: "Avg Days Ago (Login)",
                  angle: -90,
                  position: "left",
                  offset: 10,
                }}
                stroke="hsl(var(--muted-foreground))"
                domain={[-range, range]}
                allowDataOverflow
                axisLine={false}
                tickLine={false}
              />

              <ReferenceLine x={0} stroke="hsl(var(--foreground))" strokeWidth={1.2} />
              <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeWidth={1.2} />

              <Tooltip content={<CustomTooltip />} />

              <Scatter
                data={chartData}
                cursor="pointer"
                onClick={(data) => {
                  if (type === "account") navigate(`/workspace/${data.id}`);
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Quadrant Legend */}
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          {[
            { label: "Quadrant III - Healthy", color: "#22C55E" },
            { label: "Quadrant IV - Active but Dormant", color: "#F59E0B" },
            { label: "Quadrant II - At Risk", color: "#8B5CF6" },
            { label: "Quadrant I - Inactive & Dormant", color: "#EF4444" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuadrantScatter;
