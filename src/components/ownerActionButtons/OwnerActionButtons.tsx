"use client";

import { Button } from "@mui/material";
import { useIsOwner } from "../checkIsOwner/CheckIsOwner";
import styles from "./OwnerActionButtons.module.scss";

interface ButtonAction {
  label: string;
  onClick: () => void;
  color?: "primary" | "error" | "secondary";
  variant?: "text" | "contained" | "outlined";
  ariaLabel?: string;
}

const OwnerActionButtons = ({ actions }: { actions: ButtonAction[] }) => {
  const { isOwner } = useIsOwner();
  if (!isOwner) return null;

  return (
    <div className={styles.btnGroup}>
      {actions.map((action, index) => (
        <Button
          key={index}
          onClick={action.onClick}
          color={action.color || "primary"}
          variant={action.variant || "contained"}
          aria-label={action.ariaLabel || action.label}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};
export default OwnerActionButtons;
