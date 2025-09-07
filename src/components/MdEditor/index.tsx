import { Editor } from "@bytemd/react";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import "bytemd/dist/index.css";
import "highlight.js/styles/vs.css";
import "./index.css";
import "github-markdown-css/github-markdown-light.css";
import frontmatter from "@bytemd/plugin-frontmatter";
import math from "@bytemd/plugin-math";
import mermaid from "@bytemd/plugin-mermaid";
import myAxios from "@/libs/request";

const plugins = [gfm(), highlight(), frontmatter(), math(), mermaid()];

interface Props {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}

const MdEditor = (props: Props) => {
  const { value = "", onChange, placeholder } = props;

  const handleUploadImages = async (files: File[]) => {
    const results = await Promise.all(
      files.map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          return {
            url: "图片大小不能超过 5M",
          };
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
          const res: any = await myAxios.post(
            "/image/blog/image/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (res?.code === 0) {
            return {
              url: res.data,
            };
          }
          return {
            url: res.message,
          };
        } catch (error) {
          console.error("图片上传失败:", error);
          return {
            url: "上传失败",
          };
        }
      })
    );
    return results;
  };

  return (
    <div className="md-editor">
      <Editor
        value={value}
        placeholder={placeholder}
        mode="split"
        plugins={plugins}
        onChange={onChange}
        uploadImages={handleUploadImages}
      />
    </div>
  );
};

export default MdEditor;
