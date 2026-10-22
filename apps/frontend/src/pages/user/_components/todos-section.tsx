import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { DashboardTodoItem } from "@/services/dashboard.service";
import {
	CheckSquare,
	Clock,
	Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TodosSectionProps {
	items: DashboardTodoItem[];
	loading: boolean;
	roleFilter?: string;
}

export function TodosSection({
	items: initialItems,
	loading,
	roleFilter,
}: TodosSectionProps) {
	const [todos, setTodos] = useState<DashboardTodoItem[]>(initialItems);
	const [newTodoTitle, setNewTodoTitle] = useState("");

	if (todos.length === 0 && initialItems.length > 0) {
		setTodos(initialItems);
	}

	const handleToggleTodo = (id: string) => {
		setTodos((prev) =>
			prev.map((t) => {
				if (t.id === id) {
					const updated = !t.isCompleted;
					if (updated) toast.success("Task marked completed!");
					return { ...t, isCompleted: updated };
				}
				return t;
			})
		);
	};

	const handleAddTodo = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTodoTitle.trim()) return;

		const newItem: DashboardTodoItem = {
			id: `todo-${Date.now()}`,
			title: newTodoTitle.trim(),
			dueDate: "Today",
			priority: "medium",
			roleCategory: (roleFilter as any) || "general",
			isCompleted: false,
		};

		setTodos((prev) => [newItem, ...prev]);
		setNewTodoTitle("");
		toast.success("New task added to your todo list");
	};

	if (loading) {
		return (
			<Card className="shadow-xs border-border/80 h-full flex flex-col">
				<CardHeader className="pb-3">
					<div className="h-6 w-36 bg-muted animate-pulse rounded" />
					<div className="h-4 w-48 bg-muted animate-pulse rounded mt-1" />
				</CardHeader>
				<CardContent className="flex-1 space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-14 bg-muted/50 animate-pulse rounded-lg" />
					))}
				</CardContent>
			</Card>
		);
	}

	const pendingCount = todos.filter((t) => !t.isCompleted).length;

	return (
		<Card className="shadow-xs border-border/80 h-full flex flex-col justify-between">
			<CardHeader className="pb-3 border-b border-border/40">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
							<CheckSquare className="h-4 w-4 shrink-0" />
						</div>
						<CardTitle className="text-base font-bold tracking-tight">To-Do Checklist</CardTitle>
					</div>
					<Badge
						variant="secondary"
						className="text-xs px-2.5 py-0.5 font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shrink-0"
					>
						{pendingCount} Pending
					</Badge>
				</div>
				<CardDescription className="text-xs mt-0.5">
					Action items and follow-ups required for your role
				</CardDescription>
			</CardHeader>

			<CardContent className="p-4 flex-1 flex flex-col space-y-3 min-h-0">
				{/* Inline Add Task Form */}
				<form onSubmit={handleAddTodo} className="flex gap-2 shrink-0">
					<Input
						placeholder="Add quick action item..."
						value={newTodoTitle}
						onChange={(e) => setNewTodoTitle(e.target.value)}
						className="h-9 text-xs"
					/>
					<Button type="submit" size="sm" className="h-9 px-3 gap-1 font-semibold text-xs shrink-0">
						<Plus className="h-3.5 w-3.5" /> Add
					</Button>
				</form>

				{/* Todo Scrollable List */}
				<div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1.5 custom-dashboard-scroll flex-1">
					{todos.length === 0 ? (
						<div className="py-12 text-center text-muted-foreground text-xs border border-dashed rounded-xl flex items-center justify-center">
							No tasks pending! You are all caught up.
						</div>
					) : (
						todos.map((todo) => (
							<div
								key={todo.id}
								onClick={() => handleToggleTodo(todo.id)}
								className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
									todo.isCompleted
										? "bg-muted/40 opacity-60 border-muted"
										: "bg-card hover:bg-muted/30 border-border/80 hover:border-indigo-500/30"
								}`}
							>
								<Checkbox
									checked={todo.isCompleted}
									onCheckedChange={() => handleToggleTodo(todo.id)}
									className="mt-0.5"
								/>
								<div className="flex-1 min-w-0 space-y-1">
									<p
										className={`text-xs font-semibold leading-snug ${
											todo.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
										}`}
									>
										{todo.title}
									</p>
									<div className="flex items-center gap-2 text-[11px] text-muted-foreground">
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3 shrink-0" />
											{todo.dueDate}
										</span>
										<span className="text-muted-foreground/40">•</span>
										<span className="capitalize text-[10px] font-medium px-1.5 py-0.2 rounded bg-muted/60">
											{todo.roleCategory}
										</span>
									</div>
								</div>

								<Badge
									variant="outline"
									className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 shrink-0 ${
										todo.priority === "high"
											? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
											: todo.priority === "medium"
											? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
											: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30"
									}`}
								>
									{todo.priority}
								</Badge>
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}

