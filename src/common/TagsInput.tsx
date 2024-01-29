import { XMarkIcon } from "@heroicons/react/24/solid";
import { TextInput, Badge } from "@tremor/react";
import React, { MouseEventHandler, useRef } from "react";
import TagsInput, { ReactTagsInputProps } from "react-tagsinput";

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
                addTag(e.target.value.trim().replace(/[ ,;]+$/, ''));
            }
          }}
          onBlur={(e) => e.target.value && addTag(e.target.value)}
        />
      )}
      renderTag={({ tag }) => {
        return (
          <Badge
            icon={XMarkIcon}
            className="hover:cursor-pointer hover:opacity-90 active:opacity-80"
            onClick={() => props.onRemoveTag(tag)}
          >
            {tag}
          </Badge>
        );
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
