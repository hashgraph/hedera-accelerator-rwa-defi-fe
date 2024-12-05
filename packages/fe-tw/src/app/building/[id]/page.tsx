import { PageRedirect } from "@/components/Page/PageRedirect";
import { BuildingDetailPage } from "@/components/Pages/BuildingDetailPage";
import { buildings } from "@/consts/props";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function Home({ params }: Props) {
    const { id } = await params;

    const buildingData = buildings.find(one => one.id === parseInt(id, 10));

    return (
        <PageRedirect notFound={!buildingData}>
            <BuildingDetailPage {...buildingData!} />
        </PageRedirect>
    );
}
