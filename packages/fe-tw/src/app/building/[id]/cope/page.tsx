import { CopeView } from "@/components/Cope/CopeView";
import { useBuildings } from "@/hooks/useBuildings";
import { notFound } from "next/navigation";

// TODO: replace mock admin check function
function isAdmin(): boolean {
  return true;
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CopePage({ params }: Props) {
  const { id } = await params;
  const { buildings } = useBuildings();
  const building = buildings.find((b) => b.id === id);

  if (!building) {
    notFound();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        COPE Metadata for Building: {building.title}
      </h1>
      <CopeView buildingId={id} isAdmin={isAdmin()} />
    </div>
  );
}
