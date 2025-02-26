"use client";

import { useMemo, useState, useEffect } from "react";
import {
  createEditor,
  Transforms,
  Editor,
  Element as SlateElement,
} from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { Button } from "@mui/material";

// 📌 Slate.js에서 사용할 블록 요소 타입
const ELEMENT_IMAGE = "image";

// 📌 Slate.js 에디터 초기 값
const initialValue = [
  {
    type: "paragraph",
    children: [
      { text: "이미지 업로드 후, 드래그로 이동 및 크기 조절이 가능합니다." },
    ],
  },
];

// 📌 이미지 블록 컴포넌트 (크기 조절 가능)
const ImageElement = ({ attributes, children, element }) => {
  const [size, setSize] = useState(element.width || 300); // 초기 크기 설정

  // Slate.js 상태 업데이트
  useEffect(() => {
    if (element.width !== size) {
      Transforms.setNodes(
        Editor,
        { width: size },
        { at: [] } // 해당 블록 전체 업데이트
      );
    }
  }, [size, element.width]);

  // 크기 조절 핸들러
  const handleResize = (e) => {
    e.preventDefault();
    const newSize = size + e.movementX;
    if (newSize >= 50) {
      setSize(newSize);
    }
  };

  return (
    <div
      {...attributes}
      contentEditable={false}
      style={{ display: "inline-block", position: "relative" }}
    >
      <img
        src={element.url}
        alt="uploaded"
        draggable="true"
        style={{
          maxWidth: "100%",
          width: `${size}px`,
          cursor: "grab",
          userSelect: "none",
        }}
      />
      {children}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          document.addEventListener("mousemove", handleResize);
          document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", handleResize);
          });
        }}
        style={{
          width: "10px",
          height: "10px",
          background: "gray",
          position: "absolute",
          right: "-5px",
          bottom: "-5px",
          cursor: "se-resize",
        }}
      />
    </div>
  );
};

// 📌 Slate.js 블록 렌더링 정의
const renderElement = (props) => {
  switch (props.element.type) {
    case ELEMENT_IMAGE:
      return <ImageElement {...props} />;
    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

// 📌 이미지 삽입 버튼
const InsertImageButton = ({ editor }) => {
  const insertImage = (url) => {
    const image = {
      type: ELEMENT_IMAGE,
      url,
      children: [{ text: "" }],
    };
    Transforms.insertNodes(editor, image);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        insertImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="upload-img"
      />
      <label htmlFor="upload-img">
        <Button component="span" variant="contained">
          이미지 추가
        </Button>
      </label>
    </>
  );
};

// 📌 메인 Slate.js 에디터 컴포넌트
export default function SlateEditor() {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={(value) => console.log(value)}
    >
      <InsertImageButton editor={editor} />
      <Editable
        renderElement={renderElement}
        placeholder="텍스트를 입력하세요..."
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "200px",
          whiteSpace: "pre-wrap",
        }}
      />
    </Slate>
  );
}
