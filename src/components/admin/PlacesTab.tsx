
interface PlacesTabProps {
  searchPlaceTerm: string;
  setSearchPlaceTerm: (term: string) => void;
}

const PlacesTab = ({ searchPlaceTerm, setSearchPlaceTerm }: PlacesTabProps) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Buscar lugares..."
        value={searchPlaceTerm}
        onChange={(e) => setSearchPlaceTerm(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      {/* Places content will be implemented later */}
    </div>
  );
};

export default PlacesTab;
