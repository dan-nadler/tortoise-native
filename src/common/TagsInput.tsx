import { TextInput } from "@tremor/react";
import React, { useRef } from "react";
import TagsInput, { ReactTagsInputProps } from "react-tagsinput";
import Tag from "./Tag";

interface MyTagsInputProps extends ReactTagsInputProps {
  onRemoveTag: (tag: string) => void;
}

const MyTagsInput: React.FC<MyTagsInputProps> = (props) => {
  const tagRef = useRef<HTMLInputElement>(null);

  return (
    <TagsInput
      {...props}
      className="w-full"
      renderInput={({ value, onChange, addTag }) => (
        <TextInput
          placeholder="Add tags"
          value={value}
          ref={tagRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              tagRef.current?.value && addTag(tagRef.current.value);
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            onChange(e);
            if (
              e.target.value.includes(",") ||
              e.target.value.includes(";") ||
              e.target.value.includes(" ")
            ) {
              addTag(e.target.value.trim().replace(/[ ,;]+$/, ""));
            }
          }}
          onBlur={(e) => e.target.value && addTag(e.target.value)}
        />
      )}
      renderTag={({ tag, key }) => {
        return <Tag key={key} onRemoveTag={props.onRemoveTag} tag={tag} />;
      }}
      renderLayout={(tagComponents, inputComponent) => (
        <div className="flex flex-col flex-wrap gap-4">
          <div className="flex flex-row flex-wrap gap-2">{tagComponents}</div>
          {inputComponent}
        </div>
      )}
    />
  );
};

export default MyTagsInput;
