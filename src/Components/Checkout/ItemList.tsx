import React from "react";

interface ItemListProps {
  left?: string;
  middle?: string;
  right: string;
  total?: true;
}

const ItemList: React.FC<ItemListProps> = ({
  left = "",
  middle = "",
  right,
  total,
}) => {
  return (
    <div className="flex py-1 text-neutral-500">
      <div className="w-10/12">{left}</div>
      <div className={`${total && "pt-3"} w-2/12 text-center`}>{middle}</div>
      <div className={`${total && "border-t pt-3"} w-2/12 text-right`}>
        {right}
      </div>
    </div>
  );
};

export default ItemList;
