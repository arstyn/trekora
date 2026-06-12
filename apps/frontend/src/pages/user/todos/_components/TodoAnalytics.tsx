import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from "recharts";

interface TodoAnalyticsProps {
    chartData: Array<{ name: string; value: number; color: string }>;
    summary: any;
}

export function TodoAnalytics({ chartData, summary }: TodoAnalyticsProps) {
    return (
        <div className="lg:col-span-4 space-y-6">
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle className="text-lg">Process Health</CardTitle>
                    <CardDescription>
                        Status distribution across workflows
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Team Performance</CardTitle>
                    <CardDescription>
                        Tasks completed vs total by assignee
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={summary?.byAssignee?.slice(0, 5) || []}
                            layout="vertical"
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={80}
                                fontSize={12}
                            />
                            <Tooltip />
                            <Bar
                                dataKey="completed"
                                stackId="a"
                                fill="#10b981"
                                radius={[0, 0, 0, 0]}
                            />
                            <Bar
                                dataKey="total"
                                stackId="a"
                                fill="#e2e8f0"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
