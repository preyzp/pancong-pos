import { OrderDetailScreen } from "@/components/order/order-detail-screen";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailScreen orderId={decodeURIComponent(id)} />;
}
