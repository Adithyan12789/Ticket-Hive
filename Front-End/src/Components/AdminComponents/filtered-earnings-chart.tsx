import { Card, CardContent, CardHeader, Typography, Button, ButtonGroup } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface EarningsData {
  date: string;
  earnings: number;
}

interface FilteredEarningsChartProps {
  data: EarningsData[];
  filter: "all" | "monthly" | "yearly";
  onFilterChange: (filter: "all" | "monthly" | "yearly") => void;
}

export function FilteredEarningsChart({ data, filter, onFilterChange }: FilteredEarningsChartProps) {
  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h6" style={{ fontWeight: "normal" }}>
            Total Earnings
          </Typography>
        }
        action={
          <ButtonGroup variant="outlined" size="small">
            <Button
              onClick={() => onFilterChange("all")}
              variant={filter === "all" ? "contained" : "outlined"}
            >
              All Time
            </Button>
            <Button
              onClick={() => onFilterChange("monthly")}
              variant={filter === "monthly" ? "contained" : "outlined"}
            >
              Monthly
            </Button>
            <Button
              onClick={() => onFilterChange("yearly")}
              variant={filter === "yearly" ? "contained" : "outlined"}
            >
              Yearly
            </Button>
          </ButtonGroup>
        }
      />
      <CardContent style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => value.split("-")[1]}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip formatter={(value: number) => `₹${value}`} />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#1976d2"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
