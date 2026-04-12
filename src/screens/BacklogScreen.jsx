import MainLayout from "../components/layout/MainLayout";
import BacklogPanel from "../components/backlog/BacklogPanel";
import styles from "../styles/screens/Backlog.module.css";

export default function BacklogScreen() {
  return (
    <MainLayout title="Backlog">
        {/*Header*/}
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>Backlog</h1>                
              <p style={{ paddingTop: "12px" }}>
                Encuentra aquí todas las tareas y planeación futura.
              </p>
            </div>
          
              
            {/*BacklogPanel */}
            <div className={styles.bottom}>
              <BacklogPanel />
            
            </div>
          </div>
        </MainLayout>
        
  );
}
    
