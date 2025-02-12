
import { useSiteConfig } from "@/hooks/useSiteConfig";

const SubNav4 = ({ bio }: { bio?: string }) => {
  const { data: config } = useSiteConfig();

  if (!bio) return null;

  return (
    <nav 
      className="w-full border-b mt-16 shadow-sm"
      style={{ 
        background: "#222222",
        borderColor: "#333333"
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="py-2 text-sm text-gray-300">
          {bio}
        </div>
      </div>
    </nav>
  );
};

export default SubNav4;
