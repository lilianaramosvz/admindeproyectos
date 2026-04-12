import styles from "../../styles/components/ui/Avatar.module.css";

export default function Avatar({ initials }) {
  return (
    <div className={styles.avatar}>
      {initials}
    </div>
  );
}