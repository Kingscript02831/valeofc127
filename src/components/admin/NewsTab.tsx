
import { useState } from "react";

interface NewsTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const NewsTab = ({ searchTerm, setSearchTerm }: NewsTabProps) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Buscar notícias..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      {/* News content will be implemented later */}
    </div>
  );
};

export default NewsTab;
