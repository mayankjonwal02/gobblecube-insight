import { ArrowDown, ArrowUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  variant?: "default" | "success" | "warning" | "destructive" | "purple";
}

const MetricCard = ({ title, value, icon, trend, onClick, variant = "default" }: MetricCardProps) => {
  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Export Started",
      description: `Exporting ${title} data...`,
    });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 hover:border-success/40";
      case "warning":
        return "border-warning/20 hover:border-warning/40";
      case "destructive":
        return "border-destructive/20 hover:border-destructive/40";
      case "purple":
        return "border-quadrant-at-risk/20 hover:border-quadrant-at-risk/40";
      default:
        return "border-border hover:border-primary/40";
    }
  };

  const getIconBgStyles = () => {
    switch (variant) {
      case "success":
        return "bg-success/10 text-success";
      case "warning":
        return "bg-warning/10 text-warning";
      case "destructive":
        return "bg-destructive/10 text-destructive";
      case "purple":
        return "bg-quadrant-at-risk/10 text-quadrant-at-risk";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <Card
      className={`transition-all duration-300 ${getVariantStyles()} ${
        onClick ? "cursor-pointer" : ""
      }`}
      // onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {/* <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
        </Button> */}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xl font-bold">{value}</div>
            {/* {trend && (
              <div className="flex items-center gap-1 text-sm">
                {trend.isPositive ? (
                  <ArrowUp className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-destructive" />
                )}
                <span className={trend.isPositive ? "text-success" : "text-destructive"}>
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-muted-foreground">from last period</span>
              </div>
            )} */}
          </div>
          <div className={`rounded-2xl p-3 ${getIconBgStyles()}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
