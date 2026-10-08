import { OrderReviewScreen } from "@/components/order/order-review-screen";

type OrderReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderReviewPage({
  params,
}: OrderReviewPageProps) {
  const { id } = await params;
  return <OrderReviewScreen orderId={id} />;
}
