import MainLayout from "../components/layout/MainLayout";
import SprintBoard from "../components/dashboard/SprintBoard";
import styles from "../styles/screens/Dashboard.module.css";


export default function SprintScreen() {
	return (
		<MainLayout title="Sprint">
			{/*Header*/}
				  <div className={styles.container}>
					<div className={styles.header}>
					  <h1>Sprint</h1>
					  <p style={{ paddingTop: "12px" }}>
						Esta es la vista general del progreso de tu equipo.
					  </p>
					</div>
			
					
					{/*SprintBoard */}
					<div className={styles.bottom}>
					  <SprintBoard />
				
					</div>
				  </div>
				</MainLayout>
		
	);
}
