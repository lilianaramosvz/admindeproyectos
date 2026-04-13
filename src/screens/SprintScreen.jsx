import MainLayout from "../components/layout/MainLayout";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import { sprintTasks } from "../components/dashboard/SprintBoard";
import { Calendar, Clock } from "lucide-react";
import styles from "../styles/screens/SprintScreen.module.css";


export default function SprintScreen() {
	return (
		<MainLayout title="Sprint">
			<div className={styles.container}>
				<div className={styles.header}>
					<h1>Sprint</h1>
					<p>Esta es la vista general del progreso de tu equipo.</p>
				</div>

				<section className={styles.board} aria-label="Sprint board">
					{sprintTasks.map((column) => (
						<div key={column.title} className={styles.column}>
							<div className={styles.columnHeader}>
								<span className={styles.columnTitle}>{column.title}</span>
								<span className={styles.count}>{column.tasks.length}</span>
							</div>

							<div className={styles.tasks}>
								{column.tasks.map((task) => (
									<article key={task.id} className={styles.task}>
										<div className={styles.taskHeader}>
											<span className={styles.taskTitle}>{task.title}</span>
											<Badge type={task.priority}>{task.priority}</Badge>
										</div>

										<div className={styles.taskId}>{task.id}</div>

										<div className={styles.taskMeta}>
											<span className={styles.metaItem}>
												<Clock size={16} />
												{task.hours}
											</span>
											<span className={styles.metaItem}>
												<Calendar size={16} />
												{task.date}
											</span>
										</div>

										<div className={styles.taskFooter}>
											<Avatar initials={task.assignee} />
											<span>{task.name}</span>
										</div>
									</article>
								))}
							</div>
						</div>
					))}
				</section>
			</div>
				</MainLayout>
		
	);
}
