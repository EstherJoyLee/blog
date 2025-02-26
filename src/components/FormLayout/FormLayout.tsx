import { useMountedTheme } from "@/hooks/useMountedTheme";
import styles from "./FormLayout.module.scss";
import { setThemeClass } from "@/utils/setThemeClass";

interface FormLayoutProps {
  title: string;
  children: React.ReactNode;
  isPost?: boolean | string;
}

const FormLayout = ({ title, children, isPost = "" }: FormLayoutProps) => {
  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`commonWrapper ${setThemeClass(
        theme,
        styles.darkFormLayout,
        styles.formLayout
      )} ${isPost && styles.isPost}`}
    >
      <h1 className="commonTitle">{title}</h1>
      <div className="commonContent">{children}</div>
    </div>
  );
};

export default FormLayout;
