import { useRef, useState } from "react";
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
  Brush,
  ZAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import { AccountData, WorkspaceData } from "@/data/dummyData";
import { toast } from "@/hooks/use-toast";
import * as htmlToImage from "html-to-image";

const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

interface QuadrantScatterProps {
  data: AccountData[] | WorkspaceData[];
  title: string;
  type: "account" | "workspace";
}

const QuadrantScatter = ({ data, title, type }: QuadrantScatterProps) => {
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);

  // ✅ Median-based centering
  const inactiveDays = data.map((d) => d.avg_inactive_days);
  const daysAgo = data.map((d) => d.avg_days_ago);
  const medianInactive = calculateMedian(inactiveDays);
  const medianDaysAgo = calculateMedian(daysAgo);

  const chartData = data.map((item) => {
    const adjustedX = item.avg_inactive_days - medianInactive;
    const adjustedY = item.avg_days_ago - medianDaysAgo;

    let quadrant = "Healthy (III)";
    if (adjustedX > 0 && adjustedY > 0) quadrant = "Inactive & Dormant (I)";
    else if (adjustedX < 0 && adjustedY > 0) quadrant = "At Risk (II)";
    else if (adjustedX < 0 && adjustedY < 0) quadrant = "Healthy (III)";
    else if (adjustedX > 0 && adjustedY < 0) quadrant = "Active but Dormant (IV)";

    const colorMap: Record<string, string> = {
      "Inactive & Dormant (I)": "#EF4444",
      "At Risk (II)": "#8B5CF6",
      "Healthy (III)": "#22C55E",
      "Active but Dormant (IV)": "#F59E0B",
    };

    return {
      x: adjustedX,
      y: adjustedY,
      name: "account_name" in item ? item.account_name : item.workspace_name,
      id: "account_id" in item ? item.account_id : item.workspace_id,
      quadrant,
      color: colorMap[quadrant],
    };
  });

  // ✅ Determine initial symmetric range
  const maxRange = Math.max(
    ...chartData.flatMap((d) => [Math.abs(d.x), Math.abs(d.y)])
  );
  const [zoom, setZoom] = useState(1); // zoom factor

  const baseRange = Math.ceil(maxRange * 1.2) || 10;
  const range = baseRange / zoom;

  // ✅ Dynamic tick interval based on current zoom and range
  const computeTickInterval = (range: number) => {
    if (range <= 5) return 0.5;
    if (range <= 10) return 1;
    if (range <= 20) return 2;
    if (range <= 50) return 5;
    return Math.ceil(range / 10);
  };

  const tickInterval = computeTickInterval(range);

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.5, 10));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.5, 0.5));

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-1">{d.name}</p>
          <p className="text-xs text-muted-foreground">
            Adj. Inactive Days: {d.x.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">
            Adj. Days Ago: {d.y.toFixed(1)}
          </p>
          <p className="text-xs mt-1">
            <span
              className="inline-block w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: d.color }}
            />
            {d.quadrant}
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
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div ref={chartRef} className="h-[400px] w-full bg-background rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

              <XAxis
                type="number"
                dataKey="x"
                name="Adjusted Inactive Days"
                label={{
                  value: "Adjusted Inactive Days (Chat)",
                  position: "bottom",
                  offset: 20,
                }}
                stroke="hsl(var(--muted-foreground))"
                domain={[-range, range]}
                interval={0}
                tickCount={Math.floor((2 * range) / tickInterval)}
                tickFormatter={(tick) => tick.toFixed(1)}
                allowDataOverflow
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="number"
                dataKey="y"
                name="Adjusted Days Ago"
                label={{
                  value: "Adjusted Days Ago (Login)",
                  angle: -90,
                  position: "left",
                  offset: 10,
                }}
                stroke="hsl(var(--muted-foreground))"
                domain={[-range, range]}
                interval={0}
                tickCount={Math.floor((2 * range) / tickInterval)}
                tickFormatter={(tick) => tick.toFixed(1)}
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
                onClick={(d) => {
                  if (type === "account") navigate(`/workspace/${d.id}`);
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                ))}
              </Scatter>

              {/* Optional brush to zoom interactively */}
              <Brush dataKey="x" height={20} stroke="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-6">
          {[
            { label: "Quadrant I - Inactive & Dormant", color: "#EF4444" },
            { label: "Quadrant II - At Risk", color: "#8B5CF6" },
            { label: "Quadrant III - Healthy", color: "#22C55E" },
            { label: "Quadrant IV - Active but Dormant", color: "#F59E0B" },
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
