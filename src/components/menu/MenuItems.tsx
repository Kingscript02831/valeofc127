
import { Link } from "react-router-dom";
import { MenuItem } from "./types";

interface MenuItemsProps {
  items: MenuItem[];
  onItemClick: () => void;
}

export const MenuItems = ({ items, onItemClick }: MenuItemsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onItemClick}
          className="flex flex-col items-center p-3 rounded-xl hover:bg-accent/10 transition-colors duration-200 group"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-2 group-hover:bg-primary/20 transition-colors duration-200">
            <img
              src={`/${item.icon}.png`}
              alt={item.label}
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="text-xs font-medium text-center text-foreground">{item.label}</span>
        </Link>
      ))}
    </div>
  );
};
