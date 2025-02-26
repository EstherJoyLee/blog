import { Button } from "@mui/material";
import styles from "./Button.module.scss";

interface CustomButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "outlined" | "contained" | "text";
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
}

const CustomButton = ({
  text,
  onClick,
  type = "button",
  variant,
  color,
}: CustomButtonProps) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      variant={variant}
      color={color}
      className={styles.CustomButton}
    >
      {text}
    </Button>
  );
};

export default CustomButton;
