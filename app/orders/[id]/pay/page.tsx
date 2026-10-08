import { PaymentScreen } from "../../../../components/order/payment-screen";

type PaymentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;
  return <PaymentScreen orderId={decodeURIComponent(id)} />;
}
