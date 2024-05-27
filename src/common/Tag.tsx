import { XMarkIcon } from "@heroicons/react/24/solid";
import { Badge, BadgeProps } from "@tremor/react";
import React from "react";

export interface TagProps extends BadgeProps {
  tag: string;
  onRemoveTag?: (tag: string) => void;
}

const Tag: React.FC<TagProps> = ({ tag, onRemoveTag, ...props }) => {
  return (
    <Badge
      icon={onRemoveTag ? XMarkIcon : undefined}
      className="hover:cursor-pointer hover:opacity-90 active:opacity-80"
      onClick={onRemoveTag ? () => onRemoveTag(tag) : undefined}
      {...props}
    >
      {tag}
    </Badge>
  );
};

export default Tag;
