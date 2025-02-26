import React, { useState } from "react";
import styles from "./Input.module.scss";
import { IconButton, Button } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import MarkdownRenderer from "@/components/markdownRenderer/MarkdownRenderer";
import { setThemeClass } from "@/utils/setThemeClass";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import Image from "next/image";
interface InputProps {
  type: string;
  value?: string;
  placeholder?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPassword?: boolean;
  pattern?: string;
  isRequired?: boolean;
  label?: string;
  className?: string;
  error?: string;
  accept?: string;
  checked?: boolean;
  isEditMode?: boolean;
  currentImageUrl?: string;
  setImage?: (file: File | null) => void;
  handleDeleteImage?: () => void;
  name?: string;
}

const Input = ({
  type,
  placeholder,
  value,
  onChange,
  pattern,
  isPassword,
  isRequired,
  label,
  onBlur,
  error,
  accept,
  checked,
  isEditMode = false, // 기본값 false
  currentImageUrl,
  setImage,
  handleDeleteImage,
  name,
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useMountedTheme();

  return (
    <div
      className={setThemeClass(theme, styles.darkInputGroup, styles.inputGroup)}
    >
      {/* ✅ 체크박스 타입일 경우 UI 변경 */}
      {type === "checkbox" ? (
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className={styles.checkboxInput}
          />
          <span className={styles.checkboxCustom}></span>
          {label && <span className={styles.checkboxText}>{label}</span>}
        </label>
      ) : (
        <>
          {label && (
            <label>
              {label} {isRequired && <b>*</b>}
            </label>
          )}

          <div className={styles.input}>
            {/* ✅ 게시물 수정 모드일 때 이미지 수정 UI 추가 */}
            {isEditMode &&
            label === "이미지 수정" &&
            setImage &&
            handleDeleteImage ? (
              <div className={styles.editImage}>
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
                {currentImageUrl ? (
                  <div>
                    <Image
                      alt="게시물 이미지"
                      src={currentImageUrl}
                      width={300}
                      height={200}
                      style={{ objectFit: "cover" }}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleDeleteImage}
                    >
                      이미지 삭제
                    </Button>
                  </div>
                ) : (
                  <p>이미지를 불러올 수 없습니다.</p>
                )}
              </div>
            ) : label?.includes("내용") ? (
              <div className={styles.markdownWrapper}>
                <textarea
                  placeholder={placeholder}
                  value={value}
                  onChange={onChange}
                  required={isRequired}
                  className={styles.textarea}
                  name={name}
                ></textarea>

                {label !== "이메일 내용" && (
                  <div>
                    <MarkdownRenderer
                      content={value || "미리보기가 여기에 표시됩니다."}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <input
                  type={isPassword && showPassword ? "text" : type}
                  value={value}
                  placeholder={placeholder}
                  onChange={onChange}
                  onBlur={onBlur}
                  pattern={pattern}
                  required={isRequired}
                  accept={accept}
                  name={name}
                />
                {isPassword && (
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={styles.inputButton}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )}
              </>
            )}
          </div>

          {error && <p className="commonErrorMessages">{error}</p>}
        </>
      )}
    </div>
  );
};

export default Input;
